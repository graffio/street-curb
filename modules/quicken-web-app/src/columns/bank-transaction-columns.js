/*
 * Bank Transaction Column Definitions
 *
 * Column configuration for Transaction.Bank variant display in TransactionRegister.
 * Uses ColumnDefinition tagged type for type-safe, serializable column specs.
 */

import { ColumnDefinition } from '@graffio/design-system/src/types/column-definition.js'
import { Format } from '@graffio/design-system/src/types/format.js'

/*
 * Column definitions for bank transactions
 * Matches the current TransactionRegister layout
 */
// prettier-ignore
const bankTransactionColumns = [
    ColumnDefinition.from({ key: 'date'       , title: 'Date'       , width: '110px', textAlign: 'left'  , format: Format.Date('medium')             , searchable: true  }),
    ColumnDefinition.from({ key: 'number'     , title: 'Number'     , width: '70px' , textAlign: 'left'  , format: Format.None()                     , searchable: true  }),
    ColumnDefinition.from({ key: 'payee'      , title: 'Payee / Memo', flex: 1      , textAlign: 'left'  , format: Format.None()                     , searchable: true  }),
    ColumnDefinition.from({ key: 'cleared'    , title: 'Cleared'    , width: '60px' , textAlign: 'center', format: Format.None()                     , searchable: true  }),
    ColumnDefinition.from({ key: 'category'   , title: 'Category'   , width: '140px', textAlign: 'left'  , format: Format.None()                     , searchable: true  }),
    ColumnDefinition.from({ key: 'amount'     , title: 'Amount'     , width: '100px', textAlign: 'right' , format: Format.Custom('signedAmount')     , searchable: false }),
    ColumnDefinition.from({ key: 'runningBalance', title: 'Balance' , width: '100px', textAlign: 'right' , format: Format.Currency('en-US', 'USD')   , searchable: false }),
]

export { bankTransactionColumns }
