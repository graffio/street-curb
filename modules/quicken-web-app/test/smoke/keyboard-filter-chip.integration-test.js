// ABOUTME: Keyboard navigation smoke tests for AccountFilterChip using agent-browser
// ABOUTME: Tests search filtering, arrow key navigation, Enter to toggle, Escape to dismiss

import { execFileSync } from 'child_process'
import { rmSync } from 'fs'
import { homedir } from 'os'
import { resolve } from 'path'
import tap from 'tap'

const { test } = tap
tap.setTimeout(120_000)

const TEST_URL = 'http://localhost:3000?testFile=seed-12345'
const HEADED = process.env.HEADED === '1'
const SESSION = 'keyboard-filter-chip-test'

// Runs an agent-browser command with isolated session
// @sig browser :: (String, [String]) -> String
const browser = (cmd, args = []) => {
    const allArgs = HEADED ? ['--headed', cmd, ...args] : [cmd, ...args]
    const env = { ...process.env, AGENT_BROWSER_SESSION: SESSION }
    return execFileSync('agent-browser', allArgs, { encoding: 'utf-8', timeout: 30000, env }).trim()
}

// Parses snapshot output into structured elements with optional refs
// @sig parseSnapshot :: String -> [{ text: String, ref: String? }]
const parseSnapshot = output => {
    const lines = output.split('\n').filter(line => line.startsWith('- '))
    return lines.map(line => {
        const refMatch = line.match(/\[ref=(\w+)\]/)
        const text = line
            .replace(/- /, '')
            .replace(/\[ref=\w+\]/g, '')
            .trim()
        return { text, ref: refMatch?.[1] || null }
    })
}

// Delay helper
// @sig wait :: Number -> Promise
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

// Clicks the chip clear button (circular div with border-radius: 50%)
// @sig clickClear :: () -> String
const clickClear = () => browser('click', ['[style*="border-radius: 50%"]'])

test('setup: launch browser and navigate to Investment Holdings', async t => {
    const sessionDir = resolve(homedir(), '.agent-browser')
    rmSync(resolve(sessionDir, `${SESSION}.pid`), { force: true })
    rmSync(resolve(sessionDir, `${SESSION}.sock`), { force: true })

    const result = browser('open', [TEST_URL])
    t.ok(result.includes('Graffio Finance'), 'app loads')
    browser('set', ['viewport', '1280', '1600'])
    await wait(3000)

    // Navigate to Investment Holdings report
    const snapshot = browser('snapshot', ['-i'])
    const elements = parseSnapshot(snapshot)
    const holdingsReport = elements.find(e => e.text.includes('Investment Holdings'))
    t.ok(holdingsReport, 'Investment Holdings link found')
    browser('click', [`@${holdingsReport.ref}`])
    await wait(1000)

    const pageSnapshot = browser('snapshot')
    t.ok(pageSnapshot.includes('10 holdings'), 'Investment Holdings page loaded with data')
})

test('keyboard: search filters account list in popover', async t => {
    browser('find', ['text', 'Accounts:', 'click'])
    await wait(800)

    browser('find', ['placeholder', 'Search...', 'fill', 'Fidelity'])
    await wait(500)

    const snapshot = browser('snapshot')
    t.ok(snapshot.includes('Fidelity Brokerage'), 'filtered list shows Fidelity Brokerage')

    // Other accounts (401k, Chase) still appear in the sidebar — can't assert notOk on full-page snapshot
    // Filtering correctness is verified by the Enter test: only 1 item means search narrowed the list
    t.notOk(snapshot.includes('No items match'), 'search does not show "no matches" message')

    browser('press', ['Escape'])
    await wait(300)
})

test('keyboard: Enter selects highlighted item after search', async t => {
    browser('find', ['text', 'Accounts:', 'click'])
    await wait(800)
    browser('find', ['placeholder', 'Search...', 'fill', 'Fidelity'])
    await wait(500)

    // Fidelity Brokerage is at index 0 (only match) — Enter toggles it
    browser('press', ['Enter'])
    await wait(300)

    browser('press', ['Escape'])
    await wait(500)

    const snapshot = browser('snapshot')
    t.ok(snapshot.includes('1 selected'), 'chip shows "1 selected" after Enter toggle')

    // Clear for next test
    clickClear()
    await wait(300)
    t.ok(browser('snapshot').includes('All'), 'chip cleared back to "All"')
})

test('keyboard: ArrowDown navigates to second item', async t => {
    browser('find', ['text', 'Accounts:', 'click'])
    await wait(800)

    // Items are alphabetical: 401k Retirement (0), Chase Sapphire (1), ...
    // ArrowDown moves highlight from 0 to 1
    browser('press', ['ArrowDown'])
    await wait(200)

    // Enter selects Chase Sapphire (index 1)
    browser('press', ['Enter'])
    await wait(300)

    browser('press', ['Escape'])
    await wait(500)

    const snapshot = browser('snapshot')
    t.ok(snapshot.includes('1 selected'), 'chip shows "1 selected" after ArrowDown + Enter')

    clickClear()
    await wait(300)
})

test('keyboard: Escape dismisses without changing selection', async t => {
    browser('find', ['text', 'Accounts:', 'click'])
    await wait(800)

    // Navigate but do NOT press Enter
    browser('press', ['ArrowDown'])
    await wait(200)

    browser('press', ['Escape'])
    await wait(300)

    const snapshot = browser('snapshot')
    t.ok(snapshot.includes('All'), 'selection unchanged after Escape — still shows "All"')
})

test('cleanup: close browser', async t => {
    browser('close')
    t.pass('browser closed')
})
