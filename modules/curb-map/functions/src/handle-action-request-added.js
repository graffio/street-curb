import { createLogger } from '@graffio/logger'
import { AsyncLocalStorage } from 'node:async_hooks'
import { FirestoreAdminFacade } from '../../src/firestore-facade/firestore-admin-facade.js'
import { ActionRequest, SystemFlags } from '../../src/types/index.js'

const asyncLocalStorage = new AsyncLocalStorage()

const areTriggersDisabled = async namespace => {
    const flagsFacade = FirestoreAdminFacade(SystemFlags, `${namespace}/`)
    const flags = await flagsFacade.read('flags')
    return !flags.triggersEnabled
}

const processActionRequest = async () => {
    const { logger, event, namespace, actionRequestId, startTime } = asyncLocalStorage.getStore()

    const afterSnap = event.data.after

    try {
        const facade = FirestoreAdminFacade(ActionRequest, `${namespace}/`)

        // read the ActionRequest
        logger.flowStart('Processing action request started', { actionRequestId, namespace })
        const actionRequest = await facade.read(actionRequestId)
        logger.flowStep('Action request read successfully', { status: actionRequest.status })

        // nothing to do?
        if (actionRequest.status !== 'pending')
            return logger.flowStop('Action request skipped - not pending', { status: actionRequest.status })

        // update status to 'completed'
        const processedAt = FirestoreAdminFacade.serverTimestamp()
        await afterSnap.ref.update({ status: 'completed', processedAt, error: FirestoreAdminFacade.deleteField() })
        logger.flowStop('Action request completed', { status: 'completed', durationMs: Date.now() - startTime })
    } catch (error) {
        logger.error('Failed to process action request', { error: error.message, durationMs: Date.now() - startTime })
        await afterSnap.ref.update({ status: 'failed', error: error?.message || 'unknown-error' })
    }
}

const handleActionRequestAdded = async event => {
    const afterSnap = event.data?.after
    if (!afterSnap?.exists) return

    // Create asyncLocalStorage values
    const logger = createLogger(process.env.FUNCTIONS_EMULATOR ? 'dev' : 'production')
    const localStore = {
        event,
        logger,
        actionRequestId: event.params.actionRequestId,
        namespace: `tests/${event.params.namespace}`,
        startTime: Date.now(),
    }

    // Check if triggers are disabled for this namespace
    return asyncLocalStorage.run(localStore, async () =>
        (await areTriggersDisabled(`tests/${event.params.namespace}`))
            ? logger.flowStop('Action request skipped - triggers disabled')
            : await processActionRequest(),
    )
}

export { handleActionRequestAdded }
