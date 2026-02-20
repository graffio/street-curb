// ABOUTME: Column definitions for bank and investment transaction registers
// ABOUTME: Uses ColumnDefinition tagged type aligned with TanStack Table format

import { LookupTable } from '@graffio/functional'
import { ColumnDefinition } from '../types/index.js'
import { CellRenderers } from './CellRenderers.jsx'

const { ActionCell, CategoryCell, CurrencyCell, DateCell, DefaultCell } = CellRenderers
const { PayeeCell, PriceCell, QuantityCell, SecurityCell } = CellRenderers

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Column definitions for bank transactions (checking, savings, credit card)
 * Row structure is RegisterRow with { transaction, runningBalance } fields
 */
// prettier-ignore
const bankColumns = LookupTable([
    ColumnDefinition.from({ id: 'date'    , accessorKey: 'transaction.date'      , header: 'Date'        , size: 100, minSize: 100, cell: DateCell    , enableResizing: false,                      meta: { searchable: true                          }}),
    ColumnDefinition.from({ id: 'number'  , accessorKey: 'transaction.number'    , header: 'Number'      , size: 80 , minSize: 80 , cell: DefaultCell , enableResizing: false,                      meta: { searchable: true                          }}),
    ColumnDefinition.from({ id: 'cleared' , accessorKey: 'transaction.cleared'   , header: 'Clr'         , size: 30 , minSize: 30 , cell: DefaultCell , enableResizing: false, textAlign: 'center', meta: { searchable: false                         }}),
    ColumnDefinition.from({ id: 'payee'   , accessorKey: 'transaction.payee'     , header: 'Payee / Memo', size: 300, minSize: 120, cell: PayeeCell   , enableResizing: true ,                      meta: { searchable: true                          }}),
    ColumnDefinition.from({ id: 'category', accessorKey: 'transaction.categoryId', header: 'Category'    , size: 140, minSize: 80 , cell: CategoryCell, enableResizing: true ,                      meta: { searchable: true                          }}),
    ColumnDefinition.from({ id: 'amount'  , accessorKey: 'transaction.amount'    , header: 'Amount'      , size: 100, minSize: 80 , cell: CurrencyCell, enableResizing: false,                      meta: { searchable: false                         }}),
    ColumnDefinition.from({ id: 'balance' , accessorKey: 'runningBalance'        , header: 'Balance'     , size: 100, minSize: 80 , cell: CurrencyCell, enableResizing: false,                      meta: { searchable: false, showRunningTotal: true }}),
], ColumnDefinition, 'id')

/*
 * Column definitions for investment transactions (brokerage, 401k, IRA)
 * Row structure is RegisterRow with { transaction, runningBalance } fields
 */
// prettier-ignore
const investmentColumns = LookupTable([
    ColumnDefinition.from({ id: 'date'      , accessorKey: 'transaction.date'            , header: 'Date'        , size: 110, minSize: 100, cell: DateCell    , enableResizing: false, meta: { searchable: true                           }}),
    ColumnDefinition.from({ id: 'payee'    , accessorKey: 'transaction.payee'           , header: 'Payee / Memo', size: 200, minSize: 120, cell: PayeeCell   , enableResizing: true , meta: { searchable: true                           }}),
    ColumnDefinition.from({ id: 'security' , accessorKey: 'transaction.securityId'      , header: 'Security'    , size: 100, minSize: 80 , cell: SecurityCell, enableResizing: true , meta: { searchable: true                           }}),
    ColumnDefinition.from({ id: 'action'   , accessorKey: 'transaction.investmentAction', header: 'Action'      , size: 100, minSize: 80 , cell: ActionCell  , enableResizing: false, meta: { searchable: true                           }}),
    ColumnDefinition.from({ id: 'quantity' , accessorKey: 'transaction.quantity'        , header: 'Shares'      , size: 80 , minSize: 60 , cell: QuantityCell, enableResizing: false, meta: { searchable: false                          }}),
    ColumnDefinition.from({ id: 'price'    , accessorKey: 'transaction.price'           , header: 'Price'       , size: 110, minSize: 80 , cell: PriceCell   , enableResizing: false, meta: { searchable: false                          }}),
    ColumnDefinition.from({ id: 'amount'   , accessorKey: 'transaction.amount'          , header: 'Amount'      , size: 100, minSize: 80 , cell: CurrencyCell, enableResizing: false, meta: { searchable: false                          }}),
    ColumnDefinition.from({ id: 'commission', accessorKey: 'transaction.commission'     , header: 'Comm'        , size: 80 , minSize: 60 , cell: CurrencyCell, enableResizing: false, meta: { searchable: false                          }}),
    ColumnDefinition.from({ id: 'balance'  , accessorKey: 'runningBalance'              , header: 'Balance'     , size: 100, minSize: 80 , cell: CurrencyCell, enableResizing: false, meta: { searchable: false, showRunningTotal: true  }}),
], ColumnDefinition, 'id')

const TransactionColumns = { bankColumns, investmentColumns }

export { TransactionColumns }
