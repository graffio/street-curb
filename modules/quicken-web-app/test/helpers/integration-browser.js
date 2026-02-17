// ABOUTME: Shared helpers for browser-based integration tests using agent-browser CLI.
// ABOUTME: Provides session factory (createSession) and pure utilities (parseSnapshot, wait, loadExpected).

import { execFileSync } from 'child_process'
import { readFileSync, rmSync } from 'fs'
import { homedir } from 'os'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FIXTURES_PATH = resolve(__dirname, '../../../cli-qif-to-sqlite/test/fixtures')
const EXPECTED_PATH = resolve(FIXTURES_PATH, 'seed-12345.expected.json')
const HEADED = process.env.HEADED === '1'

// Parses agent-browser snapshot output into structured elements
// @sig parseSnapshot :: String -> [{ text: String, ref: String? }]
const parseSnapshot = output => {
    const lines = output.split('\n').filter(line => line.startsWith('- '))
    return lines.map(line => {
        const refMatch = line.match(/\[ref=(\w+)\]/)
        const text = line
            .replace(/^- /, '')
            .replace(/\[ref=\w+\]/g, '')
            .trim()
        return { text, ref: refMatch?.[1] ?? null }
    })
}

// Creates an isolated browser session with bound helper functions.
// Cleans stale session files (.pid, .sock) during construction.
// @sig createSession :: String -> { browser, clickByText, clickByRef, clickPopoverItem, clickClear, enterDate, pressKey, open, close, setViewport }
const createSession = sessionName => {
    if (!/^[a-z0-9-]+$/.test(sessionName))
        throw new Error(`Invalid session name: "${sessionName}" — must match /^[a-z0-9-]+$/`)

    // Clean stale session files from previous runs (e.g. HEADED mode leaves browser open)
    const sessionDir = resolve(homedir(), '.agent-browser')
    rmSync(resolve(sessionDir, `${sessionName}.pid`), { force: true })
    rmSync(resolve(sessionDir, `${sessionName}.sock`), { force: true })

    // Runs an agent-browser command with this session's environment
    // @sig browser :: (String, [String]) -> String
    const browser = (cmd, args = []) => {
        const allArgs = HEADED ? ['--headed', cmd, ...args] : [cmd, ...args]
        const env = { ...process.env, AGENT_BROWSER_SESSION: sessionName }
        return execFileSync('agent-browser', allArgs, { encoding: 'utf-8', timeout: 30000, env }).trim()
    }

    // @sig open :: String -> String
    const open = url => browser('open', [url])

    // @sig close :: () -> String
    const close = () => browser('close')

    // @sig setViewport :: (String, String) -> String
    const setViewport = (width, height) => browser('set', ['viewport', String(width), String(height)])

    // Clicks an element by its visible text content using Playwright text locator
    // @sig clickByText :: String -> String
    const clickByText = text => browser('find', ['text', text, 'click'])

    // Finds an element by text in snapshot and clicks by ref. Throws if not found (fail-fast).
    // @sig clickByRef :: String -> String
    const clickByRef = text => {
        const snapshot = browser('snapshot', ['-i'])
        const elements = parseSnapshot(snapshot)
        const element = elements.find(e => e.text.includes(text))
        if (!element) throw new Error(`clickByRef: no element matching "${text}"`)
        if (!element.ref) throw new Error(`clickByRef: element "${text}" has no ref`)
        return browser('click', [`@${element.ref}`])
    }

    // Clicks an item inside an open Radix popover, scoped to avoid ambiguity with page content.
    // Uses nth=0 to handle substring matches that resolve to multiple elements.
    // @sig clickPopoverItem :: String -> String
    const clickPopoverItem = text => browser('click', [`[data-radix-popper-content-wrapper] >> text=${text} >> nth=0`])

    // Clicks the chip clear button (circular div with border-radius: 50%)
    // @sig clickClear :: () -> String
    const clickClear = () => browser('click', ['[style*="border-radius: 50%"]'])

    // Enters a date into KeyboardDateInput using keyboard-mode key presses.
    // Click focuses the input, digits go through handleNumberTyping, '/' advances segment.
    // After all digits, waits for year buffer timeout (800ms) to auto-apply.
    // @sig enterDate :: (String, String) -> Promise
    const enterDate = async (selector, dateString) => {
        browser('click', [selector])
        await wait(200)
        dateString.split('').forEach(c => browser('press', [c]))
        await wait(850)
    }

    // Presses a key and waits for UI update
    // @sig pressKey :: String -> Promise
    const pressKey = async key => {
        browser('press', [key])
        await wait(300)
    }

    return {
        browser,
        open,
        close,
        setViewport,
        clickByText,
        clickByRef,
        clickPopoverItem,
        clickClear,
        enterDate,
        pressKey,
    }
}

// Loads expected test values from seed fixture
// @sig loadExpected :: () -> Object
const loadExpected = () => JSON.parse(readFileSync(EXPECTED_PATH, 'utf-8'))

// @sig wait :: Number -> Promise
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const IntegrationBrowser = { parseSnapshot, createSession, loadExpected, wait }

export { IntegrationBrowser }
