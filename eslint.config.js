// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import { FlatCompat } from '@eslint/eslintrc'
import eslintPluginReact from 'eslint-plugin-react'
import storybook from 'eslint-plugin-storybook'
import { defineConfig } from 'eslint/config'
import path from 'path'

const compat = new FlatCompat({ baseDirectory: path.resolve() })

export default defineConfig([
    { ignores: ['**/dist/*.js', '**/docs/**/*.js', '**/src/types/*.js'] },
    ...compat.extends('standard'),
    ...compat.extends('prettier'),
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: { globals: { browser: true } },
        plugins: { react: eslintPluginReact },
        rules: {
            semi: 'error',
            'react/jsx-uses-react': 'error',
            'react/jsx-uses-vars': 'error',
            'object-shorthand': 'error',
            'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
            curly: ['error', 'multi', 'consistent'],
            'arrow-body-style': ['error', 'as-needed'],
            'prefer-const': 'error',
            'no-restricted-syntax': [
                'error',
                {
                    selector: "MemberExpression[object.name='state']",
                    message:
                        'Direct state access (state.xxx) not allowed. Use selectors from store/selectors.js instead.',
                },
            ],
        },
    },
    { files: ['**/store/reducer.js', '**/store/selectors.js'], rules: { 'no-restricted-syntax': 'off' } },
    { files: ['**/*.stories.{js,jsx}'], plugins: { storybook }, rules: { ...storybook.configs.recommended.rules } },
])
