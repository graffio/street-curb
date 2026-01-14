import { execSync } from 'child_process'
import { existsSync, unlinkSync } from 'fs'
import { dirname, join } from 'path'
import t from 'tap'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cliPath = join(__dirname, '../src/cli.js')
const testDbPath = join(__dirname, 'temp-test-database.db')

/*
 * Clean up test database before each test
 * @sig cleanupTestDb :: () -> void
 */
const cleanupTestDb = () => {
    if (existsSync(testDbPath)) unlinkSync(testDbPath)
}

/*
 * Clean up test database after all tests complete
 * @sig finalCleanup :: () -> void
 */
const finalCleanup = () => cleanupTestDb()

// Ensure cleanup happens when tests finish
t.teardown(finalCleanup)

t.test('Given I have a working CLI tool', t => {
    t.test('When I ask for help with `node cli.js --help`', t => {
        const output = execSync(`node ${cliPath} --help`, { encoding: 'utf8' })
        t.match(output, /Usage: qif-db/, 'Then it shows "Usage: qif-db" in the help text')
        t.match(output, /Commands:/, 'And it displays a "Commands:" section')
        t.match(output, /import/, 'And it lists "import" as an available command')
        t.match(output, /schema/, 'And it lists "schema" as an available command')
        t.match(output, /info/, 'And it lists "info" as an available command')
        t.end()
    })

    t.test('When I check the version with `node cli.js --version`', t => {
        const output = execSync(`node ${cliPath} --version`, { encoding: 'utf8' })
        t.match(output, /\d+\.\d+\.\d+/, 'Then it displays a semantic version number in x.y.z format')
        t.end()
    })

    t.test('When I try to import a valid QIF file with database integration', t => {
        cleanupTestDb()

        const output = execSync(
            `cd test ; node ${cliPath} import test-data/sample.qif --database ${testDbPath} --verbose`,
            { encoding: 'utf8' },
        )

        t.match(output, /Parsing QIF file/, 'Then it displays "Parsing QIF file" to indicate parsing has started')
        t.match(output, /Accounts: 1/, 'And it shows "Accounts: 1" indicating it found exactly one account')
        t.match(output, /Importing data into database/, 'And it shows database import starting')
        t.match(output, /Creating new database with schema/, 'And it creates new database with schema')
        t.match(output, /Import completed successfully/, 'And it confirms completion')
        t.ok(existsSync(testDbPath), 'And it creates the database file')
        t.end()
    })

    t.test('When I check database info after import', t => {
        cleanupTestDb()

        // First import data
        execSync(`cd test ; node ${cliPath} import test-data/sample.qif --database ${testDbPath}`, { encoding: 'utf8' })

        // Then check info
        const output = execSync(`node ${cliPath} info --database ${testDbPath}`, { encoding: 'utf8' })

        t.match(output, /Database Statistics/, 'Then it displays "Database Statistics" header')
        t.match(output, /Accounts: 1/, 'And it shows "Accounts: 1"')
        t.match(output, /Securities: 1/, 'And it shows "Securities: 1"')
        t.match(output, /Transactions: 2/, 'And it shows "Transactions: 2"')
        t.match(output, /Prices: 1/, 'And it shows "Prices: 1"')
        t.end()
    })

    t.test('When I check database schema after import', t => {
        cleanupTestDb()

        // First import data
        execSync(`cd test ; node ${cliPath} import test-data/sample.qif --database ${testDbPath}`, { encoding: 'utf8' })

        // Then check schema
        const output = execSync(`node ${cliPath} schema --database ${testDbPath}`, { encoding: 'utf8' })

        t.match(output, /Database Schema/, 'Then it displays "Database Schema" header')
        t.match(output, /Tables:/, 'And it shows "Tables:" section')
        t.match(output, /accounts:/, 'And it lists "accounts" table')
        t.match(output, /securities:/, 'And it lists "securities" table')
        t.match(output, /transactions:/, 'And it lists "transactions" table')
        t.match(output, /prices:/, 'And it lists "prices" table')
        t.end()
    })

    t.test('When I try to use commands on a non-existent database', t => {
        cleanupTestDb()

        const output = execSync(`node ${cliPath} info --database ${testDbPath}`, { encoding: 'utf8' })

        t.match(output, /Database Statistics/, 'Then it creates empty database and shows statistics')
        t.match(output, /Accounts: 0/, 'And it shows "Accounts: 0" for empty database')
        t.ok(existsSync(testDbPath), 'And it creates the database file')
        t.end()
    })

    t.test('When I import the same file twice', t => {
        cleanupTestDb()

        // First import
        execSync(`cd test; node ${cliPath} import test-data/sample.qif --database ${testDbPath}`, { encoding: 'utf8' })

        // Second import (should replace data)
        execSync(`cd test; node ${cliPath} import test-data/sample.qif --database ${testDbPath}`, { encoding: 'utf8' })

        // Check final counts
        const infoOutput = execSync(`node ${cliPath} info --database ${testDbPath}`, { encoding: 'utf8' })
        t.match(infoOutput, /Accounts: 1/, 'And final database still has exactly 1 account')
        t.end()
    })

    t.test('When I try to import a non-existent QIF file', t => {
        cleanupTestDb()

        try {
            execSync(`node ${cliPath} import missing.qif --database ${testDbPath}`, { encoding: 'utf8' })
            t.fail('Then it should complain about missing file')
        } catch (error) {
            t.match(error.stderr, /no such file or directory/, 'Then it displays "File not found" error message')
            t.equal(error.status, 1, 'And it exits with status code 1 indicating failure')
        }
        t.end()
    })

    t.test('When I forget to specify a command with `node cli.js`', t => {
        try {
            execSync(`node ${cliPath}`, { encoding: 'utf8' })
            t.fail('Then it should complain about missing command')
        } catch (error) {
            t.match(error.stdout, /No command specified/, 'Then it displays "No command specified" error message')
            t.equal(error.status, 1, 'And it exits with status code 1 indicating failure')
        }
        t.end()
    })

    t.end()
})
