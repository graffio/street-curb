/** @module Action */

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
            accounts    : '{Account:id}',
            categories  : '{Category:id}',
            securities  : '{Security:id}',
            tags        : '{Tag:id}',
            splits      : '{Split:id}',
            transactions: '{Transaction:id}',
        },
        SetTransactionFilter   : { changes: 'Object' },
        ResetTransactionFilters: {},

        // Table layout actions
        SetTableLayout         : { tableLayout: 'TableLayout' },

        // Tab layout actions
        OpenView       : { view: 'View', groupId: 'String?' },
        CloseView      : { viewId: 'String', groupId: 'String' },
        MoveView       : { viewId: 'String', fromGroupId: 'String', toGroupId: 'String', toIndex: 'Number?' },
        CreateTabGroup    : {},
        CloseTabGroup     : { groupId: 'String' },
        SetActiveView     : { groupId: 'String', viewId: 'String' },
        SetActiveTabGroup : { groupId: 'String' },
        SetTabGroupWidth  : { groupId: 'String', width: 'Number' },
    }
}
