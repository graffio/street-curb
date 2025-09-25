import { existsSync, statSync, unlinkSync } from 'fs'
import { resolve } from 'path'

/*
 * Execute a JSON HTTP request with Application Default Credentials
 * @sig requestJson :: ({ url :: String, method :: String, body :: Object?, headers :: Object? }) -> Promise<Object>
 */
const requestJson = async ({ url, method = 'GET', body, headers = {} }) => {
    const fetchImpl = globalThis.fetch || (await import('node-fetch')).default
    const { GoogleAuth } = await import('google-auth-library')
    const targetAudience = process.env.GOOGLE_CLOUD_TARGET_AUDIENCE
    const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        clientOptions: targetAudience ? { target_audience: targetAudience } : undefined,
    })
    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()
    console.log(`    [EXEC] ${method.toUpperCase()} ${url}`)
    const finalHeaders = {
        'content-type': 'application/json; charset=utf-8',
        authorization: `Bearer ${accessToken.token || accessToken}`,
        ...headers,
    }
    const response = await fetchImpl(url, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : undefined,
    })
    if (!response.ok) {
        const text = await response.text()
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${text}`)
    }
    if (response.status === 204) return {}
    return response.json()
}

/*
 * Expand ~ to the user's home directory
 * @sig expandHome :: String -> String
 */
const expandHome = path => {
    if (!path) return path
    const home = process.env.HOME
    if (!home) return path
    return path.startsWith('~') ? path.replace('~', home) : path
}

/*
 * Safely quote a shell argument for POSIX shells
 * @sig shellQuote :: String -> String
 */
const shellQuote = value => `'${value.replace(/'/g, "'\\''")}'`

/*
 * Create a dry-run aware command runner
 * @sig createRunCommand :: (String -> Promise<Object>) -> ((Boolean, String) -> Promise<Result>)
 */
const createRunCommand = executeShellCommand => {
    if (typeof executeShellCommand !== 'function') throw new Error('executeShellCommand must be a function')
    return async (isDryRun, command) => {
        if (isDryRun) {
            console.log(`    [DRY-RUN] ${command}`)
            return { status: 'success', output: 'dry-run' }
        }
        const result = await executeShellCommand(command)
        return { status: 'success', output: result.output }
    }
}

/*
 * Ensure a directory exists and has the expected permissions
 * @sig ensureDirectory :: (Boolean, (Boolean, String) -> Promise<Result>, String, String) -> Promise<Result>
 */
const ensureDirectory = async (isDryRun, runCommand, directoryPath, mode = '700') => {
    const resolvedPath = resolve(directoryPath)
    const quotedPath = shellQuote(resolvedPath)
    if (!existsSync(resolvedPath)) await runCommand(isDryRun, `mkdir -p ${quotedPath}`)
    await runCommand(isDryRun, `chmod ${mode} ${quotedPath}`)
    return { status: 'success', output: 'directory ensured' }
}

/*
 * Ensure a file has the expected permissions
 * @sig ensureFilePermissions :: (Boolean, (Boolean, String) -> Promise<Result>, String, String) -> Promise<Result>
 */
const ensureFilePermissions = async (isDryRun, runCommand, filePath, mode = '600') => {
    const resolvedPath = resolve(filePath)
    const quotedPath = shellQuote(resolvedPath)
    await runCommand(isDryRun, `chmod ${mode} ${quotedPath}`)
    return { status: 'success', output: 'permissions ensured' }
}

/*
 * Ensure a service account key exists, creating it when missing
 * @sig ensureServiceAccountKey :: (Boolean, (Boolean, String) -> Promise<Result>, String, String, (Error -> Error?)) -> Promise<Result>
 */
const ensureServiceAccountKey = async (isDryRun, runCommand, keyPath, createCommand, onCreateError) => {
    const resolvedPath = resolve(keyPath)
    const quotedPath = shellQuote(resolvedPath)
    const fileExists = existsSync(resolvedPath)
    const fileHasContent = fileExists ? statSync(resolvedPath).size > 0 : false

    if (fileExists && fileHasContent) {
        await runCommand(isDryRun, `chmod 600 ${quotedPath}`)
        return { status: 'success', output: 'key exists' }
    }

    if (fileExists && !fileHasContent && !isDryRun) {
        unlinkSync(resolvedPath)
        console.log(`    [CLEANUP] Removed empty key placeholder at ${resolvedPath}`)
    }

    if (fileExists && !fileHasContent && isDryRun)
        console.log(`    [DRY-RUN] Would remove empty key placeholder at ${resolvedPath}`)

    if (isDryRun && !fileExists) return runCommand(true, createCommand)

    if (isDryRun && fileExists && !fileHasContent) return { status: 'success', output: 'dry-run key cleanup' }

    if (isDryRun) return { status: 'success', output: 'dry-run key exists' }

    try {
        await runCommand(false, createCommand)
    } catch (error) {
        if (existsSync(resolvedPath) && statSync(resolvedPath).size === 0) {
            unlinkSync(resolvedPath)
            console.log(`    [CLEANUP] Removed empty key placeholder after failure at ${resolvedPath}`)
        }
        if (!onCreateError) throw error
        const transformed = onCreateError(error)
        if (transformed) throw transformed
        return { status: 'failure', output: 'key creation skipped' }
    }
    await runCommand(false, `chmod 600 ${quotedPath}`)
    return { status: 'success', output: 'key created' }
}

export {
    createRunCommand,
    ensureDirectory,
    ensureFilePermissions,
    ensureServiceAccountKey,
    expandHome,
    requestJson,
    shellQuote,
}
