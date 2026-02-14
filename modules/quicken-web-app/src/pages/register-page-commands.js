// ABOUTME: Shared command functions for transaction register pages
// ABOUTME: Search navigation, action registration, and date initialization

import { KeymapModule } from '@graffio/keymap'
import { post } from '../commands/post.js'
import { currentStore } from '../store/index.js'
import { RegisterNavigation } from '../store/register-navigation.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'

const { ActionRegistry } = KeymapModule

// Module-level ref for search input — only one register page is active at a time
const searchInputRef = { current: null }

const RegisterPageCommands = {
    searchInputRef,

    // Navigate to next/prev search match — reads fresh state from store (for ActionRegistry execute handlers)
    // @sig handleSearchNavigate :: (RegisterCtx, Number) -> void
    handleSearchNavigate: (ctx, dir) => {
        const { sortSelector, highlightSelector, viewId, accountId, tableLayoutId, columns } = ctx
        const state = currentStore().getState()
        const data = sortSelector(state, viewId, accountId, tableLayoutId, columns)
        const searchMatches = S.Transactions.searchMatches(state, viewId, accountId)
        if (searchMatches.length === 0) return
        const highlightedId = highlightSelector(state, viewId, accountId, tableLayoutId, columns)
        const currentIdx = searchMatches.indexOf(highlightedId)
        const rowIdx =
            currentIdx >= 0
                ? RegisterNavigation.toAdjacentMatchRowIdx(data, searchMatches, currentIdx, dir)
                : RegisterNavigation.toNearestMatchRowIdx(
                      data,
                      searchMatches,
                      RegisterNavigation.toRowIndex(data, highlightedId),
                      dir,
                  )
        if (rowIdx >= 0) post(Action.SetViewUiState(viewId, { currentRowIndex: rowIdx }))
    },

    // Highlight a transaction row by ID
    // @sig highlightRow :: ([Row], String, String) -> void
    highlightRow: (data, viewId, newId) => {
        const idx = RegisterNavigation.toRowIndex(data, newId)
        if (idx >= 0) post(Action.SetViewUiState(viewId, { currentRowIndex: idx }))
    },

    // Register search-related keyboard actions for a view — returns useEffect setup function
    // @sig registerSearchActions :: RegisterCtx -> () -> (() -> void)
    registerSearchActions: ctx => () =>
        ActionRegistry.register(ctx.viewId, [
            {
                id: 'select',
                description: 'Next match',
                execute: () => RegisterPageCommands.handleSearchNavigate(ctx, 1),
            },
            {
                id: 'search:prev',
                description: 'Previous match',
                execute: () => RegisterPageCommands.handleSearchNavigate(ctx, -1),
            },
            { id: 'search:open', description: 'Open search', execute: () => searchInputRef.current?.focus() },
        ]),

    // Initialize date range to last 12 months if not already set
    // @sig initDateRange :: (String, DateRange | null, String) -> void
    initDateRange: (dateRangeKey, dateRange, viewId) => {
        if (RegisterNavigation.shouldInitializeDateRange(dateRangeKey, dateRange))
            post(Action.SetTransactionFilter(viewId, { dateRange: RegisterNavigation.toDefaultDateRange() }))
    },
}

export { RegisterPageCommands }
