/*
 * CLI command implementations - thin wrappers that call services and handle presentation
 */

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import {
    displayAccountRegister,
    displayAccountsWithNonZeroBalances,
    displayImportResults,
    displaySchemaInfo,
} from './cli-ui.js'
import {
    getAllCurrentHoldings,
    getAllSecurities,
    getDatabase,
    getDatabaseStats,
    getSchemaInfo,
    importQifData,
} from './services/database-service.js'
import { getAccountRegister, getAccountsWithBalances } from './services/database/accounts.js'
import parseQifFile from './services/qif-parsing-service.js'

/*
 * Display QIF parse results
 * @sig displayParseResults :: (QifData, Boolean) -> void
 */
const displayParseResults = qifData => {
    const { accounts, categories, securities, bankTransactions, investmentTransactions, prices, tags, others } = qifData

    console.log('\nParsed QIF data:')
    console.log(`Accounts: ${accounts.length}`)
    console.log(`Categories: ${categories.length}`)
    console.log(`Securities: ${securities.length}`)
    console.log(`Bank Transactions: ${bankTransactions.length}`)
    console.log(`Investment Transactions: ${investmentTransactions.length}`)
    console.log(`Prices: ${prices.length}`)
    console.log(`Tags: ${tags.length}`)
    console.log(`Other Entries: ${others.length}`)
}

const displayAccountsAndHoldings = argv => {
    // Get database connection for reporting
    const db = getDatabase(argv.database)

    try {
        const accountsWithBalances = getAccountsWithBalances(db)
        const allHoldings = getAllCurrentHoldings(db)
        const allSecurities = getAllSecurities(db)
        displayAccountsWithNonZeroBalances(accountsWithBalances, allHoldings, allSecurities, db)
    } catch (error) {
        console.log(`\n⚠️  Error during post-import analysis: ${error.message}`)
    }
}
/*
 * Handle import command - parse QIF file and import into database
 * @sig handleImport :: (Argv) -> void
 */
const handleImport = argv => {
    const filename = argv.file || argv._[1]
    if (!filename) throw new Error('Import command requires a file path')

    console.log(`Parsing QIF file: ${filename}`)
    const qifData = parseQifFile(filename)
    displayParseResults(qifData)

    console.log('\nImporting data into database...')
    importQifData(argv.database, qifData)
    displayImportResults(qifData)

    console.log(`\nDatabase: ${argv.database}`)
    console.log('Import completed successfully!')

    // Add reporting functionality
    console.log('\n' + '='.repeat(60))
    console.log('📋 POST-IMPORT ANALYSIS')
    console.log('='.repeat(60))

    displayAccountsAndHoldings(argv)
}

/*
 * Handle schema command - display database schema information
 * @sig handleSchema :: (Argv) -> void
 */
const handleSchema = argv => {
    try {
        const schemaInfo = getSchemaInfo(argv.database)
        displaySchemaInfo(schemaInfo)
        console.log(`\nDatabase: ${argv.database}`)
    } catch (error) {
        console.log(`Database: ${argv.database}`)
        console.log(`Error: ${error.message}`)
    }
}

/*
 * Display database statistics
 * @sig displayStats :: (DatabaseStats) -> void
 */
const displayStats = stats => {
    console.log('\n=== Database Statistics ===')
    console.log(`Accounts: ${stats.accounts}`)
    console.log(`Securities: ${stats.securities}`)
    console.log(`Categories: ${stats.categories}`)
    console.log(`Tags: ${stats.tags}`)
    console.log(`Transactions: ${stats.transactions}`)
    console.log(`Prices: ${stats.prices}`)
    console.log(`Lots: ${stats.lots}`)
    console.log(`Holdings: ${stats.holdings}`)
    console.log(`Daily Portfolios: ${stats.dailyPortfolios}`)
}

/*
 * Handle info command - display database statistics
 * @sig handleInfo :: (Argv) -> void
 */
const handleInfo = argv => {
    try {
        const stats = getDatabaseStats(argv.database)
        displayStats(stats)
        console.log(`\nDatabase: ${argv.database}`)
    } catch (error) {
        console.log(`Database: ${argv.database}`)
        console.log(`Error: ${error.message}`)
    }
}

/*
 * Handle register command - display account register
 * @sig handleRegister :: (Argv) -> void
 */
const handleRegister = argv => {
    const accountName = argv.account
    if (!accountName) throw new Error('Register command requires an account name')

    const db = getDatabase(argv.database)
    const registerEntries = getAccountRegister(db, accountName)
    displayAccountRegister(accountName, registerEntries)
    console.log(`\nDatabase: ${argv.database}`)
    db.close()
}

/*
 * Process command line arguments
 * @sig processArgs :: (Argv) -> void
 */
const processArgs = argv => {
    if (argv._.length === 0 && !argv.help && !argv.version) {
        console.log('Error: No command specified')
        console.log("Run 'qif-db --help' for usage information")
        process.exit(1)
    }

    const [command] = argv._

    if (command === 'import') return handleImport(argv)
    if (command === 'schema') return handleSchema(argv)
    if (command === 'info') return handleInfo(argv)
    if (command === 'register') return handleRegister(argv)

    throw new Error(`Unknown command: ${command}`)
}

/*
 * Main CLI entry point
 * @sig main :: () -> void
 */
const main = () => {
    try {
        const checkArgs = argv => {
            // Only require database for actual commands
            const command = argv._[0]
            const requiresDatabaseCommands = ['import', 'schema', 'info', 'register']
            if (command && requiresDatabaseCommands.includes(command) && !argv.database)
                throw new Error('Database path is required for this command')

            return true
        }

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

        processArgs(argv)
    } catch (error) {
        console.error(error)

        const showHelpMessage = () => console.error("Run 'qif-db --help' for usage information")
        const showUsageMessage = () => console.error('Usage: qif-db import <file>')

        if (error.message.includes('Unknown command')) showHelpMessage()
        if (error.message.includes('requires a file path')) showUsageMessage()
        process.exit(1)
    }
}

// Run if called directly - check if this module is the main module
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('cli.js')) main()
