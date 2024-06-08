// @ts-check
// import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // antfu(),
  {
    ignores: ['components/ui', 'scripts/build-map.js'],
  },
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-console': 'off',
      'node/prefer-global/process': 'off',
      'vue/no-v-html': 'off',
    },
  },
)
