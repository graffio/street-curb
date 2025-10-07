import { FirestoreAdminFacade } from '../../src/firestore-facade/firestore-admin-facade.js'
import { QueueItem, SystemFlags } from '../../src/types/index.js'

const areTriggersDisabled = async namespace => {
    try {
        const flagsFacade = FirestoreAdminFacade(SystemFlags, `${namespace}/`)
        const flags = await flagsFacade.read('flags')
        return !flags.triggersEnabled // disabled when triggersEnabled is false
    } catch (error) {
        // If flags don't exist, triggers are enabled by default
        return false
    }
}

const handleQueueItemAdded = async event => {
    const afterSnap = event.data?.after
    if (!afterSnap?.exists) return

    // Check if triggers are disabled for this namespace
    const namespace = `tests/${event.params.namespace}`
    if (await areTriggersDisabled(namespace)) return

    const facade = FirestoreAdminFacade(QueueItem, `${namespace}/`)

    let queueItem
    try {
        queueItem = await facade.read(event.params.queueItemId)
        if (queueItem.status !== 'pending') return
    } catch (error) {
        await afterSnap.ref.update({ status: 'failed', error: error?.message || 'unknown-error' })
        return
    }

    try {
        await afterSnap.ref.update({
            status: 'completed',
            processedAt: FirestoreAdminFacade.serverTimestamp(),
            error: FirestoreAdminFacade.deleteField(),
        })
    } catch (error) {
        await afterSnap.ref.update({ status: 'failed', error: error?.message || 'unknown-error' })
    }
}

export { handleQueueItemAdded }
