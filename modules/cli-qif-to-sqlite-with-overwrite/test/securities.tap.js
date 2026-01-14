// ABOUTME: Tests for security database operations
// ABOUTME: Validates security insert, find, and query functionality

import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { test } from 'tap'
import { fileURLToPath } from 'url'
import {
    clearSecurities,
    findSecurityByName,
    findSecurityByNameOrSymbol,
    findSecurityBySymbol,
    getAllSecurities,
    getSecurityCount,
    importSecurities,
    insertSecurity,
} from '../src/services/database/securities.js'
import { QifEntry, Security } from '../src/types/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const createTestDatabase = () => {
    const db = Database(':memory:')
    const schemaPath = join(__dirname, '..', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')
    db.exec(schema)
    return db
}

test('Securities Repository', t => {
    t.test('Given a fresh database', t => {
        const db = createTestDatabase()

        t.test('When I insert a basic security', t => {
            const securityEntry = QifEntry.Security.from({
                name: 'Apple Inc.',
                symbol: 'AAPL',
                type: 'Stock',
                goal: 'Growth',
            })

            const securityId = insertSecurity(db, securityEntry)

            t.test('Then the security is inserted with a valid ID', t => {
                t.match(securityId, /^sec_[a-f0-9]{12}$/, 'Security ID should match pattern')
                t.end()
            })

            t.test('And I can find the security by name', t => {
                const foundSecurity = findSecurityByName(db, 'Apple Inc.')

                t.ok(foundSecurity, 'Security should be found')
                t.same(foundSecurity.name, 'Apple Inc.', 'Security name should match')
                t.same(foundSecurity.symbol, 'AAPL', 'Symbol should match')
                t.same(foundSecurity.type, 'Stock', 'Type should match')
                t.same(foundSecurity.goal, 'Growth', 'Goal should match')
                t.end()
            })

            t.test('And I can find the security by symbol', t => {
                const foundSecurity = findSecurityBySymbol(db, 'AAPL')

                t.ok(foundSecurity, 'Security should be found by symbol')
                t.same(foundSecurity.name, 'Apple Inc.', 'Security name should match')
                t.same(foundSecurity.symbol, 'AAPL', 'Symbol should match')
                t.end()
            })

            t.test('And I can find the security by name or symbol', t => {
                const foundByName = findSecurityByNameOrSymbol(db, 'Apple Inc.')
                const foundBySymbol = findSecurityByNameOrSymbol(db, 'AAPL')

                t.ok(foundByName, 'Security should be found by name')
                t.ok(foundBySymbol, 'Security should be found by symbol')
                t.same(foundByName.id, foundBySymbol.id, 'Both should return the same security')
                t.end()
            })

            t.end()
        })

        t.test('When I insert a security with minimal data', t => {
            const securityEntry = QifEntry.Security.from({ name: 'Microsoft Corporation' })

            const securityId = insertSecurity(db, securityEntry)

            t.test('Then the security is inserted successfully', t => {
                t.match(securityId, /^sec_[a-f0-9]{12}$/, 'Security ID should match pattern')
                t.end()
            })

            t.test('And I can find the security with default values', t => {
                const foundSecurity = findSecurityByName(db, 'Microsoft Corporation')

                t.ok(foundSecurity, 'Security should be found')
                t.same(foundSecurity.name, 'Microsoft Corporation', 'Security name should match')
                t.same(foundSecurity.symbol, null, 'Symbol should default to null')
                t.same(foundSecurity.type, null, 'Type should default to null')
                t.same(foundSecurity.goal, null, 'Goal should default to null')
                t.end()
            })

            t.end()
        })

        t.test('When I try to find a non-existent security', t => {
            const foundSecurity = findSecurityByName(db, 'NonExistent')

            t.test('Then no security is found', t => {
                t.same(foundSecurity, null, 'Should return null for non-existent security')
                t.end()
            })

            t.end()
        })

        t.test('When I get all securities on a fresh database', t => {
            const db = createTestDatabase()
            const allSecurities = getAllSecurities(db)

            t.test('Then I get an empty array', t => {
                t.same(allSecurities, [], 'Should return empty array for fresh database')
                t.end()
            })

            t.end()
        })

        t.test('When I get the security count on a fresh database', t => {
            const db = createTestDatabase()
            const count = getSecurityCount(db)

            t.test('Then the count is zero', t => {
                t.same(count, 0, 'Security count should be zero for fresh database')
                t.end()
            })

            t.end()
        })

        t.test('When I clear securities', t => {
            clearSecurities(db)

            t.test('Then the operation completes without error', t => {
                t.pass('Clear securities should not throw an error')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('Given a database with existing securities', t => {
        const db = createTestDatabase()

        // Insert some test securities
        const securities = [
            QifEntry.Security.from({ name: 'Apple Inc.', symbol: 'AAPL', type: 'Stock' }),
            QifEntry.Security.from({ name: 'Microsoft Corporation', symbol: 'MSFT', type: 'Stock' }),
            QifEntry.Security.from({ name: 'Tesla Inc.', symbol: 'TSLA', type: 'Stock' }),
        ]

        securities.forEach(security => insertSecurity(db, security))

        t.test('When I get all securities', t => {
            const allSecurities = getAllSecurities(db)

            t.test('Then I get all securities in alphabetical order', t => {
                t.same(allSecurities.length, 3, 'Should return all 3 securities')
                t.same(allSecurities[0].name, 'Apple Inc.', 'First security should be Apple Inc.')
                t.same(
                    allSecurities[1].name,
                    'Microsoft Corporation',
                    'Second security should be Microsoft Corporation',
                )
                t.same(allSecurities[2].name, 'Tesla Inc.', 'Third security should be Tesla Inc.')
                t.end()
            })

            t.test('And each security has the correct structure', t => {
                allSecurities.forEach(security => {
                    t.ok(Security.is(security), 'Each item should be a Security type')
                    t.match(security.id, /^sec_[a-f0-9]{12}$/, 'Each security should have a valid ID')
                    t.ok(typeof security.name === 'string', 'Each security should have a string name')
                })
                t.end()
            })

            t.end()
        })

        t.test('When I get the security count', t => {
            const count = getSecurityCount(db)

            t.test('Then the count matches the number of securities', t => {
                t.same(count, 3, 'Security count should be 3')
                t.end()
            })

            t.end()
        })

        t.test('When I import additional securities', t => {
            const newSecurities = [
                QifEntry.Security.from({ name: 'Google LLC', symbol: 'GOOGL', type: 'Stock' }),
                QifEntry.Security.from({ name: 'Amazon.com Inc.', symbol: 'AMZN', type: 'Stock' }),
            ]

            const securityIds = importSecurities(db, newSecurities)

            t.test('Then all securities are imported successfully', t => {
                t.same(securityIds.length, 2, 'Should return 2 security IDs')
                securityIds.forEach(id => t.match(id, /^sec_[a-f0-9]{12}$/, 'Each ID should match pattern'))
                t.end()
            })

            t.test('And I can find the new securities', t => {
                const google = findSecurityByName(db, 'Google LLC')
                const amazon = findSecurityByName(db, 'Amazon.com Inc.')

                t.ok(google, 'Google security should be found')
                t.ok(amazon, 'Amazon security should be found')
                t.same(google.symbol, 'GOOGL', 'Google symbol should match')
                t.same(amazon.symbol, 'AMZN', 'Amazon symbol should match')
                t.end()
            })

            t.test('And the total count is updated', t => {
                const count = getSecurityCount(db)
                t.same(count, 5, 'Total security count should be 5')
                t.end()
            })

            t.end()
        })

        t.test('When I clear all securities', t => {
            clearSecurities(db)

            t.test('Then all securities are removed', t => {
                const count = getSecurityCount(db)
                t.same(count, 0, 'Security count should be zero after clearing')
                t.end()
            })

            t.test('And I cannot find any securities', t => {
                const allSecurities = getAllSecurities(db)
                t.same(allSecurities, [], 'All securities should return empty array')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('Given invalid input', t => {
        const db = createTestDatabase()

        t.test('When I try to insert a non-Security entry', t => {
            const invalidEntry = { name: 'Invalid', symbol: 'INV' }

            t.test('Then an error is thrown', t => {
                t.throws(() => insertSecurity(db, invalidEntry), 'Should throw error for invalid entry type')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.end()
})
