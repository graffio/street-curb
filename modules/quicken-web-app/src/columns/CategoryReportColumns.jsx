// ABOUTME: Column definitions for category spending report with node-type-aware cell renderers
// ABOUTME: Dispatches on CategoryTreeNode.Group vs Transaction for hierarchical tree display

import { LookupTable } from '@graffio/functional'
import React from 'react'
import { CategoryTreeNode, ColumnDefinition, Transaction } from '../types/index.js'
import { Formatters } from '../utils/formatters.js'

const { formatCurrency, formatDate } = Formatters

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = {
    // Checks if table row is a Transaction node — for cell renderers
    // @sig isTransactionRow :: Row -> Boolean
    isTransactionRow: row => CategoryTreeNode.Transaction.is(row.original),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Extract last segment from colon-delimited category path (e.g., "Food:Groceries" -> "Groceries")
    // @sig toDisplayName :: String? -> String
    toDisplayName: value => {
        if (!value) return ''
        const idx = value.lastIndexOf(':')
        return idx === -1 ? value : value.slice(idx + 1)
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Expandable category cell — chevron + indented name for Groups, empty for Transactions
// @sig ExpandableCategoryCell :: { row: Row, getValue: Function } -> ReactElement
const ExpandableCategoryCell = ({ row, getValue }) => {
    if (P.isTransactionRow(row)) return empty

    const canExpand = row.getCanExpand()
    const isExpanded = row.getIsExpanded()
    const depth = row.depth
    const displayName = T.toDisplayName(getValue())

    return (
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: depth * 16 }}>
            <span style={chevronStyle} onClick={() => canExpand && row.toggleExpanded()}>
                {canExpand ? (isExpanded ? '▼' : '▶') : ''}
            </span>
            <span style={{ marginLeft: 4, fontWeight: depth === 0 ? 600 : 400 }}>{displayName}</span>
        </div>
    )
}

// Date cell — formatted date for Transactions, empty for Groups
// @sig DateCell :: { row: Row } -> ReactElement
const DateCell = ({ row }) => {
    if (!P.isTransactionRow(row)) return empty
    const date = row.original.transaction.date
    return <span>{date ? formatDate(date) : ''}</span>
}

// Account cell — accountName for Transactions, empty for Groups
// @sig AccountCell :: { row: Row } -> ReactElement
const AccountCell = ({ row }) => {
    if (!P.isTransactionRow(row)) return empty
    return <span>{row.original.transaction.accountName || ''}</span>
}

// Payee cell — payee for Transactions, empty for Groups
// @sig PayeeCell :: { row: Row } -> ReactElement
const PayeeCell = ({ row }) => {
    if (!P.isTransactionRow(row)) return empty
    return <span>{row.original.transaction.payee || ''}</span>
}

// Action cell — action label for Transactions (investment action if present), empty for Groups
// @sig ActionCell :: { row: Row } -> ReactElement
const ActionCell = ({ row }) => {
    if (!P.isTransactionRow(row)) return empty
    const code = row.original.transaction.investmentAction
    const label = code ? Transaction.ACTION_LABELS[code] || code : ''
    return <span>{label}</span>
}

// Memo cell — memo for Transactions, empty for Groups
// @sig MemoCell :: { row: Row } -> ReactElement
const MemoCell = ({ row }) => {
    if (!P.isTransactionRow(row)) return empty
    return <span style={memoStyle}>{row.original.transaction.memo || ''}</span>
}

// Amount cell — aggregate.total for Groups, transaction.amount for Transactions
// @sig AmountCell :: { row: Row } -> ReactElement
const AmountCell = ({ row }) => {
    const isTransaction = P.isTransactionRow(row)
    const value = isTransaction ? row.original.transaction.amount : row.original.aggregate.total
    if (value == null) return dash

    const formatted = formatCurrency(value)
    const style = value >= 0 ? positiveAmountStyle : negativeAmountStyle
    return <span style={style}>{formatted}</span>
}

// Count cell — aggregate.count for Groups, empty for Transactions
// @sig CountCell :: { row: Row } -> ReactElement
const CountCell = ({ row }) => {
    if (P.isTransactionRow(row)) return empty
    return <span style={rightBlock}>{row.original.aggregate.count}</span>
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const NUMERIC = { enableResizing: false, textAlign: 'right' }
const RESIZABLE = { enableResizing: true }
const chevronStyle = { cursor: 'pointer', userSelect: 'none', width: 20, display: 'inline-block', fontSize: 12 }
const rightBlock = { textAlign: 'right', display: 'block' }
const memoStyle = { color: 'var(--gray-10)', fontStyle: 'italic' }
const positiveAmountStyle = { color: 'var(--green-11)', fontWeight: '500', textAlign: 'right', display: 'block' }
const negativeAmountStyle = { color: 'var(--red-11)', fontWeight: '500', textAlign: 'right', display: 'block' }
const dash = <span style={rightBlock}>—</span>
const empty = <span />

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Column definitions for category spending report
 * Row structure: CategoryTreeNode (Group with aggregate, or Transaction with transaction)
 */
// prettier-ignore
const columns = LookupTable([
    ColumnDefinition.from({ id: 'category', accessorKey: 'key',             header: 'Category', size: 300, minSize: 150, cell: ExpandableCategoryCell, ...RESIZABLE }),
    ColumnDefinition.from({ id: 'date',     accessorKey: 'key',             header: 'Date',     size: 90,  minSize: 70,  cell: DateCell,               ...RESIZABLE }),
    ColumnDefinition.from({ id: 'account',  accessorKey: 'key',             header: 'Account',  size: 120, minSize: 80,  cell: AccountCell,            ...RESIZABLE }),
    ColumnDefinition.from({ id: 'payee',    accessorKey: 'key',             header: 'Payee',    size: 150, minSize: 100, cell: PayeeCell,               ...RESIZABLE }),
    ColumnDefinition.from({ id: 'action',   accessorKey: 'key',             header: 'Action',   size: 80,  minSize: 60,  cell: ActionCell,              ...RESIZABLE }),
    ColumnDefinition.from({ id: 'memo',     accessorKey: 'key',             header: 'Memo',     size: 150, minSize: 80,  cell: MemoCell,                ...RESIZABLE }),
    ColumnDefinition.from({ id: 'amount',   accessorKey: 'key',             header: 'Amount',   size: 120, minSize: 80,  cell: AmountCell,              ...NUMERIC }),
    ColumnDefinition.from({ id: 'count',    accessorKey: 'aggregate.count', header: 'Count',    size: 80,  minSize: 60,  cell: CountCell,               ...NUMERIC }),
], ColumnDefinition, 'id')

export { columns as CategoryReportColumns }
