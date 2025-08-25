import { tap } from '@graffio/test-helpers'
import fs from 'fs'
import { main as generateTypes } from './test-helper-type-generator.js'

// Clean up any existing generated test files before starting
try {
    fs.rmSync('test/generated/', { recursive: true, force: true })
} catch (error) {
    // Ignore if directory doesn't exist
}

// Generate fresh types from .type.js files
await generateTypes()

// Dynamically import the generated types
const generatedTypes = await import('./generated/index.js')
const { HasIdEnhanced } = generatedTypes

const enhancedTypeFunctionality = {
    'Given HasIdEnhanced type with imports and attached functions': {
        'When I examine the type constructor': t => {
            t.equal(typeof HasIdEnhanced, 'function', 'Then HasIdEnhanced is a function')
            t.equal(HasIdEnhanced.name, 'HasIdEnhanced', 'Then constructor name is HasIdEnhanced')
            t.equal(HasIdEnhanced.toString(), 'HasIdEnhanced', 'Then toString returns type name')
        },

        'When I test the attached createRandom function': t => {
            t.equal(typeof HasIdEnhanced.createRandom, 'function', 'Then createRandom is a function')

            const randomId = HasIdEnhanced.createRandom()
            t.ok(HasIdEnhanced.is(randomId), 'Then createRandom returns valid HasIdEnhanced instance')
            t.equal(typeof randomId.id, 'string', 'Then generated id is a string')
            t.ok(randomId.id.length > 30, 'Then generated id has reasonable length')

            // Test that multiple calls generate different IDs
            const randomId2 = HasIdEnhanced.createRandom()
            t.not(randomId.id, randomId2.id, 'Then multiple calls generate different IDs')
        },

        'When I test the attached isValidId function': t => {
            t.equal(typeof HasIdEnhanced.isValidId, 'function', 'Then isValidId is a function')

            // Test valid UUID v4 format
            const validUuid = '12345678-1234-4234-8234-123456789012'
            t.ok(HasIdEnhanced.isValidId(validUuid), 'Then isValidId accepts valid UUID')

            // Test invalid IDs
            t.notOk(HasIdEnhanced.isValidId('invalid'), 'Then isValidId rejects invalid string')
            t.notOk(HasIdEnhanced.isValidId(123), 'Then isValidId rejects number')
            t.notOk(HasIdEnhanced.isValidId(null), 'Then isValidId rejects null')
            t.notOk(HasIdEnhanced.isValidId(undefined), 'Then isValidId rejects undefined')

            // Test generated IDs are valid
            const randomId = HasIdEnhanced.createRandom()
            t.ok(HasIdEnhanced.isValidId(randomId.id), 'Then createRandom generates valid IDs')
        },

        'When I test the attached fromObject function': t => {
            t.equal(typeof HasIdEnhanced.fromObject, 'function', 'Then fromObject is a function')

            const validUuid = '12345678-1234-4234-8234-123456789012'
            const obj = { id: validUuid, extra: 'data' }

            const instance = HasIdEnhanced.fromObject(obj)
            t.ok(HasIdEnhanced.is(instance), 'Then fromObject returns valid HasIdEnhanced instance')
            t.equal(instance.id, validUuid, 'Then fromObject extracts correct ID')

            // Test error cases
            t.throws(() => HasIdEnhanced.fromObject(null), 'Then fromObject throws on null')
            t.throws(() => HasIdEnhanced.fromObject({}), 'Then fromObject throws on object without id')
            t.throws(() => HasIdEnhanced.fromObject({ id: null }), 'Then fromObject throws on null id')
        },

        'When I test integration between functions': t => {
            // Create random instance
            const randomInstance = HasIdEnhanced.createRandom()

            // Verify it's valid
            t.ok(HasIdEnhanced.isValidId(randomInstance.id), 'Then createRandom output passes isValidId')

            // Convert to object and back
            const asObject = { id: randomInstance.id, extra: 'test' }
            const fromObjectInstance = HasIdEnhanced.fromObject(asObject)

            t.equal(fromObjectInstance.id, randomInstance.id, 'Then roundtrip preserves ID')
            t.ok(HasIdEnhanced.is(fromObjectInstance), 'Then fromObject result is valid instance')
        },
    },
}

const enhancedTypeCompatibility = {
    'Given HasIdEnhanced type maintains base functionality': {
        'When I test core type functionality': t => {
            const validUuid = '12345678-1234-4234-8234-123456789012'
            const instance = HasIdEnhanced(validUuid)

            t.ok(HasIdEnhanced.is(instance), 'Then core constructor works')
            t.equal(instance.id, validUuid, 'Then field access works')
            t.equal(instance.toString(), `HasIdEnhanced("${validUuid}")`, 'Then toString works')

            // Test validation still works
            t.throws(() => HasIdEnhanced('invalid'), /expected id to match/, 'Then validation still works')
            t.throws(() => HasIdEnhanced(123), /expected id to have type String/, 'Then type checking still works')
        },

        'When I test from method compatibility': t => {
            const validUuid = '12345678-1234-4234-8234-123456789012'
            const obj = { id: validUuid }

            const instance = HasIdEnhanced.from(obj)
            t.ok(HasIdEnhanced.is(instance), 'Then built-in from method still works')
            t.equal(instance.id, validUuid, 'Then from method extracts correct data')

            // Both from methods should work
            const instance2 = HasIdEnhanced.fromObject(obj)
            t.equal(instance.id, instance2.id, 'Then both from methods produce same result')
        },

        'When I test JSON serialization': t => {
            const instance = HasIdEnhanced.createRandom()
            const json = JSON.stringify(instance)
            const parsed = JSON.parse(json)

            t.equal(typeof json, 'string', 'Then JSON.stringify works')
            t.equal(parsed.id, instance.id, 'Then JSON roundtrip preserves data')

            // Can reconstruct from JSON
            const reconstructed = HasIdEnhanced.from(parsed)
            t.equal(reconstructed.id, instance.id, 'Then can reconstruct from JSON')
        },
    },
}

const importHandlingTests = {
    'Given type definitions with imports': {
        'When I examine the generated code structure': t => {
            // Read the generated file to verify import handling
            const generatedCode = fs.readFileSync('test/generated/has-id-enhanced.js', 'utf8')

            // Should not contain internal imports in generated code
            t.notOk(
                generatedCode.includes("import StringTypes from './string-types.js'"),
                'Then internal imports are filtered out',
            )

            // Should contain the generated type functionality
            t.ok(generatedCode.includes('HasIdEnhanced.createRandom'), 'Then attached functions are included')
            t.ok(generatedCode.includes('HasIdEnhanced.isValidId'), 'Then all attached functions are included')
            t.ok(generatedCode.includes('HasIdEnhanced.fromObject'), 'Then all attached functions are included')

            // Should contain regex validation from import resolution
            t.ok(generatedCode.includes('/^[0-9a-f]{8}-[0-9a-f]{4}'), 'Then import values are resolved')
        },

        'When I test that imports are properly resolved': t => {
            // The StringTypes.Id should be resolved to actual regex in validation
            const validUuid = '12345678-1234-4234-8234-123456789012'
            const invalidId = 'not-a-uuid'

            t.doesNotThrow(() => HasIdEnhanced(validUuid), 'Then resolved regex accepts valid UUID')
            t.throws(() => HasIdEnhanced(invalidId), 'Then resolved regex rejects invalid UUID')

            // The validation should match what isValidId function uses
            const instance = HasIdEnhanced(validUuid)
            t.ok(HasIdEnhanced.isValidId(instance.id), 'Then import resolution is consistent')
        },
    },
}

tap.describeTests({ 'Enhanced Types - Function Attachment': enhancedTypeFunctionality })
tap.describeTests({ 'Enhanced Types - Base Compatibility': enhancedTypeCompatibility })
tap.describeTests({ 'Enhanced Types - Import Handling': importHandlingTests })
