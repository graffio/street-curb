// ABOUTME: Tests for tag database operations
// ABOUTME: Validates tag insert, find, and query functionality

import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { test } from 'tap'
import { fileURLToPath } from 'url'
import {
    clearTags,
    findTagByName,
    getAllTags,
    getTagCount,
    importTags,
    insertTag,
} from '../src/services/database/index.js'
import { QifEntry, Tag } from '../src/types/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const createTestDatabase = () => {
    const db = Database(':memory:')
    const schemaPath = join(__dirname, '..', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')
    db.exec(schema)
    return db
}

test('Tags Repository', t => {
    t.test('Given a fresh database', t => {
        const db = createTestDatabase()

        t.test('When I insert a basic tag', t => {
            const tagEntry = QifEntry.Tag.from({
                name: 'Important',
                color: '#FF0000',
                description: 'High priority items',
            })

            const tagId = insertTag(db, tagEntry)

            t.test('Then the tag is inserted with a valid ID', t => {
                t.match(tagId, /^tag_[a-f0-9]{12}$/, 'Tag ID should match pattern')
                t.end()
            })

            t.test('And I can find the tag by name', t => {
                const foundTag = findTagByName(db, 'Important')

                t.ok(foundTag, 'Tag should be found')
                t.same(foundTag.name, 'Important', 'Tag name should match')
                t.same(foundTag.color, '#FF0000', 'Color should match')
                t.same(foundTag.description, 'High priority items', 'Description should match')
                t.end()
            })

            t.end()
        })

        t.test('When I insert a tag with minimal data', t => {
            const tagEntry = QifEntry.Tag.from({ name: 'Work' })

            const tagId = insertTag(db, tagEntry)

            t.test('Then the tag is inserted successfully', t => {
                t.match(tagId, /^tag_[a-f0-9]{12}$/, 'Tag ID should match pattern')
                t.end()
            })

            t.test('And I can find the tag with default values', t => {
                const foundTag = findTagByName(db, 'Work')

                t.ok(foundTag, 'Tag should be found')
                t.same(foundTag.name, 'Work', 'Tag name should match')
                t.same(foundTag.color, null, 'Color should default to null')
                t.same(foundTag.description, null, 'Description should default to null')
                t.end()
            })

            t.end()
        })

        t.test('When I try to find a non-existent tag', t => {
            const foundTag = findTagByName(db, 'NonExistent')

            t.test('Then no tag is found', t => {
                t.same(foundTag, null, 'Should return null for non-existent tag')
                t.end()
            })

            t.end()
        })

        t.test('When I get all tags on a fresh database', t => {
            const db = createTestDatabase()
            const allTags = getAllTags(db)

            t.test('Then I get an empty array', t => {
                t.same(allTags, [], 'Should return empty array for fresh database')
                t.end()
            })

            t.end()
        })

        t.test('When I get the tag count on a fresh database', t => {
            const db = createTestDatabase()
            const count = getTagCount(db)

            t.test('Then the count is zero', t => {
                t.same(count, 0, 'Tag count should be zero for fresh database')
                t.end()
            })

            t.end()
        })

        t.test('When I clear tags', t => {
            clearTags(db)

            t.test('Then the operation completes without error', t => {
                t.pass('Clear tags should not throw an error')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('Given a database with existing tags', t => {
        const db = createTestDatabase()

        // Insert some test tags
        const tags = [
            QifEntry.Tag.from({ name: 'Important', color: '#FF0000', description: 'High priority' }),
            QifEntry.Tag.from({ name: 'Work', color: '#0000FF', description: 'Work-related items' }),
            QifEntry.Tag.from({ name: 'Personal', color: '#00FF00' }),
        ]

        tags.forEach(tag => insertTag(db, tag))

        t.test('When I get all tags', t => {
            const allTags = getAllTags(db)

            t.test('Then I get all tags in alphabetical order', t => {
                t.same(allTags.length, 3, 'Should return all 3 tags')
                t.same(allTags[0].name, 'Important', 'First tag should be Important')
                t.same(allTags[1].name, 'Personal', 'Second tag should be Personal')
                t.same(allTags[2].name, 'Work', 'Third tag should be Work')
                t.end()
            })

            t.test('And each tag has the correct structure', t => {
                allTags.forEach(tag => {
                    t.ok(Tag.is(tag), 'Each item should be a Tag type')
                    t.match(tag.id, /^tag_[a-f0-9]{12}$/, 'Each tag should have a valid ID')
                    t.ok(typeof tag.name === 'string', 'Each tag should have a string name')
                })
                t.end()
            })

            t.end()
        })

        t.test('When I get the tag count', t => {
            const count = getTagCount(db)

            t.test('Then the count matches the number of tags', t => {
                t.same(count, 3, 'Tag count should be 3')
                t.end()
            })

            t.end()
        })

        t.test('When I import additional tags', t => {
            const newTags = [
                QifEntry.Tag.from({ name: 'Urgent', color: '#FF6600', description: 'Very urgent items' }),
                QifEntry.Tag.from({ name: 'Review', description: 'Needs review' }),
            ]

            const tagIds = importTags(db, newTags)

            t.test('Then all tags are imported successfully', t => {
                t.same(tagIds.length, 2, 'Should return 2 tag IDs')
                tagIds.forEach(id => t.match(id, /^tag_[a-f0-9]{12}$/, 'Each ID should match pattern'))
                t.end()
            })

            t.test('And I can find the new tags', t => {
                const urgent = findTagByName(db, 'Urgent')
                const review = findTagByName(db, 'Review')

                t.ok(urgent, 'Urgent tag should be found')
                t.ok(review, 'Review tag should be found')
                t.same(urgent.color, '#FF6600', 'Urgent color should match')
                t.same(review.description, 'Needs review', 'Review description should match')
                t.end()
            })

            t.test('And the total count is updated', t => {
                const count = getTagCount(db)
                t.same(count, 5, 'Total tag count should be 5')
                t.end()
            })

            t.end()
        })

        t.test('When I clear all tags', t => {
            clearTags(db)

            t.test('Then all tags are removed', t => {
                const count = getTagCount(db)
                t.same(count, 0, 'Tag count should be zero after clearing')
                t.end()
            })

            t.test('And I cannot find any tags', t => {
                const allTags = getAllTags(db)
                t.same(allTags, [], 'All tags should return empty array')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('Given invalid input', t => {
        const db = createTestDatabase()

        t.test('When I try to insert a non-Tag entry', t => {
            const invalidEntry = { name: 'Invalid', color: '#000000' }

            t.test('Then an error is thrown', t => {
                t.throws(() => insertTag(db, invalidEntry), 'Should throw error for invalid entry type')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.end()
})
