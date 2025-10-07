import { createLogger } from '@graffio/logger'
import { AsyncLocalStorage } from 'node:async_hooks'
import { FirestoreAdminFacade } from '../../src/firestore-facade/firestore-admin-facade.js'
import { QueueItem, SystemFlags } from '../../src/types/index.js'

const asyncLocalStorage = new AsyncLocalStorage()

const areTriggersDisabled = async namespace => {
    const flagsFacade = FirestoreAdminFacade(SystemFlags, `${namespace}/`)
    const flags = await flagsFacade.read('flags')
    return !flags.triggersEnabled
}

const processQueueItem = async () => {
    const { logger, event, namespace, queueItemId, startTime } = asyncLocalStorage.getStore()

    const afterSnap = event.data.after

    try {
        const facade = FirestoreAdminFacade(QueueItem, `${namespace}/`)

        // read the QueueItem
        logger.flowStart('Processing queue item started', { queueItemId, namespace })
        const queueItem = await facade.read(queueItemId)
        logger.flowStep('Queue item read successfully', { status: queueItem.status })

        // nothing to do?
        if (queueItem.status !== 'pending')
            return logger.flowStop('Queue item skipped - not pending', { status: queueItem.status })

        // update status to 'completed'
        const processedAt = FirestoreAdminFacade.serverTimestamp()
        await afterSnap.ref.update({ status: 'completed', processedAt, error: FirestoreAdminFacade.deleteField() })
        logger.flowStop('Queue item completed', { status: 'completed', durationMs: Date.now() - startTime })
    } catch (error) {
        logger.error('Failed to process queue item', { error: error.message, durationMs: Date.now() - startTime })
        await afterSnap.ref.update({ status: 'failed', error: error?.message || 'unknown-error' })
    }
}

const handleQueueItemAdded = async event => {
    const afterSnap = event.data?.after
    if (!afterSnap?.exists) return

    // Create asyncLocalStorage values
    const localStore = {
        event,
        logger: createLogger(process.env.FUNCTIONS_EMULATOR ? 'dev' : 'production'),
        queueItemId: event.params.queueItemId,
        namespace: `tests/${event.params.namespace}`,
        startTime: Date.now(),
    }

    // Check if triggers are disabled for this namespace
    return asyncLocalStorage.run(localStore, async () =>
        (await areTriggersDisabled(`tests/${event.params.namespace}`))
            ? createLogger(process.env.FUNCTIONS_EMULATOR ? 'dev' : 'production', asyncLocalStorage).flowStop(
                  'Queue item skipped - triggers disabled',
              )
            : await processQueueItem(),
    )
}

export { handleQueueItemAdded }
