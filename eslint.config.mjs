// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

// 使用 Nuxt 预设并追加自定义配置（Flat config）
export default withNuxt([
  {
    // 忽略生成产物与二进制/静态目录
    ignores: [
      '**/.nuxt/**',
      '**/.output/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/dynamic/**',
      '**/docs/api/**',
    ],
  },
  {
    // 服务器端 Node 环境的额外规则
    files: ['server/**/*.ts'],
    rules: {
      // 允许在服务端使用 console，但尽量以 warn/error 为主
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // 减少未使用变量的噪音（常用于占位形参）
      'no-unused-vars': [
        'warn',
        { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
])
