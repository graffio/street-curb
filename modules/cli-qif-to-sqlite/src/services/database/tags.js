import { map } from '@graffio/functional'
import { Entry, Tag } from '../../types/index.js'

/*
 * Insert tag into database
 * @sig insertTag :: (Database, Entry.Tag) -> Number
 */
const insertTag = (db, tagEntry) => {
    if (!Entry.Tag.is(tagEntry)) throw new Error(`Expected Entry.Tag; found: ${JSON.stringify(tagEntry)}`)

    const stmt = db.prepare(`
        INSERT INTO tags (name, color, description)
        VALUES (?, ?, ?)
    `)

    const { name, color, description } = tagEntry

    // Coerce all optional fields to null
    const coercedColor = color == null ? null : color
    const coercedDescription = description == null ? null : description

    const result = stmt.run(name, coercedColor, coercedDescription)
    return result.lastInsertRowid
}

/*
 * Import tags into database
 * @sig importTags :: (Database, [Entry.Tag]) -> [Number]
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
