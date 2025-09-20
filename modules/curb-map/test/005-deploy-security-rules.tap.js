import { readFileSync } from 'fs'
import { resolve } from 'path'
import tap from 'tap'

const loadConfig = configPath => {
    if (!configPath) {
        console.error('Error: No config file path provided')
        console.error('Usage: node 005-deploy-security-rules.tap.js <config-path>')
        process.exit(1)
    }

    const configContent = readFileSync(configPath, 'utf8')
    const defaultExportMatch = configContent.match(/export default\s+({[\s\S]*})/)

    if (!defaultExportMatch) {
        throw new Error(`Could not parse config file: ${configPath}`)
    }

    // eslint-disable-next-line no-eval
    const config = eval(`(${defaultExportMatch[1]})`)
    return { config, configPath: resolve(configPath) }
}

// Get config path from command line
const { config } = loadConfig(process.argv[2])
const projectId = config.firebaseProject?.projectId

if (!projectId) {
    console.error('Error: Config must contain firebaseProject.projectId')
    process.exit(1)
}

tap.test('Given the Firestore security rules configuration', t => {
    t.test('When checking Firebase configuration files exist locally', t => {
        const firebaseJsonPath = resolve('firebase.json')
        const rulesPath = resolve('firestore.rules')

        try {
            // Check firebase.json
            const firebaseJson = JSON.parse(readFileSync(firebaseJsonPath, 'utf8'))
            t.ok(firebaseJson.firestore, 'Then firebase.json should contain firestore configuration')
            t.equal(
                firebaseJson.firestore.rules,
                'firestore.rules',
                'Then firebase.json should point to firestore.rules',
            )

            // Check firestore.rules
            const rulesContent = readFileSync(rulesPath, 'utf8')
            t.ok(
                rulesContent.includes('infrastructure-audit-logs'),
                'Then firestore.rules should contain infrastructure audit rules',
            )
            t.ok(rulesContent.includes('user-audit-logs'), 'Then firestore.rules should contain user audit rules')
            t.ok(rulesContent.includes('allow read, write: if false'), 'Then firestore.rules should deny all access')
        } catch (error) {
            t.fail(`Firebase configuration files should exist: ${error.message}`)
        }

        t.end()
    })

    t.end()
})
