// ABOUTME: Hydrates Redux state from localStorage on startup
// ABOUTME: Provides getInitialState() for lazy initialization in reducer

import LookupTable from '@graffio/functional/src/lookup-table.js'
import { ColumnDescriptor, SortOrder, TabGroup, TabLayout, TableLayout, View } from '../types/index.js'

const TABLE_LAYOUTS_KEY = 'tableLayouts'
const TAB_LAYOUT_KEY = 'tabLayout'

// @sig hydrateTableLayouts :: () -> LookupTable<TableLayout>
const hydrateTableLayouts = () => {
    // @sig hydrateTableLayout :: Object -> TableLayout
    const hydrateTableLayout = obj => {
        // Converts old sortOrder format (array of column IDs) to new LookupTable<SortOrder>
        // @sig hydrateSortOrder :: ([String], LookupTable<ColumnDescriptor>) -> LookupTable<SortOrder>
        const hydrateSortOrder = (rawSortOrder, columnDescriptors) => {
            const convertOldFormat = colId => {
                const descriptor = columnDescriptors[colId]
                const isDescending = descriptor?.sortDirection === 'desc'
                return SortOrder(colId, isDescending)
            }

            if (!rawSortOrder || rawSortOrder.length === 0) return LookupTable([], SortOrder, 'id')

            // If already hydrated (has isDescending), just convert
            if (rawSortOrder[0]?.isDescending !== undefined) {
                const items = rawSortOrder.map(s => SortOrder(s.id, s.isDescending))
                return LookupTable(items, SortOrder, 'id')
            }

            // Old format: array of column IDs - get direction from ColumnDescriptor
            return LookupTable(rawSortOrder.map(convertOldFormat), SortOrder, 'id')
        }

        const { id, columns, columnDescriptors: rawDescriptors, sortOrder: rawSortOrder } = obj
        const rawColumns = rawDescriptors || columns
        const items = Object.values(rawColumns).map(c => ColumnDescriptor.from(c))
        const columnDescriptors = LookupTable(items, ColumnDescriptor, 'id')
        const sortOrder = hydrateSortOrder(rawSortOrder, columnDescriptors)
        return TableLayout(id, columnDescriptors, sortOrder)
    }

    try {
        const stored = window.localStorage.getItem(TABLE_LAYOUTS_KEY)
        if (!stored) return LookupTable([], TableLayout, 'id')

        const layouts = Object.values(JSON.parse(stored)).map(hydrateTableLayout)
        return LookupTable(layouts, TableLayout, 'id')
    } catch {
        console.warn('Failed to read tableLayouts from localStorage')
        return LookupTable([], TableLayout, 'id')
    }
}

// @sig hydrateTabLayout :: () -> TabLayout
const hydrateTabLayout = () => {
    // @sig createDefaultTabLayout :: () -> TabLayout
    const createDefaultTabLayout = () => {
        const emptyGroup = TabGroup('tg_1', LookupTable([], View, 'id'), null, 100)
        return TabLayout('tl_main', LookupTable([emptyGroup], TabGroup, 'id'), 'tg_1', 2)
    }

    // @sig hydrateTabGroup :: Object -> TabGroup
    const hydrateTabGroup = obj => {
        // @sig hydrateView :: Object -> View
        const hydrateView = viewObj => {
            const { '@@tagName': tagName, accountId, id, reportType, title } = viewObj
            if (tagName === 'Register') return View.Register(id, accountId, title)
            if (tagName === 'Report') return View.Report(id, reportType, title)
            if (tagName === 'Reconciliation') return View.Reconciliation(id, accountId, title)
            throw new Error(`Unknown View variant: ${tagName}`)
        }

        const { activeViewId, id, views: rawViews, width } = obj
        const views = Object.values(rawViews).map(hydrateView)
        return TabGroup(id, LookupTable(views, View, 'id'), activeViewId, width)
    }

    try {
        const stored = window.localStorage.getItem(TAB_LAYOUT_KEY)
        if (!stored) return createDefaultTabLayout()

        const { activeTabGroupId, id, nextTabGroupId, tabGroups: rawGroups } = JSON.parse(stored)
        const tabGroups = Object.values(rawGroups).map(hydrateTabGroup)
        return TabLayout(id, LookupTable(tabGroups, TabGroup, 'id'), activeTabGroupId, nextTabGroupId)
    } catch {
        console.warn('Failed to read tabLayout from localStorage, using default')
        return createDefaultTabLayout()
    }
}

export { hydrateTabLayout, hydrateTableLayouts }
