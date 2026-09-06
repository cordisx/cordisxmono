const objectId = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/u
const repository = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u
const timestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u

export const CI_JOB_RESULT_SCHEMA = 'cordisx/ci-job-result/v1'
export const CI_JOB_RESULT_FIELDS = Object.freeze([
  'schema',
  'repo',
  'head',
  'base',
  'gateVersion',
  'classification',
  'job',
  'environment',
  'startedAt',
  'completedAt',
  'durationSeconds',
  'cache',
  'result',
  'evidenceUrl',
])

const timeouts = Object.freeze({
  'cordisx/cordisx-protocol': Object.freeze({ full: 15 }),
  'cordisx/cordisx': Object.freeze({
    main: 40,
    full: 40,
    'changed-quality': 10,
    'changed-typecheck': 15,
    'changed-build': 15,
    'changed-tests': 20,
  }),
  'cordisx/plugin-chatroom': Object.freeze({
    main: 15,
    full: 15,
    'changed-typecheck': 10,
    'build-test': 15,
  }),
})

function nonempty(value, label) {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} must be a non-empty string`)
}

export function workflowConcurrencyKey({ workflow, eventName, pullRequestNumber, ref }) {
  nonempty(workflow, 'workflow')
  if (eventName === 'pull_request') {
    if (!Number.isSafeInteger(pullRequestNumber) || pullRequestNumber < 1) {
      throw new Error('pullRequestNumber must be a positive integer')
    }
    return `${workflow}-${pullRequestNumber}`
  }
  nonempty(ref, 'ref')
  return `${workflow}-${ref}`
}

export function workflowCancelsInProgress(eventName) {
  return eventName === 'pull_request'
}

export function resultIdentity(value) {
  return JSON.stringify([
    value.repo,
    value.head,
    value.base,
    value.gateVersion,
    value.classification,
    value.environment,
  ])
}

export function timeoutMinutes(repo, classification) {
  const value = timeouts[repo]?.[classification]
  if (value === undefined) throw new Error(`no timeout for ${repo} ${classification}`)
  return value
}

export function validateCiJobResult(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('CI result must be an object')
  }
  const keys = Object.keys(value).sort()
  const expected = [...CI_JOB_RESULT_FIELDS].sort()
  if (JSON.stringify(keys) !== JSON.stringify(expected)) throw new Error('CI result fields do not match v1')
  if (value.schema !== CI_JOB_RESULT_SCHEMA) throw new Error('CI result schema does not match v1')
  if (!repository.test(value.repo)) throw new Error('repo must be an owner/name slug')
  if (!objectId.test(value.head) || !objectId.test(value.base)) throw new Error('head and base must be exact Git IDs')
  for (const field of ['gateVersion', 'classification', 'job', 'environment']) nonempty(value[field], field)
  if (!timestamp.test(value.startedAt) || !timestamp.test(value.completedAt)) {
    throw new Error('timestamps must use second-precision UTC')
  }
  if (!Number.isSafeInteger(value.durationSeconds) || value.durationSeconds < 0) {
    throw new Error('durationSeconds must be a non-negative integer')
  }
  if (!['hit', 'miss'].includes(value.cache)) throw new Error('cache must be hit or miss')
  if (!['success', 'failure', 'cancelled'].includes(value.result)) throw new Error('result is invalid')
  try {
    const url = new URL(value.evidenceUrl)
    if (url.protocol !== 'https:') throw new Error('evidenceUrl must use HTTPS')
  } catch {
    throw new Error('evidenceUrl must be an HTTPS URL')
  }
  return Object.freeze({ ...value })
}
