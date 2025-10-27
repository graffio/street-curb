import { mapReturningFirst } from '@graffio/functional'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const helperFilename = fileURLToPath(import.meta.url)

const normalizeTestName = filepath =>
    path
        .basename(filepath)
        .replace(/\.integration-test\.js$/, '')
        .replace(/\W+/g, '-')

const documentName = () => {
    const d = new Date()

    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    const second = String(d.getSeconds()).padStart(2, '0')
    const milliseconds = String(d.getMilliseconds()).padStart(3, '0')

    return [month, day].join('-') + '^' + [hour, minute, second, milliseconds].join(':')
}

const collectionName = () => {
    const isIntegrationTestRow = line => {
        const match = line.match(/file:\/\/\/[^):]+/)
        if (!match) return undefined

        const filepath = fileURLToPath(match[0])
        const normalized = filepath.replace(/\\/g, '/')
        if (!normalized.endsWith('.integration-test.js')) return undefined

        return normalizeTestName(normalized)
    }

    const stack = new Error().stack?.split('\n').slice(1) || []
    return mapReturningFirst(isIntegrationTestRow, stack) || normalizeTestName(helperFilename)
}

const buildNamespace = () => `${collectionName()}/${documentName()}`

export { buildNamespace }
