// Tagged type definition for testing LookupTable fields with both TaggedSum and Tagged types
// - Notification (TaggedSum with Date fields) - tests TaggedSum handling
// - Event (Tagged with Date fields) - tests nested Date conversion for regular Tagged types

// prettier-ignore
export const ManyLookupTables = {
    name: 'ManyLookupTables',
    kind: 'tagged',
    fields: {
        notifications        : '{Notification:message}',
        optionalNotifications: '{Notification:message}?',
        events               : '{Event:name}',
        optionalEvents       : '{Event:name}?',
    }
}
