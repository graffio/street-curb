# Task 1: Update Action Type Definitions

- Remove `AllInitialDataLoaded` variant from Action tagged sum
- Add `UserLoaded: { user: 'User' }` variant
- Update `piiFields()` - remove AllInitialDataLoaded, add UserLoaded (return [])
- Update `toLog()` - remove AllInitialDataLoaded, add UserLoaded
- Update `getSubject()` - remove AllInitialDataLoaded, add UserLoaded
- Update `mayI()` - remove AllInitialDataLoaded, add UserLoaded (return true)
