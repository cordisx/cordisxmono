import packageMetadata from '../../package.json' with { type: 'json' }

export default {
  name: 'cordisx/source-policy',
  linterOptions: {
    noInlineConfig: true,
  },
  settings: {
    'cordisx/policyVersion': packageMetadata.version,
  },
  rules: {
    'max-lines': ['error', {
      max: 1000,
      skipBlankLines: false,
      skipComments: false,
    }],
  },
}
