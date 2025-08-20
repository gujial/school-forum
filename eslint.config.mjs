import withNuxt from './.nuxt/eslint.config.mjs';
import prettierPlugin from 'eslint-plugin-prettier';

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
            '**/server/config/**',
        ],
    },
    {
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            // 控制台警告
            'no-console': ['warn', { allow: ['warn', 'error'] }],

            // 未使用的变量
            'no-unused-vars': [
                'warn',
                { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],

            // TypeScript 允许 any
            '@typescript-eslint/no-explicit-any': 'off',

            // Vue 插槽报错关闭
            'vue/valid-v-slot': 'off',
            'vue/html-self-closing': 'off',

            // Prettier 集成
            'prettier/prettier': [
                'error',
                {
                    singleQuote: true,
                    semi: true,
                    trailingComma: 'all',
                    printWidth: 100,
                    tabWidth: 4,
                    bracketSpacing: true,
                    arrowParens: 'always',
                    vueIndentScriptAndStyle: true,
                },
            ],
        },
    },
]);
