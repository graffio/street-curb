// ABOUTME: CLI entry point for the style validator
// ABOUTME: Parses arguments and runs validation on specified files

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { checkFile } from './lib/check-file.js'

// COMPLEXITY: cohesion-structure — CLI entry point functions don't fit cohesion model
// COMPLEXITY: function-naming — CLI entry point; "main" is conventional
/**
 * Main CLI function
 * @sig main :: () -> Promise<Void>
 */
const main = async () => {
    const argv = yargs(hideBin(process.argv))
        .usage('Usage: $0 <file...> [options]')
        .command('$0 <file...>', 'Check JavaScript files for coding standards violations', yargs =>
            yargs.positional('file', { describe: 'Paths to JavaScript files to check', type: 'string', array: true }),
        )
        .help().argv

    const { file: files } = argv

    const results = await Promise.all(
        files.map(filePath =>
            checkFile(filePath).catch(error => ({ error: true, message: error.message, filePath, isCompliant: false })),
        ),
    )

    results.forEach(r => console.log(JSON.stringify(r, null, 2)))
    process.exit(results.some(r => !r.isCompliant) ? 1 : 0)
}

// COMPLEXITY: cohesion-structure — CLI error handler doesn't fit cohesion model
// COMPLEXITY: function-naming — Promise rejection handler; "onrejected" is conventional
// @sig onrejected :: Error -> ()
const onrejected = error => {
    console.error('CLI error:', error.message)
    process.exit(1)
}
main().catch(onrejected)
