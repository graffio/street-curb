export const Event = {
    name: 'Event',
    kind: 'tagged',
    firestore: true,
    fields: { name: 'String', occurredAt: 'Date', scheduledFor: 'Date?' },
}
