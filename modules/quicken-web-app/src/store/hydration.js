// ABOUTME: Hydrates Redux state from localStorage on startup
// ABOUTME: Provides getInitialState() for lazy initialization in reducer

import LookupTable from '@graffio/functional/src/lookup-table.js'
import { ColumnDescriptor, TabGroup, TabLayout, TableLayout, View } from '../types/index.js'

const TABLE_LAYOUTS_KEY = 'tableLayouts'
const TAB_LAYOUT_KEY = 'tabLayout'

// @sig createDefaultTabLayout :: () -> TabLayout
const createDefaultTabLayout = () => {
    const emptyGroup = TabGroup('tg_1', LookupTable([], View, 'id'), null, 100)
    return TabLayout('tl_main', LookupTable([emptyGroup], TabGroup, 'id'), 'tg_1', 2)
}

// @sig hydrateTableLayout :: Object -> TableLayout
const hydrateTableLayout = obj => {
    const { id, columns, columnDescriptors, sortOrder } = obj
    const rawColumns = columnDescriptors || columns
    const items = Object.values(rawColumns).map(c => ColumnDescriptor.from(c))
    return TableLayout.from({ id, columnDescriptors: LookupTable(items, ColumnDescriptor, 'id'), sortOrder })
}

// @sig hydrateTableLayouts :: () -> LookupTable<TableLayout>
const hydrateTableLayouts = () => {
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

// @sig hydrateView :: Object -> View
const hydrateView = obj => {
    const tagName = obj['@@tagName']
    if (tagName === 'Register') return View.Register(obj.id, obj.accountId, obj.title)
    if (tagName === 'Report') return View.Report(obj.id, obj.reportType, obj.title)
    if (tagName === 'Reconciliation') return View.Reconciliation(obj.id, obj.accountId, obj.title)
    throw new Error(`Unknown View variant: ${tagName}`)
}

// @sig hydrateTabGroup :: Object -> TabGroup
const hydrateTabGroup = obj => {
    const views = Object.values(obj.views).map(hydrateView)
    return TabGroup(obj.id, LookupTable(views, View, 'id'), obj.activeViewId, obj.width)
}

// @sig hydrateTabLayout :: () -> TabLayout
const hydrateTabLayout = () => {
    try {
        const stored = window.localStorage.getItem(TAB_LAYOUT_KEY)
        if (!stored) return createDefaultTabLayout()

        const obj = JSON.parse(stored)
        const tabGroups = Object.values(obj.tabGroups).map(hydrateTabGroup)
        return TabLayout(obj.id, LookupTable(tabGroups, TabGroup, 'id'), obj.activeTabGroupId, obj.nextTabGroupId)
    } catch {
        console.warn('Failed to read tabLayout from localStorage, using default')
        return createDefaultTabLayout()
    }
}

export { hydrateTabLayout, hydrateTableLayouts }
