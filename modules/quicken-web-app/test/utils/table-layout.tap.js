// ABOUTME: Tests for table layout utility functions
// ABOUTME: Verifies initialization, conversion, and state application

import tap from 'tap'
import {
    applyOrderChange,
    applySizingChange,
    applySortingChange,
    initializeTableLayout,
    toDataTableProps,
} from '../../src/utils/table-layout.js'

const mockColumns = [
    { id: 'date', size: 100 },
    { id: 'payee', size: 200 },
    { id: 'amount', size: 80 },
]

tap.test('initializeTableLayout', t => {
    t.test('Given a viewId and column definitions', t => {
        t.test('When I initialize a table layout', t => {
            const layout = initializeTableLayout('cols_test', mockColumns)

            t.equal(layout.id, 'cols_test', 'Then id should match viewId')
            t.equal(layout.columnDescriptors.length, 3, 'Then it should have 3 column descriptors')
            t.same(layout.sortOrder, [], 'Then sortOrder should be empty')

            const { id, width, sortDirection } = layout.columnDescriptors[0]
            t.equal(id, 'date', 'Then first column id should be date')
            t.equal(width, 100, 'Then first column width should be 100')
            t.equal(sortDirection, 'none', 'Then first column should have no sort')

            t.end()
        })
        t.end()
    })
    t.end()
})

tap.test('toDataTableProps', t => {
    t.test('Given a TableLayout with sorting', t => {
        const layout = initializeTableLayout('cols_test', mockColumns)
        const sortedLayout = applySortingChange(layout, [{ id: 'date', desc: false }])

        t.test('When I convert to DataTable props', t => {
            const { columnOrder, columnSizing, sorting } = toDataTableProps(sortedLayout)

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
        const layout = initializeTableLayout('cols_test', mockColumns)

        t.test('When I apply a multi-column sort', t => {
            const sorted = applySortingChange(layout, [
                { id: 'date', desc: false },
                { id: 'payee', desc: true },
            ])

            t.same(sorted.sortOrder, ['date', 'payee'], 'Then sortOrder should have both columns')
            t.equal(sorted.columnDescriptors.date.sortDirection, 'asc', 'Then date should be asc')
            t.equal(sorted.columnDescriptors.payee.sortDirection, 'desc', 'Then payee should be desc')
            t.equal(sorted.columnDescriptors.amount.sortDirection, 'none', 'Then amount should be none')

            t.end()
        })
        t.end()
    })
    t.end()
})

tap.test('applySizingChange', t => {
    t.test('Given a TableLayout', t => {
        const layout = initializeTableLayout('cols_test', mockColumns)

        t.test('When I change a column width', t => {
            const resized = applySizingChange(layout, { payee: 300 })

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
        const layout = initializeTableLayout('cols_test', mockColumns)

        t.test('When I reorder columns', t => {
            const reordered = applyOrderChange(layout, ['amount', 'date', 'payee'])

            const order = reordered.columnDescriptors.map(d => d.id)
            t.same(order, ['amount', 'date', 'payee'], 'Then columns should be in new order')

            t.end()
        })
        t.end()
    })
    t.end()
})
