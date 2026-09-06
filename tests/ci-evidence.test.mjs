import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import {
  CI_JOB_RESULT_FIELDS,
  resultIdentity,
  timeoutMinutes,
  validateCiJobResult,
  workflowCancelsInProgress,
  workflowConcurrencyKey,
} from '../tooling/ci/evidence.mjs'

const head = '1'.repeat(40)
const base = '2'.repeat(40)
const sample = {
  schema: 'cordisx/ci-job-result/v1',
  repo: 'cordisx/cordisx',
  head,
  base,
  gateVersion: 'host-check-v2',
  classification: 'changed-tests',
  job: 'changed-tests',
  environment: 'github-hosted/ubuntu-latest/node22',
  startedAt: '2026-09-06T12:00:00Z',
  completedAt: '2026-09-06T12:00:30Z',
  durationSeconds: 30,
  cache: 'hit',
  result: 'success',
  evidenceUrl: 'https://github.com/cordisx/cordisx/actions/runs/1',
}

test('same PR heads share one cancellation key while different PRs do not', () => {
  const first = workflowConcurrencyKey({ workflow: 'Check', eventName: 'pull_request', pullRequestNumber: 7 })
  const nextHead = workflowConcurrencyKey({ workflow: 'Check', eventName: 'pull_request', pullRequestNumber: 7 })
  const otherPr = workflowConcurrencyKey({ workflow: 'Check', eventName: 'pull_request', pullRequestNumber: 8 })
  assert.equal(first, nextHead)
  assert.notEqual(first, otherPr)
  assert.equal(workflowCancelsInProgress('pull_request'), true)
})

test('main and release refs never cancel in-progress work', () => {
  assert.equal(
    workflowConcurrencyKey({ workflow: 'Check', eventName: 'push', ref: 'refs/heads/main' }),
    'Check-refs/heads/main',
  )
  assert.equal(workflowCancelsInProgress('push'), false)
  assert.equal(workflowCancelsInProgress('workflow_dispatch'), false)
})

test('result identity changes with head, base, gate, classification, or environment', () => {
  const original = resultIdentity(sample)
  for (
    const [field, value] of [
      ['head', '3'.repeat(40)],
      ['base', '4'.repeat(40)],
      ['gateVersion', 'host-check-v3'],
      ['classification', 'changed-build'],
      ['environment', 'github-hosted/ubuntu-latest/node24'],
    ]
  ) {
    assert.notEqual(resultIdentity({ ...sample, [field]: value }), original)
  }
})

test('v1 metadata has one stable closed field set', async () => {
  assert.deepEqual(Object.keys(validateCiJobResult(sample)).sort(), [...CI_JOB_RESULT_FIELDS].sort())
  assert.throws(() => validateCiJobResult({ ...sample, extra: true }), /fields do not match/u)
  const schema = JSON.parse(await readFile(new URL('../tooling/ci/job-result.v1.schema.json', import.meta.url)))
  assert.deepEqual([...schema.required].sort(), [...CI_JOB_RESULT_FIELDS].sort())
  assert.equal(schema.additionalProperties, false)
})

test('timeouts preserve the full Host gate and bound lighter classifications', () => {
  assert.equal(timeoutMinutes('cordisx/cordisx', 'full'), 40)
  assert.equal(timeoutMinutes('cordisx/cordisx', 'changed-quality'), 10)
  assert.equal(timeoutMinutes('cordisx/cordisx', 'changed-tests'), 20)
  assert.equal(timeoutMinutes('cordisx/cordisx-protocol', 'full'), 15)
  assert.equal(timeoutMinutes('cordisx/plugin-chatroom', 'full'), 15)
  assert.equal(timeoutMinutes('cordisx/plugin-chatroom', 'changed-typecheck'), 10)
})

test('owner workflows use PR-scoped cancellation and never use result-marker caches', async () => {
  const workflows = [
    new URL('../vendors/cordisx/cordisx-protocol/.github/workflows/check.yml', import.meta.url),
    new URL('../vendors/cordisx/cordisx/.github/workflows/check.yml', import.meta.url),
    new URL('../vendors/cordisx/plugin-chatroom/.github/workflows/ci.yml', import.meta.url),
  ]
  for (const workflow of workflows) {
    const source = await readFile(workflow, 'utf8')
    assert.match(
      source,
      /group: \$\{\{ github\.workflow \}\}-\$\{\{ github\.event\.pull_request\.number \|\| github\.ref \}\}/u,
    )
    assert.match(source, /cancel-in-progress: \$\{\{ github\.event_name == 'pull_request' \}\}/u)
    assert.doesNotMatch(source, /actions\/cache\/(?:restore|save)|result-cache/u)
    assert.match(source, /cordisx\/ci-job-result\/v1/u)
  }
})
