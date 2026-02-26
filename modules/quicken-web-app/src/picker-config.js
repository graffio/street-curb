// ABOUTME: Picker configuration — items and metadata for each picker type
// ABOUTME: Single source of truth for picker items used by QuickPicker and sidebar components

import { post } from './commands/post.js'
import { Action } from './types/action.js'
import { View } from './types/view.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// COMPLEXITY: export-structure — single property until accounts picker is added
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
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export { PickerConfig }
