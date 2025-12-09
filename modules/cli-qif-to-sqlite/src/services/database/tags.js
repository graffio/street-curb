import { map } from '@graffio/functional'
import { hashFields } from '@graffio/functional/src/generate-entity-id.js'
import { Entry, Tag } from '../../types/index.js'

/*
 * Generate deterministic tag ID from name
 * @sig generateTagId :: String -> String
 */
const generateTagId = name => `tag_${hashFields({ name })}`

/*
 * Insert tag into database (dedupes on collision)
 * @sig insertTag :: (Database, Entry.Tag) -> String
 */
const insertTag = (db, tagEntry) => {
    if (!Entry.Tag.is(tagEntry)) throw new Error(`Expected Entry.Tag; found: ${JSON.stringify(tagEntry)}`)

    const id = generateTagId(tagEntry.name)

    // Check if tag already exists (dedupe)
    const existing = db.prepare('SELECT id FROM tags WHERE id = ?').get(id)
    if (existing) return existing.id

    const stmt = db.prepare(`
        INSERT INTO tags (id, name, color, description)
        VALUES (?, ?, ?, ?)
    `)

    const { name, color, description } = tagEntry

    // Coerce all optional fields to null
    const coercedColor = color == null ? null : color
    const coercedDescription = description == null ? null : description

    stmt.run(id, name, coercedColor, coercedDescription)
    return id
}

/*
 * Import tags into database
 * @sig importTags :: (Database, [Entry.Tag]) -> [String]
 */
const importTags = (db, tags) => map(tag => insertTag(db, tag), tags)

/*
 * Find tag by name
 * @sig findTagByName :: (Database, String) -> Tag?
 */
const findTagByName = (db, tagName) => {
    const record = db.prepare('SELECT id, name, color, description FROM tags WHERE name = ?').get(tagName)

    return record ? Tag.from(record) : null
}

/*
 * Get all tags from database
 * @sig getAllTags :: (Database) -> [Tag]
 */
const getAllTags = db => {
    const records = db.prepare('SELECT id, name, color, description FROM tags ORDER BY name').all()

    return map(Tag.from, records)
}

/*
 * Get tag count
 * @sig getTagCount :: (Database) -> Number
 */
const getTagCount = db => {
    const result = db.prepare('SELECT COUNT(*) as count FROM tags').get()
    return result.count
}

/*
 * Clear all tags from database
 * @sig clearTags :: (Database) -> void
 */
const clearTags = db => db.prepare('DELETE FROM tags').run()

export { insertTag, findTagByName, getAllTags, getTagCount, importTags, clearTags }
