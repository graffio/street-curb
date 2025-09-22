#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { checkFile } from './lib/api.js'

/**
 * Main CLI function
 * @sig main :: () -> Promise<Void>
 */
const main = async () => {
    const argv = yargs(hideBin(process.argv))
        .usage('Usage: $0 <file>')
        .command('$0 <file>', 'Check JavaScript file for A001 coding standards violations', yargs => {
            yargs.positional('file', { describe: 'Path to JavaScript file to check', type: 'string' })
        })
        .help().argv

    try {
        const result = await checkFile(argv.file)

        // Output JSON result for LLM consumption
        console.log(JSON.stringify(result, null, 2))

        // Exit with error code if violations found
        process.exit(result.isCompliant ? 0 : 1)
    } catch (error) {
        console.error(JSON.stringify({ error: true, message: error.message, filePath: argv.file }, null, 2))
        process.exit(1)
    }
}

main().catch(error => {
    console.error('CLI error:', error.message)
    process.exit(1)
})
