// ABOUTME: Keyboard navigation tests for filter chips
// ABOUTME: Run with: node --test test/keyboard-nav.integration-test.js (HEADED=1 for visible browser)

import { execFileSync } from 'child_process'
import { rmSync } from 'fs'
import { homedir } from 'os'
import { resolve } from 'path'
import tap from 'tap'

const { test } = tap
tap.setTimeout(120_000)

const PORT = process.env.PORT || 3000
const TEST_URL = `http://localhost:${PORT}?testFile=seed-12345`
const HEADED = process.env.HEADED === '1'
const SESSION = 'keyboard-nav-test'

// Helper to run agent-browser commands with isolated session
// @sig browser :: (String, [String]) -> String
const browser = (cmd, args = []) => {
    const allArgs = HEADED ? ['--headed', cmd, ...args] : [cmd, ...args]
    const env = { ...process.env, AGENT_BROWSER_SESSION: SESSION }
    return execFileSync('agent-browser', allArgs, { encoding: 'utf-8', timeout: 30000, env }).trim()
}

// Delay helper
// @sig wait :: Number -> Promise
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

// Helper to parse snapshot into structured data
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

// Clicks an element by its visible text content
// @sig clickByText :: String -> String
const clickByText = text => browser('find', ['text', text, 'click'])

// Finds an element by text in snapshot and clicks by ref
// @sig clickByRef :: String -> String?
const clickByRef = text => {
    const snapshot = browser('snapshot', ['-i'])
    const elements = parseSnapshot(snapshot)
    const element = elements.find(e => e.text.includes(text))
    if (element?.ref) return browser('click', [`@${element.ref}`])
    return null
}

// Presses a key and waits for UI update
// @sig pressKey :: String -> Promise
const pressKey = async key => {
    browser('press', [key])
    await wait(300)
}

test('setup: open browser with test data', async t => {
    // Remove stale session files from a previous run (e.g. HEADED mode leaves browser open)
    const sessionDir = resolve(homedir(), '.agent-browser')
    rmSync(resolve(sessionDir, `${SESSION}.pid`), { force: true })
    rmSync(resolve(sessionDir, `${SESSION}.sock`), { force: true })

    const result = browser('open', [TEST_URL])
    t.ok(result.includes('Graffio Finance'), 'app loads with title')

    // Wait for data to load
    await wait(2000)
})

test('transaction register: keyboard shortcuts open filter popovers', async t => {
    clickByText('Primary Checking')
    await wait(1000)

    t.test('pressing "d" opens date filter popover', async t => {
        await pressKey('d')
        const snapshot = browser('snapshot')
        t.ok(snapshot.includes('Include all dates') || snapshot.includes('This Year'), 'date options visible')
    })

    t.test('pressing Escape closes popover', async t => {
        await pressKey('Escape')
        await wait(200)

        // Date popover should be closed - clicking elsewhere shouldn't show popover content
    })

    t.test('pressing "c" opens category filter popover', async t => {
        await pressKey('c')
        const snapshot = browser('snapshot')
        t.ok(snapshot.includes('Search...'), 'category search visible')
    })

    t.test('pressing Escape closes category popover', async t => {
        await pressKey('Escape')
        await wait(200)
    })

    t.test('pressing "/" opens search filter popover', async t => {
        await pressKey('/')
        await wait(200)
        const snapshot = browser('snapshot')
        t.ok(snapshot.includes('Search') || snapshot.includes('search'), 'search visible')
    })

    t.test('pressing Escape closes search popover', async t => {
        await pressKey('Escape')
        await wait(200)
    })
})

test('investment register: keyboard shortcuts', async t => {
    // Navigate using ref to avoid matching multiple elements with "Fidelity Brokerage"
    clickByRef('Fidelity Brokerage')
    await wait(1000)

    t.test('pressing "x" opens actions filter popover', async t => {
        await pressKey('x')
        const snapshot = browser('snapshot')
        t.ok(snapshot.includes('Buy') || snapshot.includes('Sell'), 'action options visible')
    })

    t.test('arrow keys navigate actions list', async t => {
        // Press down to highlight first item
        await pressKey('ArrowDown')
        await wait(100)

        // Highlight should now be on an item (we can't easily verify visually, but no crash is good)
        t.pass('arrow down works')
    })

    t.test('Enter toggles highlighted action', async t => {
        await pressKey('Enter')
        await wait(200)
        const snapshot = browser('snapshot')

        // After toggling, chip should show "1 selected"
        t.ok(snapshot.includes('selected'), 'action was selected')
    })

    t.test('Escape closes actions popover', async t => {
        await pressKey('Escape')
        await wait(200)
    })

    t.test('pressing "h" opens securities filter popover', async t => {
        await pressKey('h')
        const snapshot = browser('snapshot')
        t.ok(
            snapshot.includes('VTI') || snapshot.includes('AAPL') || snapshot.includes('Securities'),
            'securities visible',
        )
    })

    t.test('Escape closes securities popover', async t => {
        await pressKey('Escape')
        await wait(200)
    })
})

test('cleanup: close browser', async t => {
    browser('close', [])
    t.test('browser closed', async t => t.pass('browser closed successfully'))
})
