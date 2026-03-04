export const CustomSerialization = {
    name: 'CustomSerialization',
    kind: 'tagged',
    firestore: true,
    fields: { id: 'String', value: 'String', createdAt: 'Date' },
}

// Custom toFirestore that adds extra field
CustomSerialization.toFirestore = (obj, encodeTimestamps) => ({
    ...CustomSerialization._toFirestore(obj, encodeTimestamps),
    customField: 'added-by-custom-logic',
})
