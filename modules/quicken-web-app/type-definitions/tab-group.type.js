// ABOUTME: TabGroup type definition for a group of views in the layout
// ABOUTME: Contains id, LookupTable of views, active view reference, and width

import { FieldTypes } from './field-types.js'

// prettier-ignore
export const TabGroup = {
    name: 'TabGroup',
    kind: 'tagged',
    fields: {
        id          : FieldTypes.tabGroupId,
        views       : '{View:id}',
        activeViewId: '/^(reg|rpt|rec)_[a-z0-9_]+$/?',   // null when group has no views
        width       : 'Number',
    },
}
