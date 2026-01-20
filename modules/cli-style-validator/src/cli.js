// ABOUTME: CLI entry point for the style validator
// ABOUTME: Parses arguments and runs validation on specified files

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Api } from './lib/api.js'

// COMPLEXITY: cohesion-structure — CLI entry point functions don't fit cohesion model
/**
 * Main CLI function
 * @sig main :: () -> Promise<Void>
 */
const main = async () => {
    const argv = yargs(hideBin(process.argv))
        .usage('Usage: $0 <file> [options]')
        .command('$0 <file>', 'Check JavaScript file for coding standards violations', yargs =>
            yargs.positional('file', { describe: 'Path to JavaScript file to check', type: 'string' }),
        )
        .option('strict-react', {
            type: 'boolean',
            description: 'Enable experimental React/Redux separation checks',
            default: false,
        })
        .help().argv

    const { file, strictReact } = argv

    try {
        const options = { strictReact }
        const result = await Api.checkFile(file, options)

        // Output JSON result for LLM consumption
        console.log(JSON.stringify(result, null, 2))

        // Exit with error code if violations found
        process.exit(result.isCompliant ? 0 : 1)
    } catch (error) {
        console.error(JSON.stringify({ error: true, message: error.message, filePath: file }, null, 2))
        process.exit(1)
    }
}

// COMPLEXITY: cohesion-structure — CLI error handler doesn't fit cohesion model
// @sig onrejected :: Error -> ()
const onrejected = error => {
    console.error('CLI error:', error.message)
    process.exit(1)
}
main().catch(onrejected)
