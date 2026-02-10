// ABOUTME: Type definition for ViewUiState - per-view ephemeral UI state
// ABOUTME: Separated from TransactionFilter to avoid invalidating expensive selector caches

import { FieldTypes } from './field-types.js'

export const ViewUiState = {
    name: 'ViewUiState',
    kind: 'tagged',
    fields: {
        id: FieldTypes.viewId,
        filterPopoverId: 'String?',
        filterPopoverSearch: 'String',
        filterPopoverHighlight: 'Number',
        currentRowIndex: 'Number',
        currentSearchIndex: 'Number',
        treeExpansion: 'Object?',
        columnSizing: 'Object?',
        columnOrder: '[String]?',
    },
}
