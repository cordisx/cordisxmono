import { defineConfig, globalIgnores } from 'eslint/config'
import policy from './tooling/quality/eslint-policy.mjs'

export default defineConfig([
  globalIgnores(['vendors/**', 'node_modules/**']),
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [policy],
  },
])
