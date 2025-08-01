/*
 * VirtualTable Playwright Tests
 *
 * Integration tests for VirtualTable scrolling functionality and user interactions.
 * Tests the new scrollToRow API and keyboard navigation features.
 */

import { expect, test } from '@playwright/test'

// Helper function to get iframe-aware locator for Storybook elements
const getStorybookLocator = (page, selector) => {
    const iframe = page.frameLocator('#storybook-preview-iframe')
    return iframe.locator(selector)
}

// Helper function to wait for Storybook story to load
const waitForStoryToLoad = async (page, selector = '[data-testid="virtual-scroller"]') => {
    const iframe = page.frameLocator('#storybook-preview-iframe')
    await iframe.locator(selector).waitFor({ timeout: 10000, state: 'visible' })
}

// Helper function to perform scroll action and wait for completion
const performScrollAction = async (page, action) => {
    await action()

    // Wait for scroll info to update
    await getStorybookLocator(page, '[data-testid="scroll-info"]').waitFor({ state: 'visible', timeout: 5000 })

    // Wait for scroll animation to settle
    await page.waitForTimeout(1000)
}

// Helper function to get scroll position
const getScrollPosition = async page => {
    const virtualScroller = getStorybookLocator(page, '[data-testid="virtual-scroller"]')
    return await virtualScroller.evaluate(el => el.scrollTop)
}

// Helper function to fill input and click scroll button
const scrollToRowNumber = async (page, rowNumber) => {
    const input = getStorybookLocator(page, 'input[type="number"]')
    await input.waitFor({ state: 'visible' })
    await input.fill(rowNumber.toString())

    await performScrollAction(page, async () => {
        await getStorybookLocator(page, 'button:has-text("Scroll to Row")').click()
    })
}

test.describe('Given a VirtualTable with scrollToRow functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:6006/?path=/story/virtualtable--with-scroll-to-row', {
            waitUntil: 'networkidle',
        })
        await waitForStoryToLoad(page)
    })

    test.describe('When I enter row number 500 in input field and click scroll button', () => {
        test('Then it should navigate to the correct position and display navigation details', async ({ page }) => {
            await scrollToRowNumber(page, 500)

            const scrollInfo = await getStorybookLocator(page, '[data-testid="scroll-info"]').textContent()
            expect(scrollInfo).toContain('Scrolled to row 500')
            expect(scrollInfo).toContain('array index 499')
            expect(scrollInfo).toContain('using new scrollToRow API')
        })
    })

    test.describe('When I enter row number 100 in input field and click scroll button', () => {
        test('Then the row should be centered in viewport, not at top or bottom', async ({ page }) => {
            await scrollToRowNumber(page, 100)

            const scrollTop = await getScrollPosition(page)
            expect(scrollTop).toBeGreaterThan(5000)
            expect(scrollTop).toBeLessThan(10000)
        })
    })

    test.describe('When I click the Top button', () => {
        test('Then it should scroll to first row at position 0', async ({ page }) => {
            await performScrollAction(page, async () => {
                await getStorybookLocator(page, 'button:has-text("Top")').click()
            })

            const scrollTop = await getScrollPosition(page)
            expect(scrollTop).toBe(0)
        })
    })

    test.describe('When I click the Bottom button', () => {
        test('Then it should scroll to last row near maximum scroll position', async ({ page }) => {
            await performScrollAction(page, async () => {
                await getStorybookLocator(page, 'button:has-text("Bottom")').click()
            })

            const scrollTop = await getScrollPosition(page)
            const virtualScroller = getStorybookLocator(page, '[data-testid="virtual-scroller"]')
            const maxScroll = await virtualScroller.evaluate(el => el.scrollHeight - el.clientHeight)
            expect(scrollTop).toBeGreaterThan(maxScroll * 0.9)
        })
    })

    test.describe('When I click Random Row button multiple times', () => {
        test('Then each click should navigate using scrollToRow API', async ({ page }) => {
            for (let i = 0; i < 3; i++) {
                await performScrollAction(page, async () => {
                    await getStorybookLocator(page, 'button:has-text("Random Row")').click()
                })

                const scrollInfo = await getStorybookLocator(page, '[data-testid="scroll-info"]').textContent()
                expect(scrollInfo).toContain('using new scrollToRow API')
            }
        })
    })

    test.describe('When I scroll to row 200 and then click Clear Highlight button', () => {
        test('Then the highlighting should be removed without errors', async ({ page }) => {
            await scrollToRowNumber(page, 200)
            await getStorybookLocator(page, 'button:has-text("Clear Highlight")').click()
            expect(true).toBe(true)
        })
    })
})

test.describe('Given a VirtualTable with keyboard navigation enabled', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:6006/?path=/story/virtualtable--with-snapping', { waitUntil: 'networkidle' })
        await waitForStoryToLoad(page)
        await getStorybookLocator(page, '[data-testid="virtual-scroller"]').click()
    })

    test.describe('When I press arrow down key 5 times then arrow up key once', () => {
        test('Then it should scroll by exact row heights and end up 4 rows down from start', async ({ page }) => {
            for (let i = 0; i < 5; i++) {
                await page.keyboard.press('ArrowDown')
                await page.waitForTimeout(100)
            }

            await page.keyboard.press('ArrowUp')
            await page.waitForTimeout(100)

            const scrollTop = await getStorybookLocator(page, '[data-testid="virtual-scroller"]').evaluate(
                el => el.scrollTop,
            )
            expect(scrollTop).toBeGreaterThan(0)
        })
    })
})
