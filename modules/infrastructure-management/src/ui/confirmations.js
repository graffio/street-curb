/*
 * User Confirmation System
 *
 * Provides environment-specific confirmation prompts to prevent accidental
 * infrastructure operations. Production environments require typing full
 * confirmation text, while development environments use simple confirmations.
 *
 * This module is designed to be stable over time - confirmation patterns
 * rarely change even as infrastructure complexity grows.
 */

import { createInterface } from 'readline'

/**
 * Check if running in test context to skip interactive prompts
 * @sig isTestContext :: () -> Boolean
 */
const isTestContext = () =>
    process.env.NODE_ENV === 'test' || process.env.TAP === '1' || process.argv.some(arg => arg.includes('tap'))

/**
 * Get user input with readline interface
 * @sig getUserInput :: (String) -> Promise<String>
 */
const getUserInput = async prompt => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })

    const getAnswer = resolve => {
        rl.question(prompt, resolve)
    }

    const answer = await new Promise(getAnswer)
    rl.close()
    return answer.trim()
}

/**
 * Require explicit confirmation for infrastructure operations
 *
 * This is the main safety mechanism that prevents accidental infrastructure
 * changes. Production environments require typing the full operation name,
 * while development environments use simple 'yes' confirmation.
 *
 * @sig requireConfirmation :: (String, String, Object?) -> Promise<Void>
 */
export const requireConfirmation = async (operation, environment, options = {}) => {
    if (isTestContext()) {
        console.log(`[TEST MODE] Would confirm: ${operation} in ${environment}`)
        return
    }

    const isProtected = ['production', 'staging'].includes(environment)
    const confirmText = isProtected ? `EXECUTE ${operation.toUpperCase()} IN ${environment.toUpperCase()}` : 'yes'

    console.log('\n=== CONFIRMATION REQUIRED ===')
    if (options.warning) {
        console.log(`⚠️  WARNING: ${options.warning}`)
    }
    if (options.impact) {
        console.log(`💰 Impact: ${options.impact}`)
    }

    const answer = await getUserInput(`Type "${confirmText}" to proceed: `)

    if (answer !== confirmText) {
        throw new Error(`Operation cancelled. Expected "${confirmText}", got "${answer}"`)
    }
}
