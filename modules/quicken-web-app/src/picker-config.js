// ABOUTME: Picker configuration — items and metadata for each picker type
// ABOUTME: Single source of truth for picker items used by QuickPicker and sidebar components

import { post } from './commands/post.js'
import * as S from './store/selectors.js'
import { Action } from './types/action.js'
import { View } from './types/view.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

// @sig toAccountPickerItem :: { id: String, label: String } -> { id: String, label: String, execute: () -> void }
const T = {
    toAccountPickerItem: ({ id, label }) => ({
        id,
        label,
        execute: () => post(Action.OpenView(View.Register(`reg_${id}`, id, label))),
    }),

    // Creates a picker item that opens a report view
    // @sig toReportPickerItem :: (String, String, String) -> { id: String, label: String, execute: () -> void }
    toReportPickerItem: (id, reportType, label) => ({
        id,
        label,
        execute: () => post(Action.OpenView(View.Report(`rpt_${reportType}`, reportType, label))),
    }),
}

// Maps accounts from state into picker items with execute callbacks
// @sig toAccountPickerItems :: State -> [{ id: String, label: String, execute: () -> void }]
T.toAccountPickerItems = state => S.pickerAccountItems(state).map(T.toAccountPickerItem)

// Adds execute callback that activates both the tab group and view
// @sig toTabPickerItem :: PickerTabItem -> { id: String, label: String, execute: () -> void }
T.toTabPickerItem = ({ id, label, groupId }) => ({
    id,
    label,
    execute: () => {
        post(Action.SetActiveTabGroup(groupId))
        post(Action.SetActiveView(groupId, id))
    },
})

// Maps tab views from state into picker items with execute callbacks
// @sig toTabPickerItems :: State -> [{ id: String, label: String, execute: () -> void }]
T.toTabPickerItems = state => S.pickerTabItems(state).map(T.toTabPickerItem)

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const PickerConfig = {
    reports: {
        title: 'Open Report',
        items: [
            T.toReportPickerItem('spending', 'spending', 'Spending by Category'),
            T.toReportPickerItem('positions', 'positions', 'Investment Positions'),
            T.toReportPickerItem('large_transactions', 'large_transactions', 'Spending Over $500'),
            T.toReportPickerItem('exclude_transfers', 'exclude_transfers', 'Exclude Transfers'),
            T.toReportPickerItem('amount_range', 'amount_range', 'Spending $100–$1000'),
            T.toReportPickerItem('dining_multi_account', 'dining_multi_account', 'Food at Select Accounts'),
            T.toReportPickerItem('payee_pattern', 'payee_pattern', 'Payees Matching ^Pac'),
            T.toReportPickerItem('net_worth', 'net_worth', 'Net Worth Over Time'),
            T.toReportPickerItem('category_by_year', 'category_by_year', 'Category by Year'),
            T.toReportPickerItem('spending_over_time', 'spending_over_time', 'Spending Over Time'),
        ],
    },
    accounts: { title: 'Open Account', items: T.toAccountPickerItems },
    tabs: { title: 'Switch Tab', items: T.toTabPickerItems },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export { PickerConfig }
