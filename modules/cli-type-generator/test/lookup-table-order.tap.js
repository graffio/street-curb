// ABOUTME: Test that LookupTable order is preserved through Firestore serialization
// ABOUTME: Validates the _order field mechanism for maintaining array position

import { LookupTable } from '@graffio/functional'
import tap from 'tap'
import { lookupTableFromFirestore, lookupTableToFirestore } from '../runtime-for-generated-types.js'

// Simple test type that mimics generated types
const TestItem = function (id, name) {
    if (!(this instanceof TestItem)) return new TestItem(id, name)
    this.id = id
    this.name = name
    this['@@typeName'] = 'TestItem'
}
TestItem['@@typeName'] = 'TestItem'
TestItem.is = obj => obj?.['@@typeName'] === 'TestItem'
TestItem.toFirestore = (obj, encodeTimestamps) => ({ id: obj.id, name: obj.name })
TestItem.fromFirestore = (doc, decodeTimestamps) => TestItem(doc.id, doc.name)

tap.test('LookupTable Order Preservation', t => {
    t.test('Given a LookupTable with multiple items in specific order', t => {
        t.test('When converting to Firestore and back', t => {
            const original = LookupTable(
                [TestItem('id-1', 'First'), TestItem('id-2', 'Second'), TestItem('id-3', 'Third')],
                TestItem,
                'id',
            )

            // Serialize to Firestore
            const firestoreMap = lookupTableToFirestore(TestItem, 'id', x => x, original)

            // Deserialize back
            const reconstructed = lookupTableFromFirestore(TestItem, 'id', x => x, firestoreMap)

            t.equal(reconstructed.length, 3, 'Then should have same length')
            t.equal(reconstructed[0].name, 'First', 'Then first item should be First')
            t.equal(reconstructed[1].name, 'Second', 'Then second item should be Second')
            t.equal(reconstructed[2].name, 'Third', 'Then third item should be Third')
            t.end()
        })

        t.test('When Firestore map has items in different key order', t => {
            // Simulate Firestore returning items in arbitrary order
            const firestoreMap = {
                'id-3': { id: 'id-3', name: 'Third', _order: 2 },
                'id-1': { id: 'id-1', name: 'First', _order: 0 },
                'id-2': { id: 'id-2', name: 'Second', _order: 1 },
            }

            const reconstructed = lookupTableFromFirestore(TestItem, 'id', x => x, firestoreMap)

            t.equal(reconstructed.length, 3, 'Then should have correct length')
            t.equal(reconstructed[0].name, 'First', 'Then _order:0 should be first')
            t.equal(reconstructed[1].name, 'Second', 'Then _order:1 should be second')
            t.equal(reconstructed[2].name, 'Third', 'Then _order:2 should be third')
            t.end()
        })

        t.end()
    })

    t.test('Given a LookupTable with single item', t => {
        t.test('When roundtrip through Firestore', t => {
            const original = LookupTable([TestItem('id-1', 'Only')], TestItem, 'id')

            const firestoreMap = lookupTableToFirestore(TestItem, 'id', x => x, original)
            const reconstructed = lookupTableFromFirestore(TestItem, 'id', x => x, firestoreMap)

            t.equal(reconstructed.length, 1, 'Then should have 1 item')
            t.equal(reconstructed[0].name, 'Only', 'Then item should be correct')
            t.end()
        })

        t.end()
    })

    t.test('Given an empty LookupTable', t => {
        t.test('When roundtrip through Firestore', t => {
            const original = LookupTable([], TestItem, 'id')

            const firestoreMap = lookupTableToFirestore(TestItem, 'id', x => x, original)
            const reconstructed = lookupTableFromFirestore(TestItem, 'id', x => x, firestoreMap)

            t.equal(reconstructed.length, 0, 'Then should be empty')
            t.ok(reconstructed.idField === 'id', 'Then should still be a LookupTable')
            t.end()
        })

        t.end()
    })

    t.end()
})
