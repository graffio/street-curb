# Task 2: Update Redux State and Reducer

- Add `projectDataLoading: false` to initialState in reducer.js
- Add `UserLoaded` handler: `() => ({ ...state, currentUser: action.user })`
- Update `OrganizationSynced` handler: Explicitly rebuild state keeping only currentUser, set projectDataLoading: true
- Update `BlockfacesSynced` handler: Set blockfaces and projectDataLoading: false
- Remove `AllInitialDataLoaded` handler
