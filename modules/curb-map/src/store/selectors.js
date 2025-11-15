// prettier-ignore
const Selectors = {
    // UI state
    currentBlockface   : state => state.blockfaces?.[state.currentBlockfaceId] || null,
    currentBlockfaceId : state => state.currentBlockfaceId,
    currentOrganization: state => state.currentOrganization,
    currentUser        : state => state.currentUser,
    
    // persisted
    blockfaces         : state => state.blockfaces,
}

export const { currentBlockface, currentBlockfaceId, currentOrganization, currentUser, blockfaces } = Selectors
