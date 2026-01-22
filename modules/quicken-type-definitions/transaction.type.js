import { anyFieldContains, containsIgnoreCase } from '@graffio/functional'

export const Transaction = {
    name: 'Transaction',
    kind: 'taggedSum',
    variants: {
        Bank: {
            // Required fields (alphabetical)
            accountId: /^acc_[a-f0-9]{12}$/,
            amount: 'Number',
            date: 'String',
            id: /^txn_[a-f0-9]{12}(-\d+)?$/,
            transactionType: /^bank$/,

            // Optional fields (alphabetical)
            address: 'String?',
            categoryId: 'String?', // cat_<hash> or null
            cleared: 'String?',
            memo: 'String?',
            number: 'String?',
            payee: 'String?',
            runningBalance: 'Number?',
        },
        Investment: {
            // Required fields (alphabetical)
            accountId: /^acc_[a-f0-9]{12}$/,
            date: 'String',
            id: /^txn_[a-f0-9]{12}(-\d+)?$/,
            transactionType: /^investment$/,

            // Optional fields (alphabetical)
            address: 'String?',
            amount: 'Number?',
            categoryId: 'String?', // cat_<hash> or null
            cleared: 'String?',
            commission: 'Number?',
            investmentAction:
                /^(Buy|BuyX|Cash|CGLong|CGShort|ContribX|CvrShrt|Div|DivX|Exercise|Expire|Grant|IntInc|MargInt|MiscExp|MiscInc|MiscIncX|ReinvDiv|ReinvInt|ReinvLg|ReinvMd|ReinvSh|Reminder|RtrnCapX|Sell|SellX|ShrsIn|ShrsOut|ShtSell|StkSplit|Vest|WithdrwX|XIn|XOut)$/,
            memo: 'String?',
            payee: 'String?',
            price: 'Number?',
            quantity: 'Number?',
            runningBalance: 'Number?',
            securityId: 'String?', // sec_<hash> or null
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
    if (securities && matches(Transaction.toSecurityName(txn, securities))) return true
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
    const { start, end } = dateRange
    if (!start && !end) return true
    const startStr = start ? start.toISOString().slice(0, 10) : null
    const endStr = end ? end.toISOString().slice(0, 10) : null
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
// Filter Composition
// -----------------------------------------------------------------------------

// Applies all standard filters: text -> date -> category -> account
// FilterConfig = { transactions, query, dateRange, categoryIds, accountIds, categories, securities }
// @sig applyFilters :: FilterConfig -> [Transaction]
Transaction.applyFilters = ({ transactions, query, dateRange, categoryIds, accountIds, categories, securities }) =>
    transactions
        .filter(Transaction.matchesText(query, categories, securities))
        .filter(Transaction.isInDateRange(dateRange))
        .filter(Transaction.matchesCategories(categoryIds, categories))
        .filter(t => !accountIds.length || accountIds.includes(t.accountId))

// Applies investment-specific filters: securities and actions
// @sig applyInvestmentFilters :: ([Transaction], [String], [String]) -> [Transaction]
Transaction.applyInvestmentFilters = (transactions, securityIds, actionIds) =>
    transactions
        .filter(Transaction.matchesSecurities(securityIds))
        .filter(Transaction.matchesInvestmentActions(actionIds))

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
