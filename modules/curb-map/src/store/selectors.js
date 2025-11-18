// prettier-ignore
const S = {
    // UI state
    currentBlockface       : state => S.blockface(state, state.currentBlockfaceId),
    currentBlockfaceId     : state => state.currentBlockfaceId,
    currentOrganization    : state => state.currentOrganization,
    currentUser            : state => state.currentUser,
    savedBlockfaceSnapshot : state => state.savedBlockfaceSnapshot,

    // persisted
    blockfaces             : state => state.blockfaces,
    blockface              : (state, id) => state.blockfaces?.[id]
}

export const {
    currentBlockface,
    currentBlockfaceId,
    currentOrganization,
    currentUser,
    savedBlockfaceSnapshot,
    blockface,
    blockfaces,
} = S
