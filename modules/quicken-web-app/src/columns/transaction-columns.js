// ABOUTME: Column definitions for bank and investment transaction registers
// ABOUTME: Uses ColumnDefinition tagged type aligned with TanStack Table format

import { ColumnDefinition } from '@graffio/design-system/src/types/column-definition.js'
import { LookupTable } from '@graffio/functional'
import { CellRenderers } from './CellRenderers.jsx'

const C = CellRenderers
const { ActionCell: Action, CategoryCell: Category, CurrencyCell: Currency, DateCell: Date } = C

// prettier-ignore
const { DefaultCell: Default, PayeeCell: Payee, PriceCell: Price, QuantityCell: Qty, SecurityCell: Security } = C

const col = ColumnDefinition.from
const TX_NUM = 'transaction.number'
const TX_CLR = 'transaction.cleared'
const TX_PAYEE = 'transaction.payee'
const TX_CATID = 'transaction.categoryId'
const TX_AMT = 'transaction.amount'
const TX_SECID = 'transaction.securityId'
const TX_INVACT = 'transaction.investmentAction'
const RUN_BAL = 'runningBalance'
const SNR = { meta: { searchable: true }, enableResizing: false }
const SER = { meta: { searchable: true }, enableResizing: true }
const NSNR = { meta: { searchable: false }, enableResizing: false }
const RTNR = { meta: { searchable: false, showRunningTotal: true }, enableResizing: false }
const CLR = { meta: { searchable: false }, enableResizing: false, textAlign: 'center' }

/*
 * Column definitions for bank transactions (checking, savings, credit card)
 * Row structure is RegisterRow with { transaction, runningBalance } fields
 */
// prettier-ignore
const bankColumns = LookupTable([
    col({ id: 'date', accessorKey: 'transaction.date', header: 'Date', size: 100, minSize: 100, cell: Date, ...SNR }),
    col({ id: 'number', accessorKey: TX_NUM, header: 'Number', size: 80, minSize: 80, cell: Default, ...SNR }),
    col({ id: 'cleared', accessorKey: TX_CLR, header: 'Clr', size: 30, minSize: 30, cell: Default, ...CLR }),
    col({ id: 'payee', accessorKey: TX_PAYEE, header: 'Payee / Memo', size: 300, minSize: 120, cell: Payee, ...SER }),
    col({ id: 'category', accessorKey: TX_CATID, header: 'Category', size: 140, minSize: 80, cell: Category, ...SER }),
    col({ id: 'amount', accessorKey: TX_AMT, header: 'Amount', size: 100, minSize: 80, cell: Currency, ...NSNR }),
    col({ id: 'balance', accessorKey: RUN_BAL, header: 'Balance', size: 100, minSize: 80, cell: Currency, ...RTNR }),
], ColumnDefinition, 'id')

/*
 * Column definitions for investment transactions (brokerage, 401k, IRA)
 * Row structure is RegisterRow with { transaction, runningBalance } fields
 */
// prettier-ignore
const investmentColumns = LookupTable([
    col({ id: 'date', accessorKey: 'transaction.date', header: 'Date', size: 110, cell: Date, ...SNR }),
    col({ id: 'security', accessorKey: TX_SECID, header: 'Security', size: 100, cell: Security, ...SER }),
    col({ id: 'action', accessorKey: TX_INVACT, header: 'Action', size: 100, cell: Action, ...SNR }),
    col({ id: 'quantity', accessorKey: 'transaction.quantity', header: 'Shares', size: 80, cell: Qty, ...NSNR }),
    col({ id: 'price', accessorKey: 'transaction.price', header: 'Price', size: 110, cell: Price, ...NSNR }),
    col({ id: 'amount', accessorKey: TX_AMT, header: 'Amount', size: 100, cell: Currency, ...NSNR }),
    col({ id: 'commission', accessorKey: 'transaction.commission', header: 'Comm', size: 80, cell: Currency, ...NSNR }),
    col({ id: 'balance', accessorKey: RUN_BAL, header: 'Balance', size: 100, cell: Currency, ...RTNR }),
], ColumnDefinition, 'id')

const TransactionColumns = { bankColumns, investmentColumns }

export { TransactionColumns }
