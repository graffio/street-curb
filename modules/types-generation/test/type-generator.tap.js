import { tap } from '@graffio/test-helpers'
import fs from 'fs'
import path from 'path'
import { generateStaticTaggedSumType, generateStaticTaggedType } from '../src/tagged-type-generator.js'

const outputDir = new URL('./generated/', import.meta.url).pathname

// Clean up any existing generated test files before starting
try {
    fs.rmSync(outputDir, { recursive: true, force: true })
} catch (error) {
    // Ignore if directory doesn't exist
}

// Ensure output directory exists
fs.mkdirSync(outputDir, { recursive: true })

const typeGeneratorTests = {
    'Given static type generation system': {
        'When I generate a tagged type': async t => {
            const testCoordDef = {
                name: 'TestCoord',
                kind: 'tagged',
                fields: { x: 'Number', y: 'Number' },
                relativePath: 'test/fixtures/TestCoord.type.js',
            }

            const generated = await generateStaticTaggedType(testCoordDef)

            t.ok(generated.includes('function TestCoord(x, y)'), 'Then should generate constructor function')
            t.ok(generated.includes('export { TestCoord }'), 'Then should export the type')
            t.ok(generated.includes('@@typeName'), 'Then should include hidden @@typeName')
            t.ok(generated.includes('toString'), 'Then should include toString method')
            t.ok(generated.includes('from'), 'Then should include from method')
            t.ok(
                generated.includes("validateNumber('TestCoord(x, y)', 'x', false, x)"),
                'Then should include type validation',
            )

            // Write to file for import testing (use kebab-case naming)
            fs.mkdirSync(outputDir, { recursive: true })
            const outputFile = path.join(outputDir, 'test-coord-unit.js')
            fs.writeFileSync(outputFile, generated)
        },

        'When I generate a taggedSum type': async t => {
            const testTransactionDef = {
                name: 'TestTransaction',
                kind: 'taggedSum',
                variants: {
                    Bank: { id: 'Number', amount: 'Number' },
                    Investment: { id: 'Number', securityId: 'Number?' },
                },
                relativePath: 'test/fixtures/TestTransaction.type.js',
            }

            const generated = await generateStaticTaggedSumType(testTransactionDef)

            t.ok(generated.includes('const TestTransaction = {'), 'Then should generate main type object')
            t.ok(generated.includes('TestTransaction.Bank'), 'Then should generate Bank variant')
            t.ok(generated.includes('TestTransaction.Investment'), 'Then should generate Investment variant')
            t.ok(generated.includes('match'), 'Then should include match method')
            t.ok(generated.includes('export { TestTransaction }'), 'Then should export the type')
            t.ok(generated.includes('@@typeName'), 'Then should include hidden @@typeName')
            t.ok(generated.includes('@@tagName'), 'Then should include hidden @@tagName')

            // Write to file for import testing (use kebab-case naming)
            fs.mkdirSync(outputDir, { recursive: true })
            const outputFile = path.join(outputDir, 'test-transaction-unit.js')
            fs.writeFileSync(outputFile, generated)

            // Generate test index file (separate from main index)
            const indexContent = `export { TestCoord } from './test-coord-unit.js'
export { TestTransaction } from './test-transaction-unit.js'`
            fs.writeFileSync(path.join(outputDir, 'unit-test-index.js'), indexContent)
        },
    },
}

tap.describeTests({ 'Type Generator Tests': typeGeneratorTests })
