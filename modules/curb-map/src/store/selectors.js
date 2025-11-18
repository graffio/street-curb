// prettier-ignore
const S = {
    // UI state
    currentBlockface       : state => S.blockface(state, state.currentBlockfaceId),
    currentBlockfaceId     : state => state.currentBlockfaceId,
    currentOrganization    : state => state.currentOrganization,
    currentOrganizationId  : state => state.currentOrganization.id,
    currentUser            : state => state.currentUser,
    currentUserId          : state => state.currentUser.id,
   
    // todo: store project properly
    currentProjectId      : state => state.currentOrganization.defaultProjectId,
    
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
