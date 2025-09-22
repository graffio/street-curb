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

/*
 * Convert the type definition in the file at inputFile into the location at outputFile; return its name
 * @sig generateOne :: (String, String) ->Promise<String>
 */
const generateOne = async (inputFile, outputFile) => {
    const generate = async () => {
        if (typeDefinition.kind === 'tagged') return await generateStaticTaggedType(typeDefinition)
        if (typeDefinition.kind === 'taggedSum') return await generateStaticTaggedSumType(typeDefinition)
        throw new Error(`Unknown type kind: ${typeDefinition.kind}`)
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

    const generatedCode = await generate()

    // Ensure output directory exists and write the generated code
    const outputDir = path.dirname(outputFile)
    fs.mkdirSync(outputDir, { recursive: true })
    fs.writeFileSync(outputFile, generatedCode, 'utf8')

    return typeDefinition.name
}

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
    for (const targetDir of targets) {
        const outputFile = `${targetDir}/${leafName}`
        console.log(`    ${sourceFile} to ${outputFile}`)
        await generateOne(sourceFile, outputFile)
    }

    // Generate index files for each target directory
    for (const targetDir of targets) {
        await generateIndexFile(targetDir)
        console.log(`    Updating index: ${targetDir}/index.js`)
    }
}

const generateAll = async () => {
    const sourceFiles = Object.keys(typeMappings)
    console.log(`Generating ${sourceFiles.length} type files`)

    for (const sourceFile of sourceFiles) await generate(sourceFile)
}

const watch = async () => {
    const sourceFiles = Object.keys(typeMappings).map(file => resolve(REPO_ROOT, file))
    const targetDirectories = uniq(Object.values(typeMappings).flat().sort())

    console.log(`\nWatching ${sourceFiles.length} files\n`)
    const watcher = chokidar.watch(sourceFiles, { ignored: /node_modules/, persistent: true })

    console.log('  source files')
    sourceFiles.forEach(path => console.log(fs.existsSync(path) ? `    ✅  ${path}` : `    ❌  ${path}`))

    console.log('  target directories')
    targetDirectories.forEach(path => console.log(fs.existsSync(path) ? `    ✅  ${path}` : `    ❌  ${path}`))

    watcher.on('change', generate)

    return new Promise(() => {}) // Keep running
}

const showUsage = () => {
    console.log(`
Usage: node cli.js <command>

Commands:
  generate <file>    Generate types for specific file
  generate-all       Generate all configured types
  watch              Watch and auto-generate
  help               Show this help
`)
}

const generateIndexFile = async outputDir => {
    // Find all .js files (excluding index.js itself and unit test files)
    const files = fs.readdirSync(outputDir).filter(file => file.endsWith('.js') && file !== 'index.js')

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

    return files.length
}

export { generate, generateOne, generateAll, generateIndexFile, watch, showUsage }
