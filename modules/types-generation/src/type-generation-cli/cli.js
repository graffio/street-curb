#!/usr/bin/env node

import { exec } from 'child_process'
import chokidar from 'chokidar'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { promisify } from 'util'
import { typeMappings } from './types-config.js'

const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '../../../../')

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

    console.log(`\nGenerating ${sourceFile} to ${targets.length} target(s)`)

    for (const targetDir of targets) {
        const cmd = `bash/generate-type-file.sh ${sourceFile} ${targetDir}`
        try {
            await execAsync(cmd, { cwd: REPO_ROOT })
            console.log(`    Generated to ${targetDir}`)
        } catch (error) {
            console.error(`    Failed to generate ${sourceFile}: ${error.message}`)
        }
    }

    // Generate index files for each target directory
    for (const targetDir of targets) {
        try {
            const indexCmd = `node modules/types-generation/src/generate-index-file.js ${targetDir}`
            await execAsync(indexCmd, { cwd: REPO_ROOT })
            console.log(`    Updated index: ${targetDir}/index.js`)
        } catch (error) {
            console.error(`  Failed to update index for ${targetDir}: ${error.message}`)
        }
    }
}

const generateAll = async () => {
    const sourceFiles = Object.keys(typeMappings)
    console.log(`Generating ${sourceFiles.length} type files`)

    for (const sourceFile of sourceFiles) await generate(sourceFile)
}

const watch = async () => {
    const sourceFiles = Object.keys(typeMappings).map(file => resolve(REPO_ROOT, file))
    console.log(`Watching ${sourceFiles.length} files`)
    const watcher = chokidar.watch(sourceFiles, { ignored: /node_modules/, persistent: true })

    watcher.on('change', async filePath => {
        const relativeFile = filePath.replace(REPO_ROOT + '/', '')
        console.log(`Changed: ${relativeFile}`)
        await generate(relativeFile)
    })

    console.log('Watching for changes...')
    return new Promise(() => {}) // Keep running
}

const showUsage = () => {
    console.log(`
Usage: node cli.js <command>

Commands:
  generate <file>    Generate types for specific file
  generate-all       Generate all configured types
  watch             Watch and auto-generate
  help              Show this help
`)
}

const main = async () => {
    const command = process.argv[2]

    if (command === 'generate') return await generate(process.argv[3])
    if (command === 'generate-all') return await generateAll()
    if (command === 'watch') return await watch()
    showUsage()
}

main().catch(console.error)
