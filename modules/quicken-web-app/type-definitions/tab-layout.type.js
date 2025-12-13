// ABOUTME: TabLayout type definition for the overall tab group arrangement
// ABOUTME: Contains LookupTable of tabGroups, active tab group reference, and group ID counter

import { FieldTypes } from './field-types.js'

// prettier-ignore
export const TabLayout = {
    name: 'TabLayout',
    kind: 'tagged',
    fields: {
        id              : FieldTypes.tabLayoutId,
        tabGroups       : '{TabGroup:id}',
        activeTabGroupId: FieldTypes.tabGroupId,
        nextTabGroupId  : 'Number',
    },
}
