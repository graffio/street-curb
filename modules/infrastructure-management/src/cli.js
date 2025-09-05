#!/usr/bin/env node

/*
 * CurbMap Infrastructure Management CLI
 *
 * Command-line interface for managing infrastructure using
 * a Terraform-like plan/apply workflow. Provides environment-specific
 * safety guards and comprehensive audit logging.
 *
 * Usage:
 *   curb-infra plan create --env development --name "CurbMap Dev"
 *   curb-infra apply <plan-id>
 *   curb-infra destroy --project curb-map-old-dev
 */

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { createProductionAdapters, generatePlan, executePlan } from './index.js'
import { displayPlan } from './ui/display.js'
import { promptEnvironment, promptProjectConfig } from './ui/prompts.js'

/**
 * Store plans temporarily for apply command
 * In production, this would be a persistent store
 */
const planStore = new Map()

/**
 * Plan command handler - generates infrastructure plans
 * @sig handlePlanCommand :: (Object) -> Promise<Void>
 */
const handlePlanCommand = async argv => {
    try {
        let config

        if (argv.interactive) {
            const environment = await promptEnvironment()
            config = await promptProjectConfig(environment)
        } else {
            config = {
                environment: argv.env,
                projectName: argv.name,
                owner: argv.owner || process.env.USER || 'unknown',
                projectId: argv.project,
            }

            if (!config.environment || !config.projectName) {
                console.error('❌ Environment and project name are required')
                console.log('Use --interactive for guided setup, or provide --env and --name')
                process.exit(1)
            }
        }

        console.log('📋 Generating infrastructure plan...')

        // Create production adapter lookup table
        // TODO: In the future, support additional adapter path for testing
        const adapters = createProductionAdapters()
        const plan = await generatePlan(argv.operation, config, adapters)

        // Store plan with adapters for later apply
        planStore.set(plan.id, { plan, adapters })

        // Display the plan
        displayPlan(plan)

        console.log(`\\n✅ Plan generated: ${plan.id}`)
        console.log(`📝 To execute: curb-infra apply ${plan.id}`)
        console.log(`⏰ Plan expires: ${new Date(plan.expiresAt).toLocaleString()}`)
    } catch (error) {
        console.error(`❌ Plan generation failed: ${error.message}`)
        process.exit(1)
    }
}

/**
 * Apply command handler - executes infrastructure plans
 * @sig handleApplyCommand :: (Object) -> Promise<Void>
 */
const handleApplyCommand = async argv => {
    try {
        const planData = planStore.get(argv.planId)

        if (!planData) {
            console.error(`❌ Plan not found: ${argv.planId}`)
            console.log('Generate a plan first with: curb-infra plan <operation>')
            process.exit(1)
        }

        const { plan, adapters } = planData

        console.log(`🚀 Executing plan: ${argv.planId}`)
        const result = await executePlan(plan, adapters)

        // Clean up executed plan
        planStore.delete(argv.planId)

        console.log(`\\n✅ Execution completed successfully`)
        console.log(`⏱️  Total time: ${(result.duration / 1000).toFixed(1)}s`)
    } catch (error) {
        console.error(`❌ Execution failed: ${error.message}`)
        process.exit(1)
    }
}

/**
 * Show available plans
 * @sig handleListCommand :: () -> Void
 */
const handleListCommand = () => {
    if (planStore.size === 0) {
        console.log('📋 No plans available')
        console.log('Generate a plan with: curb-infra plan <operation>')
        return
    }

    console.log('📋 Available plans:')
    planStore.forEach((planData, id) => {
        const { plan } = planData
        const expires = new Date(plan.expiresAt)
        const isExpired = expires < new Date()

        console.log(`  ${id} - ${plan.operation} (${plan.config.environment})`)
        console.log(`    Created: ${new Date(plan.createdAt).toLocaleString()}`)
        console.log(`    Expires: ${expires.toLocaleString()} ${isExpired ? '❌ EXPIRED' : ''}`)
        console.log(`    Steps: ${plan.steps.length}`)
        console.log('')
    })
}

// CLI setup
yargs(hideBin(process.argv))
    .scriptName('curb-infra')
    .usage('$0 <command> [options]')
    .command(
        'plan <operation>',
        'Generate infrastructure plan',
        yargs => yargs
                .positional('operation', {
                    describe: 'Infrastructure operation to plan',
                    choices: ['create-environment', 'delete-environment'],
                    type: 'string',
                })
                .option('env', {
                    alias: 'e',
                    describe: 'Target environment',
                    choices: ['iac-test', 'development', 'staging', 'production'],
                    type: 'string',
                })
                .option('name', { alias: 'n', describe: 'Project display name', type: 'string' })
                .option('project', {
                    alias: 'p',
                    describe: 'Custom project ID (auto-generated if not specified)',
                    type: 'string',
                })
                .option('owner', { alias: 'o', describe: 'Project owner email', type: 'string' })
                .option('interactive', {
                    alias: 'i',
                    describe: 'Use interactive prompts',
                    type: 'boolean',
                    default: false,
                })
                .option('additional-adapter-path', {
                    describe: 'Additional path to load adapters from (for testing)',
                    type: 'string',
                }),
        handlePlanCommand,
    )
    .command(
        'apply <plan-id>',
        'Execute infrastructure plan',
        yargs => yargs.positional('plan-id', { describe: 'Plan ID to execute', type: 'string' }),
        handleApplyCommand,
    )
    .command('list', 'Show available plans', () => {}, handleListCommand)
    .option('verbose', { alias: 'v', describe: 'Enable verbose output', type: 'boolean', default: false })
    .help()
    .alias('help', 'h')
    .version('1.0.0')
    .alias('version', 'V')
    .demandCommand(1, 'You need to specify a command')
    .strict()
    .parse()
