// ABOUTME: Tests for tableLayoutOrDefault selector
// ABOUTME: Verifies default construction, existing layout return, and column reconciliation

import t from 'tap'
import LookupTable from '@graffio/functional/src/lookup-table.js'
import { ColumnDescriptor } from '../../src/types/column-descriptor.js'
import { SortOrder } from '../../src/types/sort-order.js'
import { TableLayout } from '../../src/types/table-layout.js'
import { tableLayoutOrDefault } from '../../src/store/selectors.js'

const columns = [
    { id: 'date', size: 100 },
    { id: 'payee', size: 200 },
    { id: 'amount', size: 80 },
]

const makeState = (layouts = []) => ({ tableLayouts: LookupTable(layouts, TableLayout, 'id') })

t.test('Given no existing tableLayout', t => {
    t.test('When tableLayoutOrDefault is called', t => {
        const state = makeState()
        const result = tableLayoutOrDefault(state, 'cols_bank_123', columns)

        t.ok(TableLayout.is(result), 'Then it returns a TableLayout')
        t.equal(result.id, 'cols_bank_123', 'Then the id matches the requested tableLayoutId')
        t.equal(result.columnDescriptors.length, 3, 'Then it has descriptors for all columns')
        t.equal(result.columnDescriptors.get('date').width, 100, 'Then column widths match input')
        t.equal(result.sortOrder.length, 0, 'Then sort order is empty')
        t.end()
    })

    t.end()
})

t.test('Given an existing tableLayout', t => {
    t.test('When tableLayoutOrDefault is called', t => {
        const existing = TableLayout(
            'cols_bank_123',
            LookupTable(
                columns.map(c => ColumnDescriptor(c.id, c.size, 'none')),
                ColumnDescriptor,
                'id',
            ),
            LookupTable([SortOrder('date', true)], SortOrder, 'id'),
        )
        const state = makeState([existing])
        const result = tableLayoutOrDefault(state, 'cols_bank_123', columns)

        t.equal(result.sortOrder.length, 1, 'Then existing sort order is preserved')
        t.equal(result.sortOrder.get('date').isDescending, true, 'Then sort direction is preserved')
        t.end()
    })

    t.end()
})

t.test('Given an existing layout missing a column', t => {
    t.test('When tableLayoutOrDefault is called with extra columns', t => {
        const existing = TableLayout(
            'cols_bank_456',
            LookupTable([ColumnDescriptor('date', 120, 'asc')], ColumnDescriptor, 'id'),
            LookupTable([], SortOrder, 'id'),
        )
        const state = makeState([existing])
        const result = tableLayoutOrDefault(state, 'cols_bank_456', columns)

        t.equal(result.columnDescriptors.length, 3, 'Then missing columns are added')
        t.equal(result.columnDescriptors.get('date').width, 120, 'Then existing column width is preserved')
        t.ok(result.columnDescriptors.get('payee'), 'Then new payee column is present')
        t.end()
    })

    t.end()
})

t.test('Given memoization', t => {
    t.test('When called twice with same inputs', t => {
        const state = makeState()
        const result1 = tableLayoutOrDefault(state, 'cols_memo_1', columns)
        const result2 = tableLayoutOrDefault(state, 'cols_memo_1', columns)

        t.equal(result1, result2, 'Then same reference is returned (memoized)')
        t.end()
    })

    t.test('When called with different tableLayoutIds', t => {
        const state = makeState()
        const result1 = tableLayoutOrDefault(state, 'cols_a', columns)
        const result2 = tableLayoutOrDefault(state, 'cols_b', columns)

        t.not(result1, result2, 'Then different references are returned')
        t.equal(result1.id, 'cols_a', 'Then first has correct id')
        t.equal(result2.id, 'cols_b', 'Then second has correct id')
        t.end()
    })

    t.end()
})
