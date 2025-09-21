#!/usr/bin/env node

import fs from 'fs'
import { generateIndexFile } from './cli-api.js'

/*
 * Generate index file that exports all types in a directory
 * @sig main :: () -> Promise<void>
 */
const main = async () => {
    try {
        const [outputDir] = process.argv.slice(2)

        if (!outputDir) {
            console.error('Usage: node cli-generate-index-file.js <output-directory>')
            process.exit(1)
        }

        if (!fs.existsSync(outputDir)) {
            console.log('ℹ️  No output directory found, skipping index generation')
            return
        }

        const fileCount = await generateIndexFile(outputDir)

        console.log(`✓ Generated index: ${fileCount} exports`)
    } catch (error) {
        console.error(`❌ Index generation failed: ${error.message}`)
        process.exit(1)
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) main()

export { main }
