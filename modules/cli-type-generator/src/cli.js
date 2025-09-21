#!/usr/bin/env node

import { generate, generateAll, showUsage, watch } from './cli-api.js'

const main = async () => {
    const command = process.argv[2]

    if (command === 'generate') return await generate(process.argv[3])
    if (command === 'generate-all') return await generateAll()
    if (command === 'watch') return await watch()
    showUsage()
}

main().catch(console.error)
