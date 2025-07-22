// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import { FlatCompat } from '@eslint/eslintrc'
import eslintPluginReact from 'eslint-plugin-react'
import { defineConfig } from 'eslint/config'
import path from 'path'

const compat = new FlatCompat({ baseDirectory: path.resolve() })

export default defineConfig([
    { ignores: ['**/dist/*.js'] },
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
            curly: ['error', 'multi-line', 'consistent'],
            'arrow-body-style': ['error', 'as-needed'],
            'prefer-const': 'error',
        },
    },
    { files: ['**/*.stories.{js,jsx}'], plugins: { storybook }, rules: { ...storybook.configs.recommended.rules } },
    ...compat.extends('standard'),
    ...compat.extends('prettier'),
])
