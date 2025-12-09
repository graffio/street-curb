/*
 * Investment Transaction Column Definitions
 *
 * Column configuration for Transaction.Investment variant display.
 * Different from bank transactions - includes security, action, quantity, price.
 */

import { ColumnDefinition } from '@graffio/design-system/src/types/column-definition.js'
import { Format } from '@graffio/design-system/src/types/format.js'

/*
 * Column definitions for investment transactions
 */
// prettier-ignore
const investmentTransactionColumns = [
    ColumnDefinition.from({ key: 'date'            , title: 'Date'      , width: '100px', textAlign: 'left'  , format: Format.Date('short')              , searchable: true  }),
    ColumnDefinition.from({ key: 'investmentAction', title: 'Action'    , width: '80px' , textAlign: 'left'  , format: Format.None()                     , searchable: true  }),
    ColumnDefinition.from({ key: 'payee'           , title: 'Security'  , flex: 1       , textAlign: 'left'  , format: Format.None()                     , searchable: true  }),
    ColumnDefinition.from({ key: 'quantity'        , title: 'Quantity'  , width: '80px' , textAlign: 'right' , format: Format.None()                     , searchable: false }),
    ColumnDefinition.from({ key: 'price'           , title: 'Price'     , width: '90px' , textAlign: 'right' , format: Format.Currency('en-US', 'USD')   , searchable: false }),
    ColumnDefinition.from({ key: 'commission'      , title: 'Comm'      , width: '70px' , textAlign: 'right' , format: Format.Currency('en-US', 'USD')   , searchable: false }),
    ColumnDefinition.from({ key: 'amount'          , title: 'Amount'    , width: '100px', textAlign: 'right' , format: Format.Custom('signedAmount')     , searchable: false }),
    ColumnDefinition.from({ key: 'runningBalance'  , title: 'Balance'   , width: '100px', textAlign: 'right' , format: Format.Currency('en-US', 'USD')   , searchable: false }),
]

export { investmentTransactionColumns }
