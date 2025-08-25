#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { parseTypeDefinitionFile } from './parse-type-definition-file.js'
import { generateStaticTaggedSumType, generateStaticTaggedType } from './tagged-type-generator.js'

/*
 * Simple single-file type transformer: input.type.js -> output.js
 * @sig main :: () -> Promise<void>
 */
const main = async () => {
    try {
        const [inputFile, outputFile] = process.argv.slice(2)

        if (!inputFile || !outputFile) {
            console.error('Usage: node generate-type-file.js <input.type.js> <output.js>')
            process.exit(1)
        }

        if (!fs.existsSync(inputFile)) {
            console.error(`Error: Input file does not exist: ${inputFile}`)
            process.exit(1)
        }

        // Parse the type definition file
        const parseResult = parseTypeDefinitionFile(inputFile)
        const typeDefinition = {
            ...parseResult.typeDefinition,
            sourceFile: inputFile,
            relativePath: inputFile,
            imports: parseResult.imports,
            functions: parseResult.functions,
            sourceContent: parseResult.sourceContent,
        }

        // Generate the static type code
        let generatedCode
        if (typeDefinition.kind === 'tagged') {
            generatedCode = await generateStaticTaggedType(typeDefinition)
        } else if (typeDefinition.kind === 'taggedSum') {
            generatedCode = await generateStaticTaggedSumType(typeDefinition)
        } else {
            throw new Error(`Unknown type kind: ${typeDefinition.kind}`)
        }

        // Ensure output directory exists
        const outputDir = path.dirname(outputFile)
        fs.mkdirSync(outputDir, { recursive: true })

        // Write the generated code
        fs.writeFileSync(outputFile, generatedCode, 'utf8')

        console.log(`✓ Generated ${typeDefinition.name}: ${inputFile} -> ${outputFile}`)
    } catch (error) {
        console.error(`❌ Generation failed: ${error.message}`)
        process.exit(1)
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) main()

export { main }
