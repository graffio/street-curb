// prettier-ignore
const Selectors = {
    // UI state
    currentBlockface   : state => state.blockfaces?.[state.currentBlockfaceId],
    currentBlockfaceId : state => state.currentBlockfaceId,
    currentOrganization: state => state.currentOrganization,
    currentUser        : state => state.currentUser,
    
    // persisted
    blockfaces         : state => state.blockfaces,
    blockface          : id => state => state.blockfaces[id]
}

export const { currentBlockface, currentBlockfaceId, currentOrganization, currentUser, blockfaces } = Selectors
