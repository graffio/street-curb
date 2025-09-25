import { GoogleAuth } from 'google-auth-library'
import nodeFetch from 'node-fetch'
import { Result } from '../../types/result.js'

const { Success, Failure } = Result

const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] })
let cachedClientPromise

/*
 * get an auth token from the (module-cached) GCP auth client
 * @sig getGoogleAuthToken :: Promise<String>
 */
const getGoogleAuthToken = async () => {
    if (!cachedClientPromise) cachedClientPromise = auth.getClient() // cache the client

    const googleAuthClient = await cachedClientPromise
    const tokenWrapper = await googleAuthClient.getAccessToken()
    return tokenWrapper.token
}

/*
 * Run an effect with optional dry-run logging
 * @sig runWithDryRun :: { dryRunConfig: dryRunConfig, describe: String|DescribeThunk, effect: EffectThunk } -> Promise<Result>
 *  dryRunConfig = { isDryRun: Boolean, logger: s => <> }
 *  DescribeThunk = () -> String
 *  EffectThunk = () -> Promise<Result>
 */
const defaultDryRunConfig = { logger: console.log, isDryRun: true }
const runWithDryRun = async (description, effect, dryRunConfig = defaultDryRunConfig) => {
    const dryRun = () => {
        dryRunConfig.logger(`    [DRY-RUN] ${description}`)
        return Success({ isDryRun: true }, 'exists', description)
    }

    description = typeof description === 'function' ? description() : description
    return dryRunConfig.isDryRun ? dryRun() : await effect()
}

/*
 * Parse response body based on content-type
 * @sig parseResponseBody :: Response -> Promise<Object|String>
 */
const parseResponseBody = async response => {
    const text = (await response.text()).trim()
    const contentType = response.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    return isJson ? JSON.parse(text) : text
}

/*
 * Perform an authenticated JSON request against Google APIs
 * @sig requestJson :: { url: String, method: GET|POST|PUT, body: Object?, headers: Object?, description: String, dryRunConfig: Object? } -> Promise<Result>
 */
const requestJson = async ({ url, method, body, headers = {}, description, dryRunConfig = {} }) => {
    const _requestJson = async () => {
        try {
            const success = async () =>
                Success(response.status === 204 ? {} : await parseResponseBody(response), 'updated', description)

            const failure = async () => {
                const text = await response.text()
                const error = new Error(`${description}: HTTP ${response.status}`)
                error.statusCode = response.status
                error.url = url
                error.responseBody = text.trim()
                return Failure(error, description)
            }

            const token = await getGoogleAuthToken()
            const authorization = `Bearer ${token}`
            headers = { 'content-type': 'application/json; charset=utf-8', authorization, ...headers }
            const response = await nodeFetch(url, { method, headers, body: JSON.stringify(body ?? undefined) })
            dryRunConfig.logger(`    [EXEC] ${method} ${url}`)

            return response.ok ? await success() : await failure()
        } catch (error) {
            return Failure(error, description)
        }
    }

    if (!description) throw new Error('description parameter is required for requestJson')
    return runWithDryRun(description, _requestJson, dryRunConfig)
}

export { requestJson, runWithDryRun }
