// ABOUTME: CLI command implementations for QIF database operations
// ABOUTME: Thin wrappers that call services and handle presentation

// COMPLEXITY-TODO: functions — CLI has 12 handlers/helpers, split deferred (expires 2026-04-01)
// COMPLEXITY-TODO: cohesion-structure — E group size 9, split deferred (expires 2026-04-01)

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import {
    displayAccountRegister,
    displayAccountsWithNonZeroBalances,
    displayImportResults,
    displaySchemaInfo,
} from './cli-ui.js'
import { DatabaseService } from './services/database-service.js'
import { getAccountRegister, getAccountsWithBalances } from './services/database/accounts.js'
import parseQifFile from './services/qif-parsing-service.js'

const { collectDatabaseStats, createDatabase, getAllCurrentHoldings, getAllSecurities, importQifData, toSchemaInfo } =
    DatabaseService

const E = {
    /* Output parsed QIF data summary to console
     * @sig emitParseResults :: QifData -> void
     */
    emitParseResults: qifData => {
        const { accounts, bankTransactions, categories, investmentTransactions, others, prices, securities, tags } =
            qifData

        console.log('\nParsed QIF data:')
        console.log(`Accounts: ${accounts.length}`)
        console.log(`Categories: ${categories.length}`)
        console.log(`Securities: ${securities.length}`)
        console.log(`Bank Transactions: ${bankTransactions.length}`)
        console.log(`Investment Transactions: ${investmentTransactions.length}`)
        console.log(`Prices: ${prices.length}`)
        console.log(`Tags: ${tags.length}`)
        console.log(`Other Entries: ${others.length}`)
    },

    /* Output accounts and holdings summary to console
     * @sig emitAccountsAndHoldings :: String -> void
     */
    emitAccountsAndHoldings: database => {
        const db = createDatabase(database)

        try {
            const accountsWithBalances = getAccountsWithBalances(db)
            const allHoldings = getAllCurrentHoldings(db)
            const allSecurities = getAllSecurities(db)
            displayAccountsWithNonZeroBalances(accountsWithBalances, allHoldings, allSecurities, db)
        } catch (error) {
            console.log(`\n⚠️  Error during post-import analysis: ${error.message}`)
        }
    },

    /* Handle import command - parse QIF file and import into database
     * @sig handleImport :: Argv -> void
     */
    handleImport: argv => {
        const { _, database, file } = argv
        const filename = file || _[1]
        if (!filename) throw new Error('Import command requires a file path')

        console.log(`Parsing QIF file: ${filename}`)
        const qifData = parseQifFile(filename)
        E.emitParseResults(qifData)

        console.log('\nImporting data into database...')
        importQifData(database, qifData)
        displayImportResults(qifData)

        console.log(`\nDatabase: ${database}`)
        console.log('Import completed successfully!')

        console.log('\n' + '='.repeat(60))
        console.log('📋 POST-IMPORT ANALYSIS')
        console.log('='.repeat(60))

        E.emitAccountsAndHoldings(database)
    },

    /* Handle schema command - display database schema information
     * @sig handleSchema :: Argv -> void
     */
    handleSchema: argv => {
        const { database } = argv
        try {
            const schemaInfo = toSchemaInfo(database)
            displaySchemaInfo(schemaInfo)
            console.log(`\nDatabase: ${database}`)
        } catch (error) {
            console.log(`Database: ${database}`)
            console.log(`Error: ${error.message}`)
        }
    },

    /* Output database statistics to console
     * @sig emitStats :: DatabaseStats -> void
     */
    emitStats: stats => {
        const { accounts, categories, dailyPortfolios, holdings, lots, prices, securities, tags, transactions } = stats
        console.log('\n=== Database Statistics ===')
        console.log(`Accounts: ${accounts}`)
        console.log(`Securities: ${securities}`)
        console.log(`Categories: ${categories}`)
        console.log(`Tags: ${tags}`)
        console.log(`Transactions: ${transactions}`)
        console.log(`Prices: ${prices}`)
        console.log(`Lots: ${lots}`)
        console.log(`Holdings: ${holdings}`)
        console.log(`Daily Portfolios: ${dailyPortfolios}`)
    },

    /* Handle info command - display database statistics
     * @sig handleInfo :: Argv -> void
     */
    handleInfo: argv => {
        const { database } = argv
        try {
            const stats = collectDatabaseStats(database)
            E.emitStats(stats)
            console.log(`\nDatabase: ${database}`)
        } catch (error) {
            console.log(`Database: ${database}`)
            console.log(`Error: ${error.message}`)
        }
    },

    /* Handle register command - display account register
     * @sig handleRegister :: Argv -> void
     */
    handleRegister: argv => {
        const { account, database } = argv
        if (!account) throw new Error('Register command requires an account name')

        const db = createDatabase(database)
        const registerEntries = getAccountRegister(db, account)
        displayAccountRegister(account, registerEntries)
        console.log(`\nDatabase: ${database}`)
        db.close()
    },

    /* Dispatch command to appropriate handler
     * @sig dispatchCommand :: Argv -> void
     */
    dispatchCommand: argv => {
        const { _, help, version } = argv
        if (_.length === 0 && !help && !version) {
            console.log('Error: No command specified')
            console.log("Run 'qif-db --help' for usage information")
            process.exit(1)
        }

        const [command] = _

        if (command === 'import') return E.handleImport(argv)
        if (command === 'schema') return E.handleSchema(argv)
        if (command === 'info') return E.handleInfo(argv)
        if (command === 'register') return E.handleRegister(argv)

        throw new Error(`Unknown command: ${command}`)
    },

    /* Main CLI entry point
     * @sig main :: () -> void
     */
    main: () => {
        /* Check that required arguments are present
         * @sig checkArgs :: Argv -> Boolean
         */
        const checkArgs = argv => {
            const { _, database } = argv
            const command = _[0]
            const requiresDatabaseCommands = ['import', 'schema', 'info', 'register']
            if (command && requiresDatabaseCommands.includes(command) && !database)
                throw new Error('Database path is required for this command')

            return true
        }

        const emitHelpMessage = () => console.error("Run 'qif-db --help' for usage information")
        const emitUsageMessage = () => console.error('Usage: qif-db import <file>')

        try {
            const argv = yargs(hideBin(process.argv))
                .usage('Usage: qif-db <command> [options]')
                .command('import <file>', 'Import QIF file into database')
                .command('schema', 'Show database schema information')
                .command('info', 'Show database statistics')
                .command('register', 'Show account register with running cash balances')
                .option('database', { alias: 'd', type: 'string', description: 'Database file path' })
                .option('account', { alias: 'a', type: 'string', description: 'Account name (for register command)' })
                .help()
                .alias('help', 'h')
                .version()
                .alias('version', 'v')
                .check(checkArgs)
                .parse()

            E.dispatchCommand(argv)
        } catch (error) {
            console.error(error)

            if (error.message.includes('Unknown command')) emitHelpMessage()
            if (error.message.includes('requires a file path')) emitUsageMessage()
            process.exit(1)
        }
    },
}

// Run if called directly - check if this module is the main module
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('cli.js')) E.main()
