// ABOUTME: Root reducer for application state
// ABOUTME: Currently minimal, ready for future expansion

const initialState = { initialized: true }

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        default:
            return state
    }
}

export { rootReducer }
