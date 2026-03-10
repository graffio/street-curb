// ABOUTME: TabGroup type definition for a group of views in the layout
// ABOUTME: Contains id, LookupTable of views, active view reference, and width

import { FieldTypes } from '../field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const TabGroup = {
    name: 'TabGroup',
    kind: 'tagged',
    fields: {
        id          : FieldTypes.tabGroupId,
        views       : '{View:id}',
        activeViewId: { pattern: FieldTypes.viewId, optional: true },   // undefined when group has no views
        width       : 'Number',
    },
}
