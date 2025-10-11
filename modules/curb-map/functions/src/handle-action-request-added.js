import { createLogger } from '@graffio/logger'
import { FirestoreAdminFacade } from '../../src/firestore-facade/firestore-admin-facade.js'
import { ActionRequest, SystemFlags } from '../../src/types/index.js'
import * as OH from './events/organization-handlers.js'
import * as UH from './events/user-handlers.js'
import { createFirestoreContext } from './firestore-context.js'

const areTriggersDisabled = async namespace => {
    const flagsFacade = FirestoreAdminFacade(SystemFlags, `${namespace}/`)
    try {
        const flags = await flagsFacade.read('flags')
        return !flags.triggersEnabled
    } catch (error) {
        // if flags don't exist, triggers are enabled by default
        return false
    }
}

const processActionRequest = async (namespace, logger, event) => {
    /*
     * Wrap the logger so that it always includes data for the ActionRequest from the dispatched actions
     */
    // prettier-ignore
    const createActionRequestLogger = () => {
        const interesting = () => ActionRequest.toLog(actionRequest)
        
        return {
            flowStart: (message, extraData = {}, pr = '├─ ') => logger.flowStart(pr + message, { ...interesting(), ...extraData }),
            flowStep:  (message, extraData = {}, pr = '├─ ') => logger.flowStep( pr + message, { ...interesting(), ...extraData }),
            flowStop:  (message, extraData = {}, pr = '├─ ') => logger.flowStop( pr + message, { ...interesting(), ...extraData }),
            error:     (error,   extraData = {}           ) => logger.error(    error,        { ...interesting(), ...extraData }),
        }
    }

    const dispatchAction = async () => {
        // prettier-ignore
        const handler = actionRequest.action.match({
            OrganizationCreated:   () => OH.handleOrganizationCreated,
            OrganizationUpdated:   () => OH.handleOrganizationUpdated,
            OrganizationDeleted:   () => OH.handleOrganizationDeleted,
            OrganizationSuspended: () => OH.handleOrganizationSuspended,
            UserCreated:           () => UH.handleUserCreated,
            UserUpdated:           () => UH.handleUserUpdated,
            UserDeleted:           () => UH.handleUserDeleted,
            UserForgotten:         () => UH.handleUserForgotten,
            RoleAssigned:          () => UH.handleRoleAssigned,
        })

        actionRequestLogger.flowStep(`AR: Starting ${handler.name}`)
        await handler(actionRequestLogger, fsContext, actionRequest)
        actionRequestLogger.flowStep(`AR: Finished ${handler.name}`)
    }

    // mark this ActionRequest as duplicate by marking it as completed with a reference to the original
    const markDuplicate = async (fsContext, duplicate) => {
        const resultData = { duplicateOf: duplicate.id }
        const processedAt = fsContext.serverTimestamp()
        await afterSnap.ref.update({ status: 'completed', processedAt, resultData, error: fsContext.deleteField() })
        return actionRequestLogger.flowStop('AR: skipped - duplicate idempotency key', resultData)
    }

    // update the status of the ActionRequest in actionRequests to 'completed'
    // copy it to completedActions
    // log
    const markComplete = async () => {
        const processedAt = fsContext.serverTimestamp()
        const status = 'completed'

        await afterSnap.ref.update({ status, processedAt, error: fsContext.deleteField() })
        const completedAction = ActionRequest.from({ ...actionRequest, status, processedAt: new Date() })
        await fsContext.completedActions.write(completedAction)
        actionRequestLogger.flowStop('└─ AR: processing completed', { durationMs: Date.now() - startTime }, '')
    }

    const markFailed = async e => {
        const processedAt = fsContext.serverTimestamp()
        const status = 'failed'
        const error = e?.message || 'unknown-error'

        await afterSnap.ref.update({ status, processedAt, error })
        const rawActionRequest = { ...afterSnap.data(), ...{ status, error } }
        logger.error(e, { rawActionRequest, durationMs: Date.now() - startTime })
    }

    const afterSnap = event.data.after
    const rawActionRequest = event.data.after.data()
    const startTime = Date.now()
    const fsContext = createFirestoreContext(namespace, rawActionRequest.organizationId, rawActionRequest.projectId)
    const actionRequestLogger = createActionRequestLogger()

    let actionRequest

    // nothing to do?
    if (rawActionRequest.status !== 'pending') return logger.flowStop('AR: skipped - not pending', rawActionRequest, '')

    try {
        logger.flowStart('┌─ AR: processing started', { ...rawActionRequest, namespace })

        actionRequest = ActionRequest.fromFirestore(rawActionRequest)

        // check idempotency - has this been processed already?
        const existingCompleted = await fsContext.completedActions.list()
        const duplicate = existingCompleted.find(ca => ca.idempotencyKey === actionRequest.idempotencyKey)
        if (duplicate) return await markDuplicate(fsContext, duplicate)

        await dispatchAction()

        return await markComplete()
    } catch (error) {
        await markFailed(error)
    }
}

const handleActionRequestAdded = async event => {
    const afterSnap = event.data?.after
    if (!afterSnap?.exists) return

    // Extract context values
    const logger = createLogger(process.env.FUNCTIONS_EMULATOR ? 'dev' : 'production')
    const namespace = `tests/${event.params.namespace}`

    // Check if triggers are disabled for this namespace
    if (await areTriggersDisabled(namespace)) return logger.flowStop('AR: skipped - triggers disabled')

    return await processActionRequest(namespace, logger, event)
}

export { handleActionRequestAdded }
