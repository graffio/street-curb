// ABOUTME: Transaction type definition for bank and investment transactions
// ABOUTME: Includes filter predicates, enrichment helpers, and balance aggregations

import {
    anyFieldContains,
    containsIgnoreCase,
    convertSlashToIso,
    dateToDateParts,
    formatDateString,
} from '@graffio/functional'
import { FieldTypes } from './field-types.js'

export const Transaction = {
    name: 'Transaction',
    kind: 'taggedSum',
    variants: {
        Bank: {
            // Required fields (alphabetical)
            accountId: FieldTypes.accountId,
            amount: 'Number',
            date: 'String',
            id: FieldTypes.transactionId,
            transactionType: /^bank$/,

            // Optional fields (alphabetical)
            address: 'String?',
            categoryId: 'String?',
            cleared: 'String?',
            memo: 'String?',
            number: 'String?',
            payee: 'String?',
            runningBalance: 'Number?',
            transferAccountId: { pattern: FieldTypes.accountId, optional: true },
        },
        Investment: {
            // Required fields (alphabetical)
            accountId: FieldTypes.accountId,
            date: 'String',
            id: FieldTypes.transactionId,
            transactionType: /^investment$/,

            // Optional fields (alphabetical)
            address: 'String?',
            amount: 'Number?',
            categoryId: 'String?',
            cleared: 'String?',
            commission: 'Number?',

            // prettier-ignore
            investmentAction: /^(Buy|BuyX|Cash|CGLong|CGShort|ContribX|CvrShrt|Div|DivX|Exercise|Expire|Grant|IntInc|MargInt|MiscExp|MiscInc|MiscIncX|ReinvDiv|ReinvInt|ReinvLg|ReinvMd|ReinvSh|Reminder|RtrnCapX|Sell|SellX|ShrsIn|ShrsOut|ShtSell|StkSplit|Vest|WithdrwX|XIn|XOut)$/,
            memo: 'String?',
            payee: 'String?',
            price: 'Number?',
            quantity: 'Number?',
            runningBalance: 'Number?',
            securityId: 'String?',
            transferAccountId: { pattern: FieldTypes.accountId, optional: true },
        },
    },
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

// Resolves a transaction's categoryId to category name (null if no categoryId)
// @sig toCategoryName :: (Transaction, LookupTable<Category>) -> String?
Transaction.toCategoryName = (txn, categories) => {
    if (!txn.categoryId) return null
    return categories.get(txn.categoryId).name
}

// Resolves a transaction's securityId to symbol or name (null if no securityId)
// @sig toSecurityName :: (Transaction, LookupTable<Security>) -> String?
Transaction.toSecurityName = (txn, securities) => {
    if (!txn.securityId) return null
    const security = securities.get(txn.securityId)
    return security.symbol || security.name
}

// Checks if query matches a transaction's security symbol or name
// @sig matchesSecurityText :: (String, Transaction, LookupTable<Security>) -> Boolean
Transaction.matchesSecurityText = (query, txn, securities) => {
    if (!txn.securityId) return false
    const security = securities.get(txn.securityId)
    const matches = containsIgnoreCase(query)
    return matches(security.symbol) || matches(security.name)
}

// Wraps transaction for DataTable row format (includes runningBalance)
// @sig toRegisterRow :: Transaction -> { transaction: Transaction, runningBalance: Number? }
Transaction.toRegisterRow = txn => ({ transaction: txn, runningBalance: txn.runningBalance })

// Enriches transaction with resolved category and account names for display
// EnrichedTransaction = Transaction & { categoryName: String, accountName: String }
// @sig toEnriched :: (Transaction, LookupTable<Category>, LookupTable<Account>) -> EnrichedTransaction
Transaction.toEnriched = (txn, categories, accounts) => ({
    ...txn,
    categoryName: Transaction.toCategoryName(txn, categories) || 'Uncategorized',
    accountName: accounts.get(txn.accountId).name,
})

// -----------------------------------------------------------------------------
// Predicates (curried for use with filter)
// -----------------------------------------------------------------------------

// Core text matching against transaction fields, category, and optionally security
// @sig matchesAnyText :: (String, [String], LookupTable<Category>, LookupTable<Security>?) -> Transaction -> Boolean
Transaction.matchesAnyText = (query, fields, categories, securities) => txn => {
    const matchesFields = anyFieldContains(fields)(query)
    const matches = containsIgnoreCase(query)
    if (matchesFields(txn)) return true
    if (matches(Transaction.toCategoryName(txn, categories))) return true
    if (securities && Transaction.matchesSecurityText(query, txn, securities)) return true
    return false
}

// Returns predicate for search highlighting (checks payee, memo, address, number, amount, category)
// @sig matchesSearch :: (String, LookupTable<Category>) -> Transaction -> Boolean
Transaction.matchesSearch = (query, categories) => txn => {
    if (!query.trim()) return false
    if (Transaction.matchesAnyText(query, ['payee', 'memo', 'address', 'number'], categories, null)(txn)) return true
    return containsIgnoreCase(query)(String(txn.amount))
}

// Returns predicate for text filtering (checks memo, payee, action, category, security)
// @sig matchesText :: (String, LookupTable<Category>, LookupTable<Security>) -> Transaction -> Boolean
Transaction.matchesText = (query, categories, securities) => txn => {
    if (!query.trim()) return true
    return Transaction.matchesAnyText(query, ['memo', 'payee', 'investmentAction'], categories, securities)(txn)
}

// Returns predicate for date range filtering (ISO string comparison)
// DateRange = { start: Date?, end: Date? }
// @sig isInDateRange :: DateRange -> Transaction -> Boolean
Transaction.isInDateRange = dateRange => txn => {
    const toDateStr = d => convertSlashToIso(formatDateString(dateToDateParts(d)))
    const { start, end } = dateRange
    if (!start && !end) return true
    const startStr = start ? toDateStr(start) : null
    const endStr = end ? toDateStr(end) : null
    if (startStr && txn.date < startStr) return false
    if (endStr && txn.date > endStr) return false
    return true
}

// Returns predicate for category filtering (supports hierarchy with colon separator)
// @sig matchesCategories :: ([String], LookupTable<Category>) -> Transaction -> Boolean
Transaction.matchesCategories = (selected, categories) => txn => {
    if (!selected.length) return true
    const categoryName = Transaction.toCategoryName(txn, categories)
    if (!categoryName) return false
    return selected.some(s => categoryName === s || categoryName.startsWith(s + ':'))
}

// Returns predicate for single account filtering
// @sig isInAccount :: String -> Transaction -> Boolean
Transaction.isInAccount = accountId => txn => txn.accountId === accountId

// Returns predicate for security filtering (investment transactions)
// @sig matchesSecurities :: [String] -> Transaction -> Boolean
Transaction.matchesSecurities = securityIds => txn => !securityIds.length || securityIds.includes(txn.securityId)

// Returns predicate for investment action filtering
// @sig matchesInvestmentActions :: [String] -> Transaction -> Boolean
Transaction.matchesInvestmentActions = actions => txn => !actions.length || actions.includes(txn.investmentAction)

// -----------------------------------------------------------------------------
// Batch Operations
// -----------------------------------------------------------------------------

// Collects IDs of transactions matching search query (for highlighting)
// @sig collectSearchMatchIds :: ([Transaction], String, LookupTable<Category>) -> [String]
Transaction.collectSearchMatchIds = (transactions, query, categories) =>
    transactions.filter(Transaction.matchesSearch(query, categories)).map(t => t.id)

// Enriches all transactions with category and account names
// @sig enrichAll :: ([Transaction], LookupTable<Category>, LookupTable<Account>) -> [EnrichedTransaction]
Transaction.enrichAll = (transactions, categories, accounts) =>
    transactions.map(txn => Transaction.toEnriched(txn, categories, accounts))

// Wraps all transactions for DataTable row format
// @sig toRegisterRows :: [Transaction] -> [RegisterRow]
Transaction.toRegisterRows = transactions => transactions.map(Transaction.toRegisterRow)

// -----------------------------------------------------------------------------
// Aggregations
// -----------------------------------------------------------------------------

// Finds the earliest transaction date (null if empty array)
// @sig findEarliest :: [Transaction] -> Date?
Transaction.findEarliest = transactions => {
    if (transactions.length === 0) return null
    return transactions.reduce((earliest, txn) => {
        const d = new Date(txn.date)
        return d < earliest ? d : earliest
    }, new Date(transactions[0].date))
}

// Sum of all transaction amounts
// @sig currentBalance :: [Transaction] -> Number
Transaction.currentBalance = transactions => transactions.reduce((sum, txn) => sum + txn.amount, 0)

// Sum of transactions on or before date (inclusive)
// Date comparison uses ISO string format (lexicographic = chronological)
// @sig balanceAsOf :: (String, [Transaction]) -> Number
Transaction.balanceAsOf = (isoDate, transactions) =>
    transactions.filter(txn => txn.date <= isoDate).reduce((sum, txn) => sum + txn.amount, 0)

// Breakdown by cleared status
// @sig balanceBreakdown :: [Transaction] -> { cleared: Number, uncleared: Number, total: Number }
Transaction.balanceBreakdown = transactions => {
    const cleared = transactions
        .filter(txn => txn.cleared === 'R' || txn.cleared === 'c')
        .reduce((sum, txn) => sum + txn.amount, 0)
    const total = transactions.reduce((sum, txn) => sum + txn.amount, 0)
    return { cleared, uncleared: total - cleared, total }
}

// Difference between statement balance and cleared transactions
// Positive = statement shows more than we have cleared
// @sig reconciliationDifference :: (Number, [Transaction]) -> Number
Transaction.reconciliationDifference = (statementBalance, transactions) => {
    const { cleared } = Transaction.balanceBreakdown(transactions)
    return statementBalance - cleared
}
