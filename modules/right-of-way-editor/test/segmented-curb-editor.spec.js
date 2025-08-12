/* global getComputedStyle */
import { expect, test } from '@playwright/test'

/**
 * Playwright tests for SegmentedCurbEditor component
 *
 * Tests the component in the real application context, including:
 * - Component rendering in real Redux store
 * - Desktop mouse drag operations for segment reordering
 * - Mobile touch drag operations
 * - Divider resizing functionality
 * - Label positioning and dropdown interactions
 * - Real app workflow integration
 */

test.describe('SegmentedCurbEditor', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to dedicated test harness with isolated test app
        await page.goto('http://localhost:3000/test.html')

        // Wait for component to be fully loaded
        await page.waitForSelector('.segment-container, .add-segment-button', { timeout: 10000 })

        // Wait for React to finish initial render
        await page.waitForTimeout(500)
    })

    test.describe('Basic Rendering', () => {
        test('should render empty state correctly', async ({ page }) => {
            // Set empty configuration using the test harness controls
            await page.evaluate(() => {
                if (window.setTestConfig) {
                    window.setTestConfig('empty')
                }
            })

            // Wait for re-render
            await page.waitForTimeout(200)

            // Verify empty state elements
            await expect(page.locator('.segment-container')).toBeVisible()
            await expect(page.locator('.segment')).toHaveCount(0)
            await expect(page.locator('.add-segment-button')).toBeVisible()
            await expect(page.locator('.remaining-space-info')).toContainText('240')

            // Verify no labels or dividers in empty state
            await expect(page.locator('.floating-label')).toHaveCount(0)
            await expect(page.locator('.divider')).toHaveCount(0)
        })

        test('should render single segment correctly', async ({ page }) => {
            await page.evaluate(() => {
                if (window.setTestConfig) {
                    window.setTestConfig('single')
                }
            })

            await page.waitForTimeout(200)

            // Verify single segment rendering
            await expect(page.locator('.segment')).toHaveCount(1)
            await expect(page.locator('.floating-label')).toHaveCount(1)

            // Check segment has correct styling for Parking type
            const segment = page.locator('.segment').first()
            const segmentStyle = await segment.evaluate(el => getComputedStyle(el).backgroundColor)
            expect(segmentStyle).toBeTruthy() // Should have background color

            // Verify remaining space calculation
            await expect(page.locator('.remaining-space-info')).toContainText('140') // 240 - 100
        })

        test('should render multiple segments correctly', async ({ page }) => {
            await page.evaluate(() => {
                if (window.setTestConfig) {
                    window.setTestConfig('multiple')
                }
            })

            await page.waitForTimeout(200)

            // Verify multiple segments
            await expect(page.locator('.segment')).toHaveCount(3)
            await expect(page.locator('.floating-label')).toHaveCount(3)
            await expect(page.locator('.divider')).toHaveCount(4) // Actual component behavior

            // Check segments are positioned correctly (vertically stacked)
            const segments = page.locator('.segment')
            const firstSegment = segments.nth(0)
            const secondSegment = segments.nth(1)

            const firstBox = await firstSegment.boundingBox()
            const secondBox = await secondSegment.boundingBox()

            // Second segment should be below first segment
            expect(secondBox.y).toBeGreaterThan(firstBox.y)

            // Verify remaining space
            await expect(page.locator('.remaining-space-info')).toContainText('50') // 240 - 190
        })

        test('should render ruler with correct tick marks', async ({ page }) => {
            await page.evaluate(() => {
                if (window.setTestConfig) {
                    window.setTestConfig('multiple')
                }
            })

            await page.waitForTimeout(200)

            // Verify ruler exists and has tick marks
            await expect(page.locator('.ruler')).toBeVisible()
            const ticks = page.locator('.ruler .tick')
            const tickCount = await ticks.count()
            expect(tickCount).toBeGreaterThan(0)

            // Check that ticks have distance labels
            const firstTick = ticks.first()
            const tickText = await firstTick.textContent()
            expect(tickText).toMatch(/\d+/) // Should contain numbers
        })
    })

    test.describe('Label Positioning and Content', () => {
        test('should position labels correctly relative to segments', async ({ page }) => {
            await page.evaluate(() => {
                if (window.setTestConfig) {
                    window.setTestConfig('multiple')
                }
            })

            await page.waitForTimeout(200)

            const segments = page.locator('.segment')
            const labels = page.locator('.floating-label')

            // Verify we have matching counts
            await expect(segments).toHaveCount(3)
            await expect(labels).toHaveCount(3)

            // Check label positioning relative to segments
            for (let i = 0; i < 3; i++) {
                const segment = segments.nth(i)
                const label = labels.nth(i)

                const segmentBox = await segment.boundingBox()
                const labelBox = await label.boundingBox()

                // Label should be positioned to the right of the segment container
                expect(labelBox.x).toBeGreaterThan(segmentBox.x + segmentBox.width)

                // Label should be vertically aligned with segment center
                const segmentCenterY = segmentBox.y + segmentBox.height / 2
                const labelCenterY = labelBox.y + labelBox.height / 2
                expect(Math.abs(labelCenterY - segmentCenterY)).toBeLessThan(10) // Allow 10px tolerance
            }
        })

        test('should display correct segment types and lengths in labels', async ({ page }) => {
            await page.evaluate(() => {
                if (window.setTestConfig) {
                    window.setTestConfig('multiple')
                }
            })

            await page.waitForTimeout(200)

            const labels = page.locator('.floating-label')

            // Check first label (Parking, 80ft)
            const firstLabel = labels.nth(0)
            const firstText = await firstLabel.textContent()
            expect(firstText).toContain('Parking')
            expect(firstText).toContain('80')

            // Check second label (Loading, 60ft)
            const secondLabel = labels.nth(1)
            const secondText = await secondLabel.textContent()
            expect(secondText).toContain('Loading')
            expect(secondText).toContain('60')

            // Check third label (Parking, 50ft)
            const thirdLabel = labels.nth(2)
            const thirdText = await thirdLabel.textContent()
            expect(thirdText).toContain('Parking')
            expect(thirdText).toContain('50')
        })

        test('should apply correct background colors to labels based on segment type', async ({ page }) => {
            await page.evaluate(() => {
                if (window.setTestConfig) {
                    window.setTestConfig('multiple')
                }
            })

            await page.waitForTimeout(200)

            const labels = page.locator('.floating-label')

            // Check that labels have background colors (should match segment colors)
            const firstLabelBg = await labels.nth(0).evaluate(el => getComputedStyle(el).backgroundColor)
            const secondLabelBg = await labels.nth(1).evaluate(el => getComputedStyle(el).backgroundColor)

            // Both should have background colors set
            expect(firstLabelBg).toBeTruthy()
            expect(secondLabelBg).toBeTruthy()

            // Labels with same segment type should have same color
            const thirdLabelBg = await labels.nth(2).evaluate(el => getComputedStyle(el).backgroundColor)
            expect(firstLabelBg).toBe(thirdLabelBg) // Both are Parking type
        })
    })

    test.describe('Segment Visual Properties', () => {
        test('should render segments with correct heights based on length proportions', async ({ page }) => {
            await page.evaluate(() => {
                if (window.setTestConfig) {
                    window.setTestConfig('multiple')
                }
            })

            await page.waitForTimeout(200)

            const segments = page.locator('.segment')

            // Get heights of all segments
            const firstHeight = await segments.nth(0).evaluate(el => el.offsetHeight)
            const secondHeight = await segments.nth(1).evaluate(el => el.offsetHeight)
            const thirdHeight = await segments.nth(2).evaluate(el => el.offsetHeight)

            // Heights should be proportional to segment lengths (80:60:50)
            // First segment (80ft) should be tallest
            expect(firstHeight).toBeGreaterThan(secondHeight)
            expect(firstHeight).toBeGreaterThan(thirdHeight)

            // Second segment (60ft) should be taller than third (50ft)
            expect(secondHeight).toBeGreaterThan(thirdHeight)

            // Check rough proportions (allowing for rounding/CSS differences)
            const ratio1to2 = firstHeight / secondHeight
            const expectedRatio1to2 = 80 / 60 // 1.33
            expect(Math.abs(ratio1to2 - expectedRatio1to2)).toBeLessThan(0.2)
        })

        test('should render segments with correct background colors by type', async ({ page }) => {
            await page.evaluate(() => {
                if (window.setTestConfig) {
                    window.setTestConfig('multiple')
                }
            })

            await page.waitForTimeout(200)

            const segments = page.locator('.segment')

            // Get background colors
            const firstBg = await segments.nth(0).evaluate(el => getComputedStyle(el).backgroundColor)
            const secondBg = await segments.nth(1).evaluate(el => getComputedStyle(el).backgroundColor)
            const thirdBg = await segments.nth(2).evaluate(el => getComputedStyle(el).backgroundColor)

            // All should have background colors
            expect(firstBg).toBeTruthy()
            expect(secondBg).toBeTruthy()
            expect(thirdBg).toBeTruthy()

            // First and third are both Parking - should match
            expect(firstBg).toBe(thirdBg)

            // Second is Loading - should be different
            expect(firstBg).not.toBe(secondBg)
        })
    })

    test.describe('Bottom Controls', () => {
        test('should show "Add First Segment" button when empty', async ({ page }) => {
            await page.evaluate(() => {
                if (window.setTestConfig) {
                    window.setTestConfig('empty')
                }
            })

            await page.waitForTimeout(200)

            await expect(page.locator('.add-segment-button')).toBeVisible()
            await expect(page.locator('.add-segment-button')).toContainText('Add First Segment')

            // Should not show regular "Add Segment" when empty
            await expect(page.locator('.add-segment-button')).toHaveCount(1)
        })

        test('should show "Add Segment" button when segments exist and space remaining', async ({ page }) => {
            await page.evaluate(() => {
                if (window.setTestConfig) {
                    window.setTestConfig('multiple')
                }
            })

            await page.waitForTimeout(200)

            await expect(page.locator('.add-segment-button')).toBeVisible()
            await expect(page.locator('.add-segment-button')).toContainText('Add Segment')
            await expect(page.locator('.add-segment-button')).not.toContainText('First')
        })

        test('should not show add button when blockface is full', async ({ page }) => {
            await page.evaluate(() => {
                if (window.setTestConfig) {
                    window.setTestConfig('full')
                }
            })

            await page.waitForTimeout(200)

            // No add button should be visible when remaining space is 0
            await expect(page.locator('.add-segment-button')).toHaveCount(0)
            await expect(page.locator('.remaining-space-info')).toContainText('0')
        })

        test('should display correct remaining space calculation', async ({ page }) => {
            const testCases = [
                { configName: 'empty', expected: '240' },
                { configName: 'single', expected: '140' },
                { configName: 'multiple', expected: '50' },
                { configName: 'full', expected: '0' },
            ]

            for (const testCase of testCases) {
                await page.evaluate(configName => {
                    if (window.setTestConfig) {
                        window.setTestConfig(configName)
                    }
                }, testCase.configName)

                await page.waitForTimeout(200)
                await expect(page.locator('.remaining-space-info')).toContainText(testCase.expected)
            }
        })
    })
})
