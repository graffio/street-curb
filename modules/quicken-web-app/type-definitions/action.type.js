// ABOUTME: TaggedSum type definition for all Redux actions in quicken-web-app
// ABOUTME: Each variant represents a distinct state change or side-effect intent
/** @module Action */

import { FieldTypes } from './field-types.js'

/**
 * Action represents Redux actions for the quicken-web-app
 * @sig Action ::
 *      SetTransactionFilter
 *      ResetTransactionFilters
 */

// prettier-ignore
export const Action = {
    name: 'Action',
    kind: 'taggedSum',
    variants: {
        LoadFile: {
            accounts      : '{Account:id}',
            categories    : '{Category:id}',
            securities    : '{Security:id}',
            tags          : '{Tag:id}',
            splits        : '{Split:id}',
            transactions  : '{Transaction:id}',
            lots          : '{Lot:id}',
            lotAllocations: '{LotAllocation:id}',
            prices        : '{Price:id}',
        },
        SetTransactionFilter   : { viewId: 'String', changes: 'Object' },
        SetViewUiState         : { viewId: 'String', changes: 'Object' },
        ResetTransactionFilters: { viewId: 'String' },
        ToggleAccountFilter    : { viewId: 'String', accountId: FieldTypes.accountId },
        ToggleSecurityFilter   : { viewId: 'String', securityId: FieldTypes.securityId },
        ToggleActionFilter     : { viewId: 'String', actionId: 'String' },
        AddCategoryFilter      : { viewId: 'String', category: 'String' },
        RemoveCategoryFilter   : { viewId: 'String', category: 'String' },
        SetFilterPopoverOpen   : { viewId: 'String', popoverId: 'String?' },
        SetFilterPopoverSearch : { viewId: 'String', searchText: 'String' },

        // Table layout actions
        SetTableLayout         : { tableLayout: 'TableLayout' },
        EnsureTableLayout      : { tableLayoutId: 'String', columns: '[Object]' },

        // Tab layout actions
        OpenView       : { view: 'View', groupId: 'String?' },
        CloseView      : { viewId: 'String', groupId: 'String' },
        MoveView       : { viewId: 'String', fromGroupId: 'String', toGroupId: 'String', toIndex: 'Number?' },
        CreateTabGroup    : {},
        CloseTabGroup     : { groupId: 'String' },
        SetActiveView     : { groupId: 'String', viewId: 'String' },
        SetActiveTabGroup : { groupId: 'String' },
        SetTabGroupWidth  : { groupId: 'String', width: 'Number' },

        // Account list actions
        SetAccountListSortMode : { sortMode: 'SortMode' },
        ToggleSectionCollapsed : { sectionId: 'String' },

        // Global UI actions
        SetShowReopenBanner : { show: 'Boolean' },
        SetShowDrawer       : { show: 'Boolean' },
        ToggleDrawer        : {},
        SetLoadingStatus    : { status: 'String?' },

        // Drag state actions
        SetDraggingView  : { viewId: 'String?' },
        SetDropTarget    : { groupId: 'String?' },

        // Effect-only actions (reducer returns state unchanged, post performs side effect)
        InitializeSystem : {},
        OpenFile         : {},
        ReopenFile       : {},
    }
}
