import { expect, test } from '@playwright/test'

/**
 * Focused Playwright tests for SegmentedCurbEditor component
 *
 * Tests user workflows and business logic, not implementation details
 */

test.describe('SegmentedCurbEditor - User Workflows', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/test.html')
        await page.waitForSelector('.segment-container, .add-segment-button', { timeout: 10000 })
        await page.waitForTimeout(200)
    })

    test('user can add first segment to empty editor', async ({ page }) => {
        // Setup empty editor
        await page.evaluate(() => window.setTestConfig?.('empty'))
        await page.waitForTimeout(100)

        // Verify empty state
        await expect(page.locator('.segment')).toHaveCount(0)
        await expect(page.locator('.floating-label')).toHaveCount(0)

        // User clicks "Add First Segment" button
        const addButton = page.locator('.add-segment-button')
        await expect(addButton).toContainText('Add First Segment')
        await addButton.click()
        await page.waitForTimeout(200)

        // Verify segment was created
        await expect(page.locator('.segment')).toHaveCount(1)
        await expect(page.locator('.floating-label')).toHaveCount(1)

        // Verify segment has default values
        const labelText = await page.locator('.floating-label').first().textContent()
        expect(labelText).toMatch(/\w+\s+\d+/) // "Type XXft" format

        // Verify remaining space updated
        const remainingText = await page.locator('.remaining-space-info').textContent()
        expect(remainingText).toContain('Remaining:')
        expect(remainingText).not.toContain('240') // Should be less than full blockface
    })

    test('user can change segment types via dropdown', async ({ page }) => {
        // Setup single segment
        await page.evaluate(() => window.setTestConfig?.('single'))
        await page.waitForTimeout(100)

        const label = page.locator('.floating-label').first()
        const initialText = await label.textContent()
        expect(initialText).toContain('Parking')

        // Open dropdown
        await label.click()
        await page.waitForTimeout(100)

        // Click different segment type
        const loadingOption = page.locator('.dropdown-item').filter({ hasText: 'Loading' })
        await expect(loadingOption).toBeVisible()
        await loadingOption.click()
        await page.waitForTimeout(200)

        // Verify segment type changed
        const newText = await label.textContent()
        expect(newText).toContain('Loading')
        expect(newText).not.toContain('Parking')
    })

    test('user can add segments using label dropdown', async ({ page }) => {
        // Setup single segment
        await page.evaluate(() => window.setTestConfig?.('single'))
        await page.waitForTimeout(100)

        // Initial state: one segment
        await expect(page.locator('.segment')).toHaveCount(1)

        const label = page.locator('.floating-label').first()
        await label.click()
        await page.waitForTimeout(100)

        // Click "Add left" option
        const addLeftOption = page.locator('.dropdown-item').filter({ hasText: '+ Add left' })
        await expect(addLeftOption).toBeVisible()
        await addLeftOption.click()
        await page.waitForTimeout(200)

        // Should now have two segments
        await expect(page.locator('.segment')).toHaveCount(2)
        await expect(page.locator('.floating-label')).toHaveCount(2)
    })

    test('user can reorder segments via drag and drop', async ({ page }) => {
        // Setup multiple segments
        await page.evaluate(() => window.setTestConfig?.('multiple'))
        await page.waitForTimeout(200)

        // Verify initial order
        const initialLabels = await page.locator('.floating-label').allTextContents()
        const initialTypes = initialLabels.map(label => label.split(' ')[0])
        expect(initialTypes).toEqual(['Parking', 'Loading', 'Parking'])

        // Drag first segment to third position
        const firstSegment = page.locator('.segment').first()
        const thirdSegment = page.locator('.segment').nth(2)
        await firstSegment.dragTo(thirdSegment)
        await page.waitForTimeout(200)

        // Verify reordering occurred
        const reorderedLabels = await page.locator('.floating-label').allTextContents()
        const reorderedTypes = reorderedLabels.map(label => label.split(' ')[0])
        expect(reorderedTypes).not.toEqual(initialTypes)
    })

    test('editor respects blockface length constraints', async ({ page }) => {
        // Setup full blockface
        await page.evaluate(() => window.setTestConfig?.('full'))
        await page.waitForTimeout(200)

        // No add button should be visible when remaining space is 0
        await expect(page.locator('.add-segment-button')).toHaveCount(0)
        await expect(page.locator('.remaining-space-info')).toContainText('0')
    })

    test('labels display correct segment information', async ({ page }) => {
        // Setup multiple segments
        await page.evaluate(() => window.setTestConfig?.('multiple'))
        await page.waitForTimeout(200)

        const labels = await page.locator('.floating-label').allTextContents()

        // Check format and content
        expect(labels[0]).toContain('Parking')
        expect(labels[0]).toContain('80')
        expect(labels[1]).toContain('Loading')
        expect(labels[1]).toContain('60')
        expect(labels[2]).toContain('Parking')
        expect(labels[2]).toContain('50')
    })
})
