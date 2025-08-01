/*
 * PromiseCache / PromiseCacheWithCacheBusting
 *
 * Keep a cache of promises, organized by key.
 *
 * For getImageUrl, for instance, each key is a path to an image in Firestore and the corresponding value
 * is (basically) a Promise that returns the image's URL from Firebase storage.
 *
 * PromiseCache
 * ============
 *
 * The cache serves a handful of purposes:
 *
 * 1. Multiple callers can respond to the same promise (eg. so the URL for an image needs is downloaded only once)
 * 2. If the image for a key has changed for some reason (eg. the StorageVersion has changed),
 *    any in-progress promises are canceled, and they download the new URL instead
 * 3. The entire cache can be cleared (eg. when the current project changes)
 *
 * PromiseCache API
 * ----------------
 *
 * clearKey(key)
 * clearAll()
 *   Clear the promise for the given key (because it's obsolete) or the entire cache
 *
 * waitFor (key, thunk)
 *   For a given key, call the promise-returning thunk -- but only if there isn't already a promise for this key.
 *   Otherwise, waitFor never calls thunk and instead returns the already-existing promise.
 *
 *   In addition, waitFor handles the special case that the key has been cleared between the time the
 *   thunk was called and it returned. In which case, it will return the result of whatever thunk is
 *   associated with the key even if it happens LATER
 *
 * PromiseCacheWithCacheBusting
 * ============================
 *
 * PromiseCacheWithCacheBusting wraps a PromiseCache and automatically handles situations in which the
 * entire cache or the promise for a specific key should be cleared and a new thunk installed.
 *
 * It does this by tracking two additional pieces of data
 *
 * - a cacheVersion (eg. the projectId)
 * - a keyVersion for each key (eg. the timestamp from a storageVersion)
 *
 * PromiseCacheWithCacheBusting API
 * --------------------------------
 *
 * waitFor (key, thunk, cacheVersion, keyVersion)
 *   This version of waitFor always includes the cacheVersion and keyVersion we want to use
 *   If cacheVersion doesn't match the old cache version, the entire cache is cleared before thunk is called
 *   If keyVersion doesn't match the old key version, the promise at the key is cleared before thunk is called
 *
 * See useImageUrl for an example
 *
 * Comments about of how these functions actually work are below
 */

import { v4 } from 'uuid'

const PromiseCache = () => {
    /*
     * The promises we wait for are wrappers around the thunks passed into waitFor.
     *
     * We keep these "forever" so that even much later we can simply return the already-completed one,
     * which lets arbitrarily many callers await a single promise.
     *
     * However, for reasons described in _wrapThunkInOurPromise, for each key, we also store a uuid and
     * the thunk passed to waitFor, because they help us recognize that our current promise is obsolete.
     *
     * The uuid is used to check if the cacheEntry has changed. If a cacheEntry was set, multiple
     * calls to waitFor that for key will all wait for the same promise to resolve.
     *
     * However, if the key is cleared and replaced with a new cacheEntry, it will have a new uuid
     * so that calls to the earlier thunk can recognize that they should discard their result and
     * use the new cacheEntry. See
     */
    const cache = new Map()

    /*
     * We really don't want obsolete thunks to complete normally
     *
     * Instead, when "our" thunk has completed but before resolving or rejecting from our wrapper promise,
     * we check that our promise is still the "currentPromise," which is the one currently stored in the cache.
     *
     * Our thunk will not be the same as the currentPromise in two circumstances:
     *
     * 1. someone called clearKey for our key while our promise was running
     *
     *    There's no clear answer what to do if there is no longer ANY currentPromise in the cache for our key,
     *    so we ignore whatever our thunk resolved or rejected to and always reject with `new Error('Canceled')`
     *
     * 2. someone replaced (that is, cleared and then reset) the currentPromise while our promise was running
     *
     *    The best answer is still to ignore the result of our promise since it's obsolete, and instead use the result
     *    of the currentPromise. If our promise resolved to 4 but the currentPromise rejects with 40,
     *    we reject with 40 too.
     *
     *    To do this, when our promise finishes, if our cacheEntry now has a different uuid, we set wait
     *    the currentPromise.
     *
     *    We have to do this for both resolve and reject, so both handlers work the same way
     */
    const _wrapThunkInOurPromise = (key, uuid, thunk) =>
        new Promise((resolve, reject) => {
            const thenHandler = result => {
                const { currentUuid, currentPromise } = cache.get(key) || {}
                if (currentUuid === ourUuid) return resolve(result) // normal
                if (!currentPromise) return reject(new Error('Canceled -- your promise was removed from cache'))

                // ignore our promise's result and await whatever the currentPromise does
                currentPromise.then(resolve).catch(reject)
            }

            const rejectHandler = error => {
                const { currentUuid, currentPromise } = cache.get(key) || {}
                if (currentUuid === ourUuid) return reject(error) // normal
                if (!currentPromise) return reject(new Error('Canceled -- your promise was removed from cache'))

                // ignore our promise's result and await whatever the currentPromise does
                currentPromise.then(resolve).catch(reject)
            }

            const ourUuid = uuid
            const promise = thunk()
            promise.then(thenHandler).catch(rejectHandler)
        })

    const _addPromise = (key, thunk) => {
        const currentUuid = v4()
        const currentPromise = _wrapThunkInOurPromise(key, currentUuid, thunk)
        cache.set(key, { currentUuid, currentPromise })
    }

    // -----------------------------------------------------------------------------------------------------------------
    // API
    // -----------------------------------------------------------------------------------------------------------------

    /*
     * Return a promise. If there is already a promise associated with the key, return THAT.
     * Otherwise create a promise by calling thunk and storing it for the key.
     *
     * That is, multiple calls to waitFor with the same key all wait for the same promise to complete,
     * and that promise will have been created by the first call to use this key that finds there isn't one yet
     *
     * In fact, the promise return is not precisely the promise returned by thunk:
     * see the comment for _wrapThunkInOurPromise for more information
     *
     * @sig waitFor :: (String, Thunk) -> Promise *
     *  Thunk = () => Promise *
     *
     */
    const waitFor = (key, thunk) => {
        if (!cache.has(key)) _addPromise(key, thunk) // only the first thunk for a key gets added
        return cache.get(key).currentPromise
    }

    /*
     * Remove a promise from the cache because it's obsolete. This has more ramifications than it would seem
     * see the comment for _wrapThunkInOurPromise for more information
     * @sig clearKey :: String -> undefined
     */
    const clearKey = key => cache.delete(key)

    /*
     * Clear the entire cache because it's obsolete. This has more ramifications than it would seem
     * see the comment for _wrapThunkInOurPromise for more information
     */
    const clearAll = () => cache.clear()

    return { waitFor, clearKey, clearAll }
}

/*
 * The oldCacheVersion is the main identifier used to determine that the cache is still relevant at all
 * If a newer cacheVersion is sent in waitFor, the entire cache is cleared before calling PromiseCache.waitFor
 *
 * The oldKeyVersions is a map from keys to identifiers for a specific key
 *
 * For getImageUrl, the cacheVersion is a projectId, because if we switch project's everything in the
 * cache is obsolete. the keyVersions are the timestamp associated with an image's specific storageVersion
 *
 * clearAll and clearKey are not exposed because the algorithm embedded will deal with them
 */
const PromiseCacheWithCacheBusting = (initialCacheVersion = 'initial cache version') => {
    let oldCacheVersion = initialCacheVersion
    const oldKeyVersions = new Map()
    const promiseCache = PromiseCache()

    // projectId changed
    const resetIfCacheVersionChanged = cacheVersion => {
        if (cacheVersion && cacheVersion === oldCacheVersion) return

        oldCacheVersion = cacheVersion
        promiseCache.clearAll()
        oldKeyVersions.clear()
    }

    // storageVersion timestamp for upload 6's thumbnail0 changed
    const clearIfKeyVersionChanged = (key, keyVersion) => {
        if (keyVersion && keyVersion === oldKeyVersions.get(key)) return

        oldKeyVersions.set(key, keyVersion)
        promiseCache.clearKey(key)
    }

    const waitFor = (key, thunk, cacheVersion, keyVersion) => {
        resetIfCacheVersionChanged(cacheVersion)
        clearIfKeyVersionChanged(key, keyVersion)

        return promiseCache.waitFor(key, thunk)
    }

    return { waitFor }
}

export { PromiseCache, PromiseCacheWithCacheBusting }
