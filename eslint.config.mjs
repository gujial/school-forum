// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

// 使用 Nuxt 预设并追加自定义配置（Flat config）
export default withNuxt([
  {
    // 全局忽略目录
    ignores: [
      '**/.nuxt/**',
      '**/.output/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/dynamic/**',
      '**/docs/api/**',
      '**/scripts/**',
      '**/server/config**'
    ],
  },
  {
    // 全局规则
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': [
        'warn',
        { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/valid-v-slot': 'off'
    },
  },
])
