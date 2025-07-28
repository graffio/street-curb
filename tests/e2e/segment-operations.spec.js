import { test, expect } from '@playwright/test'

test.describe('Curb Table Integration', () => {
    // Helper functions to reduce duplication
    const selectBlockface = async (page, id, length) => {
        await page.evaluate(
            ({ id, length }) => {
                window.blockfaceAPI.select({
                    id,
                    length,
                    feature: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } },
                })
            },
            { id, length },
        )
    }

    const enableTableView = async page => {
        await expect(page.locator('h2')).toContainText('Edit Blockface')
        const tableCheckbox = page.locator('input[type="checkbox"]')
        await tableCheckbox.check()
        await expect(page.locator('h3')).toContainText('Curb Configuration')
    }

    const setupBlockfaceWithTableView = async (page, id, length) => {
        await selectBlockface(page, id, length)
        await enableTableView(page)
    }

    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto('/')

        // Wait for the application to fully load
        await expect(page.locator('h1')).toContainText('Row Canvas')
        await expect(page.locator('.mapboxgl-canvas')).toBeVisible()
        await page.waitForFunction(() => window.blockfaceAPI !== undefined)
    })

    test('should load the main interface with map and API', async ({ page }) => {
        // Given the application loads
        // When the page is ready
        // Then the main interface should be visible with map and API available
        await expect(page.locator('h1')).toContainText('Row Canvas')
        await expect(page.locator('.mapboxgl-canvas')).toBeVisible()
        await page.waitForFunction(() => window.blockfaceAPI !== undefined)
    })

    test('should open editor panel when blockface is selected', async ({ page }) => {
        // Given a blockface is selected via API
        await selectBlockface(page, 'test-blockface-1', 240)

        // Then the editor panel should slide in with correct title
        await expect(page.locator('h2')).toContainText('Edit Blockface')
        await expect(page.locator('h2')).toBeVisible()
    })

    test('should enable table view and display curb configuration', async ({ page }) => {
        // Given a blockface is selected
        await selectBlockface(page, 'test-blockface-2', 300)

        // When table view is enabled
        await enableTableView(page)

        // Then the curb configuration table should be visible
        await expect(page.locator('table')).toBeVisible()
    })

    test('should display initial segments with correct table structure', async ({ page }) => {
        // Given a blockface is selected and table view is enabled
        await setupBlockfaceWithTableView(page, 'test-blockface-3', 250)

        // Then the table should have correct structure and initial segments
        // Verify table headers (Type, Length, Start, Add)
        const tableHeaders = page.locator('th')
        await expect(tableHeaders).toHaveCount(4)

        // Verify initial segments are displayed
        const tableRows = page.locator('tbody tr')
        await expect(tableRows).toHaveCount(3)

        // Verify first row has interactive type button
        const firstTypeButton = tableRows.first().locator('.type-button')
        await expect(firstTypeButton).toBeVisible()
    })

    test('should open number pad when length cell is clicked', async ({ page }) => {
        // Given a blockface is selected and table view is enabled
        await setupBlockfaceWithTableView(page, 'test-blockface-4', 280)

        // When a length cell is clicked
        const lengthCells = page.locator('.length-cell')
        await expect(lengthCells.first()).toBeVisible()
        await lengthCells.first().click()

        // Then the number pad should open for editing
        await expect(page.locator('.number-pad-backdrop')).toBeVisible()
    })

    test('should show type dropdown when type button is clicked', async ({ page }) => {
        // Given a blockface is selected and table view is enabled
        await setupBlockfaceWithTableView(page, 'test-blockface-5', 320)

        // When a type button is clicked
        const typeButtons = page.locator('.type-button')
        await expect(typeButtons.first()).toBeVisible()
        await typeButtons.first().click()

        // Then the type selection dropdown should appear
        await expect(page.locator('.curb-dropdown-item').first()).toBeVisible()
    })

    test('should display blockface summary information in table view', async ({ page }) => {
        // Given a blockface is selected and table view is enabled
        await setupBlockfaceWithTableView(page, 'test-blockface-6', 350)

        // Then blockface summary information should be displayed
        const blockfaceInfo = page.locator('.blockface-info')
        await expect(blockfaceInfo).toBeVisible()
        await expect(blockfaceInfo).toContainText('Total:')
    })
})
