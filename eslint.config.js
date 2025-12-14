// ABOUTME: ESLint configuration for the monorepo
// ABOUTME: Includes stylistic rules, React, Storybook, and custom arrow-expression-body rule
import { FlatCompat } from '@eslint/eslintrc'
import stylistic from '@stylistic/eslint-plugin'
import eslintPluginReact from 'eslint-plugin-react'
import storybook from 'eslint-plugin-storybook'
import { defineConfig } from 'eslint/config'
import path from 'path'

const compat = new FlatCompat({ baseDirectory: path.resolve() })

// Checks if arrow function has unnecessary braces around single expression
// @sig checkArrowBody :: (Context, Node) -> void
const checkArrowBody = (context, node) => {
    const hasUnnecessaryBraces =
        node.body.type === 'BlockStatement' &&
        node.body.body.length === 1 &&
        node.body.body[0].type === 'ExpressionStatement'

    if (hasUnnecessaryBraces)
        context.report({
            node,
            message: 'Unnecessary braces around single expression',
            fix: fixer => fixer.replaceText(node.body, context.sourceCode.getText(node.body.body[0].expression)),
        })
}

// ESLint rule: enforce concise arrow function bodies
// @sig arrowExpressionBodyRule :: { meta: Object, create: Context -> Object }
const arrowExpressionBodyRule = {
    meta: { type: 'suggestion', fixable: 'code' },
    create: context => ({ ArrowFunctionExpression: node => checkArrowBody(context, node) }),
}

export default defineConfig([
    { ignores: ['**/dist/*.js', '**/docs/**/*.js', '**/src/types/*.js'] },
    ...compat.extends('standard'),
    ...compat.extends('prettier'),
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: { globals: { browser: true } },
        plugins: {
            '@stylistic': stylistic,
            react: eslintPluginReact,
            custom: { rules: { 'arrow-expression-body': arrowExpressionBodyRule } },
        },
        rules: {
            '@stylistic/lines-around-comment': [
                'error',
                {
                    beforeBlockComment: true,
                    beforeLineComment: true,
                    allowBlockStart: true,
                    allowObjectStart: true,
                    allowArrayStart: true,
                    allowClassStart: true,
                },
            ],
            'custom/arrow-expression-body': 'error',
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
    { files: ['**/store/reducer.js', '**/store/selectors/**/*.js'], rules: { 'no-restricted-syntax': 'off' } },
    { files: ['**/*.stories.{js,jsx}'], plugins: { storybook }, rules: { ...storybook.configs.recommended.rules } },
])
