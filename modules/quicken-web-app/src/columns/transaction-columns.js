/*
 * Transaction Column Definitions
 *
 * Column configurations for bank and investment transaction registers.
 * Uses ColumnDefinition tagged type aligned with TanStack Table format.
 */

import { ColumnDefinition } from '@graffio/design-system/src/types/column-definition.js'
import { CategoryCell, CurrencyCell, DateCell, DefaultCell, PayeeCell } from './cell-renderers.jsx'

/*
 * Column definitions for bank transactions (checking, savings, credit card)
 */
// prettier-ignore
const bankTransactionColumns = [
    ColumnDefinition.from({ id: 'date'          , accessorKey: 'date'          , header: 'Date'        , size: 110, cell: DateCell    , meta: { searchable: true                          }                       }),
    ColumnDefinition.from({ id: 'number'        , accessorKey: 'number'        , header: 'Number'      , size: 70 , cell: DefaultCell , meta: { searchable: true                          }                       }),
    ColumnDefinition.from({ id: 'payee'         , accessorKey: 'payee'         , header: 'Payee / Memo', size: 300, cell: PayeeCell   , meta: { searchable: true                          }, enableResizing: true }),
    ColumnDefinition.from({ id: 'cleared'       , accessorKey: 'cleared'       , header: 'Clr'         , size: 50 , cell: DefaultCell , meta: { searchable: false, textAlign: 'center'    }                       }),
    ColumnDefinition.from({ id: 'category'      , accessorKey: 'categoryId'    , header: 'Category'    , size: 140, cell: CategoryCell, meta: { searchable: true                          }                       }),
    ColumnDefinition.from({ id: 'amount'        , accessorKey: 'amount'        , header: 'Amount'      , size: 100, cell: CurrencyCell, meta: { searchable: false                         }                       }),
    ColumnDefinition.from({ id: 'runningBalance', accessorKey: 'runningBalance', header: 'Balance'     , size: 100, cell: CurrencyCell, meta: { searchable: false, showRunningTotal: true }                       }),
]

/*
 * Column definitions for investment transactions (brokerage, 401k, IRA)
 */
// prettier-ignore
const investmentTransactionColumns = [
    ColumnDefinition.from({ id: 'date'      , accessorKey: 'date'            , header: 'Date'    , size: 110, cell: DateCell    , meta: { searchable: true  }                       }),
    ColumnDefinition.from({ id: 'action'    , accessorKey: 'investmentAction', header: 'Action'  , size: 80 , cell: DefaultCell , meta: { searchable: true  }                       }),
    ColumnDefinition.from({ id: 'security'  , accessorKey: 'securityId'      , header: 'Security', size: 200, cell: DefaultCell , meta: { searchable: true  }, enableResizing: true }),
    ColumnDefinition.from({ id: 'quantity'  , accessorKey: 'quantity'        , header: 'Qty'     , size: 80 , cell: DefaultCell , meta: { searchable: false, textAlign: 'right' }   }),
    ColumnDefinition.from({ id: 'price'     , accessorKey: 'price'           , header: 'Price'   , size: 90 , cell: CurrencyCell, meta: { searchable: false }                       }),
    ColumnDefinition.from({ id: 'commission', accessorKey: 'commission'      , header: 'Comm'    , size: 70 , cell: CurrencyCell, meta: { searchable: false }                       }),
    ColumnDefinition.from({ id: 'amount'    , accessorKey: 'amount'          , header: 'Amount'  , size: 100, cell: CurrencyCell, meta: { searchable: false }                       }),
]

export { bankTransactionColumns, investmentTransactionColumns }
