import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './test',
    testMatch: '**/*.playwright.js',
    fullyParallel: true /* Run tests in files in parallel */,
    forbidOnly: !!process.env.CI /* Fail the build on CI if you accidentally left test.only in the source code. */,
    retries: process.env.CI ? 2 : 0 /* Retry on CI only */,
    workers: process.env.CI ? 1 : undefined /* Opt out of parallel tests on CI. */,
    reporter: 'html' /* Reporter to use. See https://playwright.dev/docs/test-reporters */,

    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        baseURL: 'http://localhost:6006' /* Base URL to use in actions like `await page.goto('/')`. */,
        trace: 'on-first-retry' /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */,
    },

    /* Configure projects for major browsers */
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run storybook',
        url: 'http://localhost:6006',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
})
