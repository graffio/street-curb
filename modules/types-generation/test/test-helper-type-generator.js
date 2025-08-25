#!/usr/bin/env node

import { execSync } from 'child_process'

/*
 * Legacy compatibility wrapper for the new per-file type generation system
 * This function generates all types by running the yarn types:generate command
 * @sig main :: () -> Promise<void>
 */
const main = async () => {
    try {
        // Run the new type generation system
        execSync('yarn types:generate', { cwd: process.cwd(), stdio: 'inherit' })
    } catch (error) {
        console.error(`❌ Type generation failed: ${error.message}`)
        process.exit(1)
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) main()

export { main }
