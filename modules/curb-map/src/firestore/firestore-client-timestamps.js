import admin from 'firebase-admin'

/*
 * A Server Timestamp Placeholder is a special object in Firebase/Firestore that represents "the current server time"
 * but doesn't have an actual timestamp value until it's processed by the Firestore server.
 * @sig isServerTimestampPlaceholder :: Any -> Boolean
 */
const isServerTimestampPlaceholder = timestamp =>
    timestamp._methodName === 'serverTimestamp' ||
    timestamp._delegate ||
    (typeof timestamp === 'object' && timestamp !== null && Object.keys(timestamp).length === 0)

// @sig serverTimestampToDate :: Any -> Date
const serverTimestampToDate = timestamp => {
    if (timestamp === null || timestamp === undefined) return null
    if (timestamp instanceof Date) return timestamp
    if (timestamp?.toDate) return timestamp.toDate()
    if (isServerTimestampPlaceholder(timestamp)) return new Date() // current date: approximates placeholder on client

    if (typeof timestamp === 'string') {
        const parsed = new Date(timestamp)
        if (!isNaN(parsed.getTime())) return parsed
    }

    throw new Error(`Invalid timestamp format: ${JSON.stringify(timestamp)}`)
}

// @sig dateToServerTimestamp :: Any -> Object
const dateToServerTimestamp = date => {
    if (date === null || date === undefined) return null
    if (date instanceof Date) return admin.firestore.Timestamp.fromDate(date)
    if (isServerTimestampPlaceholder(date)) return date

    if (typeof date === 'string') {
        const parsed = new Date(date)
        if (!isNaN(parsed.getTime())) return admin.firestore.Timestamp.fromDate(parsed)
    }

    throw new Error(`Invalid date format: ${JSON.stringify(date)}`)
}

export { serverTimestampToDate, dateToServerTimestamp }
