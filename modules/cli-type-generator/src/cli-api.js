// ABOUTME: CLI API for type generation commands (generate, generate-all, watch)
// ABOUTME: Orchestrates type file parsing, code generation, and file output

import { uniq } from '@graffio/functional'
import chokidar from 'chokidar'
import fs from 'fs'
import path, { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { typeMappings } from '../type-mappings.js'
import { parseTypeDefinitionFile } from './parse-type-definition-file.js'
import { prettierCode } from './prettier-code.js'
import { generateStaticTaggedSumType, generateStaticTaggedType } from './tagged-type-generator.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../../../../')

const WRITABLE_MODE = 0o644
const READ_ONLY_MODE = 0o444

/**
 * Set file mode (permissions)
 * @sig setFileMode :: (String, Number) -> void
 */
const setFileMode = (filePath, mode) => {
    try {
        if (fs.existsSync(filePath)) fs.chmodSync(filePath, mode)
    } catch (error) {
        if (error.code !== 'ENOENT') throw error
    }
}

/**
 * Make a file writable
 * @sig makeWriteable :: String -> void
 */
const makeWriteable = filePath => setFileMode(filePath, WRITABLE_MODE)

/**
 * Make a file read-only
 * @sig makeReadOnly :: String -> void
 */
const makeReadOnly = filePath => setFileMode(filePath, READ_ONLY_MODE)

/**
 * Generate code for a type definition based on its kind
 * @sig generateCodeForType :: TypeDefinition -> Promise<String>
 */
const generateCodeForType = async typeDefinition => {
    const { kind } = typeDefinition
    if (kind === 'tagged') return await generateStaticTaggedType(typeDefinition)
    if (kind === 'taggedSum') return await generateStaticTaggedSumType(typeDefinition)
    throw new Error(`Unknown type kind: ${kind}`)
}

/**
 * Convert type definition file to generated output file
 * @sig generateOne :: (String, String) -> Promise<String>
 */
const generateOne = async (inputFile, outputFile) => {
    const isTypeDefinition = inputFile.endsWith('.type.js')

    // Some files (FieldTypes.js) need to be copied without processing
    if (!isTypeDefinition) {
        const outputDir = path.dirname(outputFile)
        fs.mkdirSync(outputDir, { recursive: true })
        fs.copyFileSync(inputFile, outputFile)
        return path.basename(outputFile, '.js')
    }

    // Parse the type definition file
    const parseResult = parseTypeDefinitionFile(inputFile)
    const { functions, imports, sourceContent, typeDefinition: parsedDef } = parseResult
    const typeDefinition = {
        ...parsedDef,
        sourceFile: inputFile,
        relativePath: inputFile,
        imports,
        functions,
        sourceContent,
    }

    const generatedCode = await generateCodeForType(typeDefinition)

    // Ensure output directory exists and write the generated code
    const outputDir = path.dirname(outputFile)
    fs.mkdirSync(outputDir, { recursive: true })

    // Make writable (previous generation made it read-only), write, then make read-only
    makeWriteable(outputFile)
    fs.writeFileSync(outputFile, generatedCode, 'utf8')
    makeReadOnly(outputFile)

    return typeDefinition.name
}

/**
 * Generate type and index files for a single target directory
 * @sig generateForTarget :: (String, String, String) -> Promise<void>
 */
const generateForTarget = async (sourceFile, leafName, targetDir) => {
    const outputFile = `${targetDir}/${leafName}`
    console.log(`    ${sourceFile} to ${outputFile}`)
    await generateOne(sourceFile, outputFile)
}

/**
 * Update index file for a target directory
 * @sig updateIndexForTarget :: String -> Promise<void>
 */
const updateIndexForTarget = async targetDir => {
    await generateIndexFile(targetDir)
    console.log(`    Updating index: ${targetDir}/index.js`)
}

/**
 * Generate types for a source file to all configured targets
 * @sig generate :: String -> Promise<void>
 */
const generate = async sourceFile => {
    if (!sourceFile) {
        console.error('Error: file required')
        showUsage()
        process.exit(1)
    }

    const targets = typeMappings[sourceFile]
    if (!targets) {
        console.error(`No targets configured for ${sourceFile}`)
        console.error('Known targets: \n   ', Object.keys(typeMappings).join('\n    '))
        return
    }

    const leafName = sourceFile.replace(/.*\//, '').replace(/\.type\./, '.')
    console.log(`Generating ${leafName}`)

    // Generate for all targets sequentially (order matters for index generation)
    await Promise.all(targets.map(targetDir => generateForTarget(sourceFile, leafName, targetDir)))
    await Promise.all(targets.map(updateIndexForTarget))
}

/**
 * Generate all configured type files
 * @sig generateAll :: () -> Promise<void>
 */
const generateAll = async () => {
    const sourceFiles = Object.keys(typeMappings)
    console.log(`Generating ${sourceFiles.length} type files`)

    for (const sourceFile of sourceFiles) await generate(sourceFile)
}

/**
 * Watch source files and regenerate on changes
 * @sig watch :: () -> Promise<never>
 */
const watch = async () => {
    /**
     * Format file path with existence indicator
     * @sig formatPath :: String -> String
     */
    const formatPath = p => (fs.existsSync(p) ? `    ✅  ${p}` : `    ❌  ${p}`)

    const sourceFiles = Object.keys(typeMappings).map(file => resolve(REPO_ROOT, file))
    const targetDirectories = uniq(Object.values(typeMappings).flat().sort())

    console.log(`\nWatching ${sourceFiles.length} files\n`)
    const watcher = chokidar.watch(sourceFiles, { ignored: /node_modules/, persistent: true })

    console.log('  source files')
    sourceFiles.forEach(p => console.log(formatPath(p)))

    console.log('  target directories')
    targetDirectories.forEach(p => console.log(formatPath(p)))

    watcher.on('change', generate)

    return new Promise(() => {}) // Keep running
}

/**
 * Show CLI usage information
 * @sig showUsage :: () -> void
 */
const showUsage = () =>
    console.log(`
Usage: node cli.js <command>

Commands:
  generate <file>    Generate types for specific file
  generate-all       Generate all configured types
  watch              Watch and auto-generate
  help               Show this help
`)

/**
 * Extract type export from file content
 * @sig extractTypeExport :: (String, String) -> String
 */
const extractTypeExport = (file, content) => {
    const exportMatch = content.match(/export\s+{\s*(\w+)\s*}/)
    if (!exportMatch) throw new Error(`Could not find export in ${file}`)

    const typeName = exportMatch[1]
    const fileName = path.basename(file, '.js')
    return `export { ${typeName} } from './${fileName}.js'`
}

/**
 * Read file and extract its type export statement
 * @sig readAndExtractExport :: (String, String) -> String
 */
const readAndExtractExport = (outputDir, file) => {
    const filePath = path.join(outputDir, file)
    const content = fs.readFileSync(filePath, 'utf8')
    return extractTypeExport(file, content)
}

/**
 * Generate index.js file for a types directory
 * @sig generateIndexFile :: String -> Promise<Number>
 */
const generateIndexFile = async outputDir => {
    // Find all .js files (excluding index.js itself)
    const files = fs.readdirSync(outputDir).filter(file => file.endsWith('.js') && file !== 'index.js')

    if (files.length === 0) {
        console.log('No generated files found, skipping index generation')
        return 0
    }

    // Extract type names from generated files
    const exports = files.map(file => readAndExtractExport(outputDir, file)).join('\n')

    const indexContent = `// Auto-generated module index
// This file exports all generated types for this module

${exports}
`

    const formattedContent = await prettierCode(indexContent)
    const indexFile = path.join(outputDir, 'index.js')

    // Make writable, write, then make read-only
    makeWriteable(indexFile)
    fs.writeFileSync(indexFile, formattedContent, 'utf8')
    makeReadOnly(indexFile)

    return files.length
}

export { generate, generateOne, generateAll, generateIndexFile, watch, showUsage }
