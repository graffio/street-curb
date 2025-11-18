// prettier-ignore
const S = {
    // UI state
    currentBlockface       : state => S.blockface(state, state.currentBlockfaceId),
    currentBlockfaceId     : state => state.currentBlockfaceId,
    currentOrganization    : state => state.currentOrganization,
    currentOrganizationId  : state => state.currentOrganization.id,
    currentProjectId       : state => state.currentProjectId,
    currentUser            : state => state.currentUser,
    currentUserId          : state => state.currentUser.id,
    
    // persisted
    blockfaces             : state => state.blockfaces,
    blockface              : (state, id) => state.blockfaces?.[id]
}

export const {
    currentBlockface,
    currentBlockfaceId,
    currentProjectId,
    currentOrganization,
    currentOrganizationId,
    currentUser,
    currentUserId,
    blockface,
    blockfaces,
} = S
