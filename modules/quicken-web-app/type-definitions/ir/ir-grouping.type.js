// ABOUTME: Tagged type for pivot-style grouping on financial queries
// ABOUTME: rows + optional columns enables flat trees and row × column pivot tables

import { FieldTypes } from '../field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const IRGrouping = {
    name: 'IRGrouping',
    kind: 'tagged',
    fields: {
        rows:    FieldTypes.groupDimension,
        columns: { pattern: FieldTypes.groupDimension, optional: true },
        only:    '[String]?',
    },
}
