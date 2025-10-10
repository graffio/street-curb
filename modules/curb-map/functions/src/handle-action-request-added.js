import { createLogger } from '@graffio/logger'
import { FirestoreAdminFacade } from '../../src/firestore-facade/firestore-admin-facade.js'
import { ActionRequest, SystemFlags } from '../../src/types/index.js'
import { createFirestoreContext } from './firestore-context.js'
import * as OH from './events/organization-handlers.js'
import * as UH from './events/user-handlers.js'

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

// prettier-ignore
const createActionRequestLogger = (logger, actionRequest) => {
    const actionRequestData = ActionRequest.log(actionRequest)

    return {
        flowStart: (message, extraData = {}, pr = '  ') => logger.flowStart(pr + message, { ...actionRequestData, ...extraData }),
        flowStep:  (message, extraData = {}, pr = '  ') => logger.flowStep( pr + message, { ...actionRequestData, ...extraData }),
        flowStop:  (message, extraData = {}, pr = '  ') => logger.flowStop( pr + message, { ...actionRequestData, ...extraData }),
        error:     (message, extraData = {}, pr = '  ') => logger.error(    pr + message, { ...actionRequestData, ...extraData }),
    }
}

const processActionRequest = async (logger, event, namespace, actionRequestId, startTime) => {
    const dispatchAction = async (actionRequest, fsContext) => {
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

        return await handler(actionRequestLogger, actionRequest, fsContext)
    }

    let actionRequestLogger

    const afterSnap = event.data.after

    const durationMs = Date.now() - startTime
    try {
        const facade = FirestoreAdminFacade(ActionRequest, `${namespace}/`)

        // read the ActionRequest
        logger.flowStart('AR: processing started', { actionRequestId, namespace })
        let actionRequest = await facade.read(actionRequestId)
        actionRequestLogger = createActionRequestLogger(logger, actionRequest)

        // create Firestore context for this organization/project
        const fsContext = createFirestoreContext(namespace, actionRequest.organizationId, actionRequest.projectId)

        // nothing to do?
        if (actionRequest.status !== 'pending') return actionRequestLogger.flowStop('AR: skipped - not pending', {}, '')

        // check idempotency - has this been processed already?
        const existingCompleted = await fsContext.completedActions.list()
        const duplicate = existingCompleted.find(ca => ca.idempotencyKey === actionRequest.idempotencyKey)
        if (duplicate) {
            // mark this duplicate as completed with reference to original
            await afterSnap.ref.update({
                status: 'completed',
                processedAt: fsContext.serverTimestamp(),
                resultData: { duplicateOf: duplicate.id },
                error: fsContext.deleteField(),
            })
            return actionRequestLogger.flowStop('AR: skipped - duplicate idempotency key', {
                idempotencyKey: actionRequest.idempotencyKey,
                existingActionRequestId: duplicate.id,
            })
        }

        const { actionRequest: newActionRequest = actionRequest } = await dispatchAction(actionRequest, fsContext)

        if (actionRequest !== newActionRequest) {
            actionRequest = newActionRequest
            actionRequestLogger = createActionRequestLogger(logger, actionRequest)
        }

        // update status to 'completed'
        const processedAt = fsContext.serverTimestamp()
        await afterSnap.ref.update({
            status: 'completed',
            processedAt,
            projectId: actionRequest.projectId,
            error: fsContext.deleteField(),
        })

        // copy to completedActions for immutable audit trail
        const completedAction = ActionRequest.from({ ...actionRequest, status: 'completed', processedAt: new Date() })
        await fsContext.completedActions.write(completedAction)
        actionRequestLogger = createActionRequestLogger(logger, completedAction)
        actionRequestLogger.flowStop('AR: processing completed', { durationMs }, '')
    } catch (error) {
        actionRequestLogger.error('Failed to process action request', { error: error.message, durationMs })
        await afterSnap.ref.update({ status: 'failed', error: error?.message || 'unknown-error' })
    }
}

const handleActionRequestAdded = async event => {
    const afterSnap = event.data?.after
    if (!afterSnap?.exists) return

    // Extract context values
    const logger = createLogger(process.env.FUNCTIONS_EMULATOR ? 'dev' : 'production')
    const actionRequestId = event.params.actionRequestId
    const namespace = `tests/${event.params.namespace}`
    const startTime = Date.now()

    // Check if triggers are disabled for this namespace
    if (await areTriggersDisabled(namespace)) return logger.flowStop('AR: skipped - triggers disabled')

    return await processActionRequest(logger, event, namespace, actionRequestId, startTime)
}

export { handleActionRequestAdded }
