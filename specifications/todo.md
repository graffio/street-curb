## Firestore

- Is "load-all at startup" a viable way to use Firestore?
- add listeners for remote changes
- How do manage the `namespace` of a server? Maybe by startup time? Or just not at all?

## Requirements

- How we manage a user who has no organization? (By creating an organization presumably, but then who pays for it)
- Invitation has to include adding user <=> organization
- Add toast in @execute-command rather than alert
- Save curbmap data to Firestore
- Read/write Organization/Users UI <=> Firestore

## Channels
- what else should go in layoutChannel besides the title?


### Done



- Write data via submitActionRequest
- Organize outbound commands that update Redux (immediately) and Firestore via submitActionRequest
- Organize selectors; replace current useSelector calls
- Remove `members` from redux and just get them out of the currentOrganization
- Rewrite actions and reducer
- Undo changes to Firestore rules once the user has logged in
- Update main.jsx once we have a logged in user
