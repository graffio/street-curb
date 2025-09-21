#!/usr/bin/env node

import fs from 'fs'
import { generateOne } from './cli-api.js'

/*
 * Simple single-file type transformer: input.type.js -> output.js
 * @sig main :: () -> Promise<void>
 */
const main = async () => {
    try {
        const [inputFile, outputFile] = process.argv.slice(2)

        if (!inputFile || !outputFile) {
            console.error('Usage: node cli-generate-type-file.js <input.type.js> <output.js>')
            process.exit(1)
        }

        if (!fs.existsSync(inputFile)) {
            console.error(`Error: Input file does not exist: ${inputFile}`)
            process.exit(1)
        }

        const typeDefinitionName = await generateOne(inputFile, outputFile)

        console.log(`✓ Generated ${typeDefinitionName}: ${inputFile} -> ${outputFile}`)
    } catch (error) {
        console.error(`❌ Generation failed: ${error.message}`)
        process.exit(1)
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) main()

export { main }
