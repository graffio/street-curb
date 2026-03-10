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
            T.toReportPickerItem('largeTransactions', 'largeTransactions', 'Spending Over $500'),
            T.toReportPickerItem('excludeTransfers', 'excludeTransfers', 'Exclude Transfers'),
            T.toReportPickerItem('amountRange', 'amountRange', 'Spending $100–$1000'),
            T.toReportPickerItem('diningMultiAccount', 'diningMultiAccount', 'Food at Select Accounts'),
            T.toReportPickerItem('payeePattern', 'payeePattern', 'Payees Matching ^Pac'),
            T.toReportPickerItem('netWorth', 'netWorth', 'Net Worth Over Time'),
            T.toReportPickerItem('categoryByYear', 'categoryByYear', 'Category by Year'),
            T.toReportPickerItem('spendingOverTime', 'spendingOverTime', 'Spending Over Time'),
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
