import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { test } from 'tap'
import { fileURLToPath } from 'url'
import {
    clearAccounts,
    findAccountByName,
    getAccountCount,
    getAllAccounts,
    importAccounts,
    insertAccount,
} from '../src/services/database/index.js'

import { Account, Entry } from '../src/types/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const createTestDatabase = () => {
    const db = Database(':memory:')
    const schemaPath = join(__dirname, '..', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')
    db.exec(schema)
    return db
}

const validEntryAccount = Entry.Account.from({
    name: 'Test Checking Account',
    type: 'Bank',
    description: 'Primary checking account',
    creditLimit: 1000.0,
})

const validEntryAccount2 = Entry.Account.from({
    name: 'Test Savings Account',
    type: 'Bank',
    description: 'High-yield savings',
})

const invalidAccount = { name: 'Invalid Account', type: 'Bank' }

test('Account Repository Tests', t => {
    t.test('Given an invalid account object', t => {
        t.test('When inserting into something into the database that is NOT an Entry.Account', t => {
            const db = createTestDatabase()
            t.throws(
                () => insertAccount(db, invalidAccount),
                /Expected Entry.Account; found: {"name":"Invalid Account","type":"Bank"}/,
                'Then it should throw an error',
            )
            db.close()
            t.end()
        })
        t.end()
    })

    t.test('Given a valid Entry.Account', t => {
        t.test('When inserting it into database', t => {
            const db = createTestDatabase()
            const accountId = insertAccount(db, validEntryAccount)
            t.ok(accountId > 0, 'Then it returns a valid (new) row ID')
            db.close()
            t.end()
        })
        t.end()
    })

    t.test('Given an existing account', t => {
        t.test(`When calling findAccountByName with the account's name`, t => {
            const db = createTestDatabase()
            insertAccount(db, validEntryAccount)
            const foundAccount = findAccountByName(db, validEntryAccount.name)

            t.ok(Account.is(foundAccount), 'Then it returns the Account')
            t.same(foundAccount.name, validEntryAccount.name, 'And the name matches')
            t.same(foundAccount.type, validEntryAccount.type, 'And the type matches')
            t.same(foundAccount.description, validEntryAccount.description, 'And the description matches')
            t.same(foundAccount.creditLimit, validEntryAccount.creditLimit, 'And the credit limit matches')
            db.close()
            t.end()
        })
        t.end()
    })

    t.test('Given a non-existent account name', t => {
        t.test(`When calling findAccountByName with the account's name`, t => {
            const db = createTestDatabase()
            const foundAccount = findAccountByName(db, 'Non-existent Account')
            t.notOk(foundAccount, 'Then it returns null')
            db.close()
            t.end()
        })
        t.end()
    })

    t.test('Given multiple accounts in database', t => {
        t.test('When getting all accounts', t => {
            const db = createTestDatabase()
            insertAccount(db, validEntryAccount)
            insertAccount(db, validEntryAccount2)

            const allAccounts = getAllAccounts(db)

            t.same(allAccounts.length, 2, 'Then it returns all accounts')
            t.ok(Account.is(allAccounts[0]), 'And the first account is an Account object')
            t.ok(Account.is(allAccounts[1]), 'And the second account is an Account object')
            t.same(allAccounts[0].name, validEntryAccount.name, 'Then first account name matches')
            t.same(allAccounts[1].name, validEntryAccount2.name, 'Then second account name matches')
            db.close()
            t.end()
        })
        t.end()
    })

    t.test('Given accounts in a database', t => {
        t.test('When getting the account count', t => {
            const db = createTestDatabase()
            insertAccount(db, validEntryAccount)
            insertAccount(db, validEntryAccount2)

            const count = getAccountCount(db)

            t.same(count, 2, 'Then the count matches the number of accounts')
            db.close()
            t.end()
        })
        t.end()
    })

    t.test('Given multiple accounts to import', t => {
        t.test('When importing all accounts', t => {
            const db = createTestDatabase()
            const accounts = [validEntryAccount, validEntryAccount2]

            const results = importAccounts(db, accounts)

            t.same(results.length, 2, 'Then all accounts are inserted')
            t.ok(results[0] > 0, 'Then first account has valid ID')
            t.ok(results[1] > 0, 'Then second account has valid ID')
            t.same(getAccountCount(db), 2, 'Then database contains correct count')
            db.close()
            t.end()
        })
        t.end()
    })

    t.test('Given accounts in database', t => {
        t.test('When clearing all accounts', t => {
            const db = createTestDatabase()
            insertAccount(db, validEntryAccount)
            insertAccount(db, validEntryAccount2)

            clearAccounts(db)

            t.same(getAccountCount(db), 0, 'Then all accounts are removed')
            db.close()
            t.end()
        })
        t.end()
    })

    t.test('Given account with a credit limit', t => {
        t.test('After inserting an Account and retrieving it from the database', t => {
            const db = createTestDatabase()
            insertAccount(db, validEntryAccount)
            const retrievedAccount = findAccountByName(db, validEntryAccount.name)
            t.same(retrievedAccount.creditLimit, 1000.0, 'Then the credit limit is correct')
            db.close()
            t.end()
        })
        t.end()
    })

    t.test('Given account without a credit limit', t => {
        t.test('When inserting and retrieving an account from the database', t => {
            const db = createTestDatabase()
            insertAccount(db, validEntryAccount2)

            const retrievedAccount = findAccountByName(db, validEntryAccount2.name)
            t.same(retrievedAccount.creditLimit, null, 'Then credit limit is null')
            db.close()
            t.end()
        })
        t.end()
    })

    t.test('Given empty accounts array', t => {
        t.test('When importing accounts', t => {
            const db = createTestDatabase()

            const results = importAccounts(db, [])

            t.same(results.length, 0, 'Then no accounts are inserted')
            t.same(getAccountCount(db), 0, 'Then database remains empty')
            db.close()
            t.end()
        })
        t.end()
    })

    t.end()
})
