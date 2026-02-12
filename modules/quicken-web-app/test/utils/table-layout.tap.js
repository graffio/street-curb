// ABOUTME: Tests for TableLayout type methods
// ABOUTME: Verifies conversion, sorting, sizing, and ordering

import tap from 'tap'
import { LookupTable } from '@graffio/functional'
import { ColumnDescriptor } from '../../src/types/column-descriptor.js'
import { SortOrder } from '../../src/types/sort-order.js'
import { TableLayout } from '../../src/types/table-layout.js'

const toLayout = columns =>
    TableLayout(
        'cols_test',
        LookupTable(
            columns.map(c => ColumnDescriptor(c.id, c.size, 'none')),
            ColumnDescriptor,
            'id',
        ),
        LookupTable([], SortOrder, 'id'),
    )

const mockColumns = [
    { id: 'date', size: 100 },
    { id: 'payee', size: 200 },
    { id: 'amount', size: 80 },
]

tap.test('toDataTableProps', t => {
    t.test('Given a TableLayout with sorting', t => {
        const layout = toLayout(mockColumns)
        const sortedLayout = TableLayout.applySortingChange(layout, [{ id: 'date', desc: false }])

        t.test('When I convert to DataTable props', t => {
            const { columnOrder, columnSizing, sorting } = TableLayout.toDataTableProps(sortedLayout)

            t.same(columnOrder, ['date', 'payee', 'amount'], 'Then columnOrder should match descriptor order')
            t.same(columnSizing, { date: 100, payee: 200, amount: 80 }, 'Then columnSizing should have all widths')
            t.same(sorting, [{ id: 'date', desc: false }], 'Then sorting should include date ascending')

            t.end()
        })
        t.end()
    })
    t.end()
})

tap.test('applySortingChange', t => {
    t.test('Given a TableLayout with no sorting', t => {
        const layout = toLayout(mockColumns)

        t.test('When I apply a multi-column sort', t => {
            const sorted = TableLayout.applySortingChange(layout, [
                { id: 'date', desc: false },
                { id: 'payee', desc: true },
            ])

            t.equal(sorted.sortOrder.length, 2, 'Then sortOrder should have 2 entries')
            t.ok(SortOrder.is(sorted.sortOrder[0]), 'Then first entry should be a SortOrder')
            t.equal(sorted.sortOrder[0].id, 'date', 'Then first sort column should be date')
            t.equal(sorted.sortOrder[0].isDescending, false, 'Then date should be ascending')
            t.equal(sorted.sortOrder[1].id, 'payee', 'Then second sort column should be payee')
            t.equal(sorted.sortOrder[1].isDescending, true, 'Then payee should be descending')
            t.equal(sorted.columnDescriptors.date.sortDirection, 'asc', 'Then date descriptor should be asc')
            t.equal(sorted.columnDescriptors.payee.sortDirection, 'desc', 'Then payee descriptor should be desc')
            t.equal(sorted.columnDescriptors.amount.sortDirection, 'none', 'Then amount should be none')

            t.end()
        })
        t.end()
    })
    t.end()
})

tap.test('applySizingChange', t => {
    t.test('Given a TableLayout', t => {
        const layout = toLayout(mockColumns)

        t.test('When I change a column width', t => {
            const resized = TableLayout.applySizingChange(layout, { payee: 300 })

            t.equal(resized.columnDescriptors.date.width, 100, 'Then unchanged columns keep width')
            t.equal(resized.columnDescriptors.payee.width, 300, 'Then changed column has new width')
            t.equal(resized.columnDescriptors.amount.width, 80, 'Then other columns keep width')

            t.end()
        })
        t.end()
    })
    t.end()
})

tap.test('applyOrderChange', t => {
    t.test('Given a TableLayout', t => {
        const layout = toLayout(mockColumns)

        t.test('When I reorder columns', t => {
            const reordered = TableLayout.applyOrderChange(layout, ['amount', 'date', 'payee'])

            const order = reordered.columnDescriptors.map(d => d.id)
            t.same(order, ['amount', 'date', 'payee'], 'Then columns should be in new order')

            t.end()
        })
        t.end()
    })
    t.end()
})
