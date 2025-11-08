const config = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx)'],
    addons: ['@chromatic-com/storybook', '@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
    framework: { name: '@storybook/react-vite' },
}
export default config
