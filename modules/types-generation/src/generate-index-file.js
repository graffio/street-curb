#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { prettierCode } from './prettier-code.js'

/*
 * Generate index file that exports all types in a directory
 * @sig main :: () -> Promise<void>
 */
const main = async () => {
    try {
        const [outputDir] = process.argv.slice(2)

        if (!outputDir) {
            console.error('Usage: node generate-index-file.js <output-directory>')
            process.exit(1)
        }

        if (!fs.existsSync(outputDir)) {
            console.log('ℹ️  No output directory found, skipping index generation')
            return
        }

        // Find all .js files (excluding index.js itself and unit test files)
        const files = fs
            .readdirSync(outputDir)
            .filter(
                file =>
                    file.endsWith('.js') &&
                    file !== 'index.js' &&
                    !file.endsWith('-unit.js') &&
                    file !== 'unit-test-index.js',
            )

        if (files.length === 0) {
            console.log('ℹ️  No generated files found, skipping index generation')
            return
        }

        // Extract type names from generated files
        const exports = files
            .map(file => {
                const filePath = path.join(outputDir, file)
                const content = fs.readFileSync(filePath, 'utf8')

                // Extract the type name from the export line: export { TypeName }
                const exportMatch = content.match(/export\s+{\s*(\w+)\s*}/)
                if (!exportMatch) {
                    throw new Error(`Could not find export in ${file}`)
                }

                const typeName = exportMatch[1]
                const fileName = path.basename(file, '.js')

                return `export { ${typeName} } from './${fileName}.js'`
            })
            .join('\n')

        const indexContent = `// Auto-generated module index
// This file exports all generated types for this module

${exports}
`

        const formattedContent = await prettierCode(indexContent)
        const indexFile = path.join(outputDir, 'index.js')
        fs.writeFileSync(indexFile, formattedContent, 'utf8')

        console.log(`✓ Generated index: ${files.length} exports`)
    } catch (error) {
        console.error(`❌ Index generation failed: ${error.message}`)
        process.exit(1)
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) main()

export { main }
