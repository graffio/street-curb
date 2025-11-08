/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
    stories: ['../stories/*.stories.@(js|jsx)', '../src/**/*.stories.@(js|jsx)'],
    addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
    framework: { name: '@storybook/react-vite' },
}

export default config
