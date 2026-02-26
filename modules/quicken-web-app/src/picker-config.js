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
}

// Maps accounts from state into picker items with execute callbacks
// @sig toAccountPickerItems :: State -> [{ id: String, label: String, execute: () -> void }]
T.toAccountPickerItems = state => S.pickerAccountItems(state).map(T.toAccountPickerItem)

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const PickerConfig = {
    reports: {
        title: 'Open Report',
        items: [
            {
                id: 'spending',
                label: 'Spending by Category',
                execute: () => post(Action.OpenView(View.Report('rpt_spending', 'spending', 'Spending by Category'))),
            },
            {
                id: 'holdings',
                label: 'Investment Holdings',
                execute: () => post(Action.OpenView(View.Report('rpt_holdings', 'holdings', 'Investment Holdings'))),
            },
        ],
    },
    accounts: { title: 'Open Account', items: T.toAccountPickerItems },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export { PickerConfig }
