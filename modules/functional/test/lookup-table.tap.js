// ABOUTME: Tests for LookupTable updateAll and updateWhere methods
// ABOUTME: Verifies endomorphism operations preserve LookupTable structure

import { test } from 'tap'
import LookupTable from '../src/lookup-table.js'

// Simple Tagged type for testing
const Item = (id, value) => ({ '@@typeName': 'Item', id, value })
Item.is = v => v?.['@@typeName'] === 'Item'
Item.toString = () => 'Item'

test('updateAll', t => {
    t.test('Given a LookupTable with items', t => {
        const items = LookupTable([Item('a', 1), Item('b', 2), Item('c', 3)], Item, 'id')

        t.test('When I apply a transformation to all items', t => {
            const doubled = items.updateAll(item => Item(item.id, item.value * 2))

            t.equal(doubled.length, 3, 'Then it should have same length')
            t.equal(doubled[0].value, 2, 'Then first item value should be doubled')
            t.equal(doubled[1].value, 4, 'Then second item value should be doubled')
            t.equal(doubled[2].value, 6, 'Then third item value should be doubled')
            t.equal(doubled.a.value, 2, 'Then id lookup should work')
            t.ok(LookupTable.is(doubled), 'Then result should be a LookupTable')
            t.end()
        })

        t.test('When I check the original', t => {
            items.updateAll(item => Item(item.id, item.value * 2))

            t.equal(items[0].value, 1, 'Then original should be unchanged')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('updateWhere', t => {
    t.test('Given a LookupTable with items', t => {
        const items = LookupTable([Item('a', 1), Item('b', 2), Item('c', 3)], Item, 'id')

        t.test('When I update items matching a predicate', t => {
            const updated = items.updateWhere(
                item => item.value > 1,
                item => Item(item.id, item.value * 10),
            )

            t.equal(updated.length, 3, 'Then it should have same length')
            t.equal(updated[0].value, 1, 'Then non-matching item should be unchanged')
            t.equal(updated[1].value, 20, 'Then matching item should be transformed')
            t.equal(updated[2].value, 30, 'Then matching item should be transformed')
            t.ok(LookupTable.is(updated), 'Then result should be a LookupTable')
            t.end()
        })

        t.test('When no items match the predicate', t => {
            const updated = items.updateWhere(
                item => item.value > 100,
                item => Item(item.id, 0),
            )

            t.equal(updated[0].value, 1, 'Then all items should be unchanged')
            t.equal(updated[1].value, 2, 'Then all items should be unchanged')
            t.equal(updated[2].value, 3, 'Then all items should be unchanged')
            t.end()
        })
        t.end()
    })
    t.end()
})
