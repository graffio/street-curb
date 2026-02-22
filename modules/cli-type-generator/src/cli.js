#!/usr/bin/env node
// ABOUTME: CLI entry point for type generation commands
// ABOUTME: Routes generate, generate-all, and watch commands to cli-api
// COMPLEXITY: cohesion-structure — CLI entry point; main() is conventional
// COMPLEXITY: function-naming — CLI entry point; main() is conventional
// COMPLEXITY: section-separators — CLI entry point has no exports

import { generate, generateAll, showUsage, watch } from './cli-api.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

// Process CLI arguments and route to appropriate command
// @sig handleCli :: () -> Promise<void>
const handleCli = async () => {
    const command = process.argv[2]

    if (command === 'generate') return await generate(process.argv[3])
    if (command === 'generate-all') return await generateAll()
    if (command === 'watch') return await watch()
    showUsage()
}

handleCli().catch(console.error)
