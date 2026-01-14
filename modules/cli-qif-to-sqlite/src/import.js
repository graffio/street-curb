// ABOUTME: Import orchestration for QIF data with stable identity matching
// ABOUTME: Coordinates account/security/transaction import and orphan detection

import { ImportLots } from './import-lots.js'
import { Matching } from './Matching.js'
import { Signatures as SigT } from './signatures.js'
import { StableIdentity } from './stable-identity.js'

const BANK_TRANSACTION_TYPES = new Set(['Bank', 'Cash', 'Credit Card', 'Invoice', 'Other Asset', 'Other Liability'])

// Investment actions that affect cash balance (amount is already signed correctly)
// prettier-ignore
const CASH_IMPACT_ACTIONS = new Set([
    'Buy', 'Cash', 'CGLong', 'CGShort', 'ContribX', 'CvrShrt', 'Div', 'IntInc', 'MargInt',
    'MiscExp', 'MiscInc', 'Sell', 'ShtSell', 'WithdrwX', 'XIn', 'XOut',
])

const P = {
    // Check if category string is a transfer marker like [Checking]
    // @sig isTransfer :: String|null -> Boolean
    isTransfer: cat => cat?.startsWith('[') && cat?.endsWith(']'),

    // Check if category string is a special marker (_RlzdGain, _UnrlzdGain, --Split--)
    // @sig isSpecialMarker :: String|null -> Boolean
    isSpecialMarker: cat => cat?.startsWith('_RlzdGain') || cat?.startsWith('_UnrlzdGain') || cat === '--Split--',

    // Check if QIF transaction type is a bank type (vs investment)
    // @sig isBankTransactionType :: String -> Boolean
    isBankTransactionType: type => BANK_TRANSACTION_TYPES.has(type),
}

const T = {
    // Convert boolean or number to integer for SQLite (which can't bind booleans)
    // @sig toBoolInt :: Boolean|Number|null -> Number|null
    toBoolInt: val => (val == null ? null : val ? 1 : 0),

    // Convert address array to newline-separated string for SQLite storage
    // @sig toAddressString :: [String]|String|null -> String|null
    toAddressString: address => (Array.isArray(address) ? address.join('\n') : address || null),

    // Convert Date object to ISO date string for SQLite storage
    // @sig toDateString :: Date|String -> String
    toDateString: date => (date instanceof Date ? date.toISOString().slice(0, 10) : date),

    // Extract base category name from raw category string (strips class suffix, handles markers)
    // @sig toBaseCategoryName :: String|null -> String|null
    toBaseCategoryName: cat => {
        if (!cat || P.isTransfer(cat) || P.isSpecialMarker(cat)) return null
        return cat.split('/')[0]
    },

    // Convert QIF transaction type to schema type ('bank' or 'investment')
    // @sig toSchemaTransactionType :: String -> String
    toSchemaTransactionType: type => (P.isBankTransactionType(type) ? 'bank' : 'investment'),

    // Compute transaction signature using stable IDs (per D2)
    // @sig computeTransactionSignature :: (Transaction, String, String | null) -> String
    computeTransactionSignature: (txn, accountId, securityId) => {
        if (txn.transactionType === 'investment') return SigT.investmentTransactionSignature(txn, accountId, securityId)

        return SigT.bankTransactionSignature(txn, accountId)
    },

    // Build context object needed by importLots
    // @sig toLotContext :: Database -> {accountLookup, securityLookup, transactionLookup, lotLookup, allocationLookup}
    toLotContext: db => ({
        accountLookup: Matching.buildNameLookup(db, 'Account'),
        securityLookup: Matching.buildSecurityLookup(db),
        transactionLookup: Matching.buildTransactionLookup(db, 'Transaction'),
        lotLookup: Matching.buildLotLookup(db),
        allocationLookup: Matching.buildLotAllocationLookup(db),
    }),
}

const A = {
    // Find all split stableIds that belong to a given transaction (per D13 cascade orphaning)
    // Split signatures start with transactionStableId per D20: transactionStableId|categoryStableId|amount
    // @sig findSplitsByTransaction :: (Database, String) -> [String]
    findSplitsByTransaction: (db, transactionStableId) => {
        const stmt = db.prepare(`
            SELECT id FROM stableIdentities
            WHERE entityType = 'Split' AND signature LIKE ?
        `)
        const rows = stmt.all(`${transactionStableId}|%`)
        return rows.map(r => r.id)
    },
}

const E = {
    // Execute the import work within a transaction
    // Handles both combined (transactions) and separate (bankTransactions/investmentTransactions) formats
    // @sig executeImportWork :: (Database, Object, Object, Object, Object, Function?) -> void
    executeImportWork: (db, data, lookups, importFns, markOrphanFn, onProgress) => {
        const { accounts, categories, tags, securities, prices, bankTransactions, investmentTransactions } = data
        const report = onProgress || (() => {})

        // Support both parser format (separate arrays) and combined format
        const transactions = data.transactions || [...(bankTransactions || []), ...(investmentTransactions || [])]
        const { accounts: accLookup, categories: catLookup, tags: tagLookup } = lookups
        const { securities: secLookup, transactions: txnLookup, splits: splitLookup, prices: priceLookup } = lookups

        report('Clearing tables...')
        E.clearBaseTables(db)

        report(`Importing ${accounts?.length || 0} accounts...`)
        const accountMap = importFns.accounts(db, accLookup, accounts)

        report(`Importing ${categories?.length || 0} categories...`)
        const categoryMap = importFns.categories(db, catLookup, categories)

        report(`Importing ${tags?.length || 0} tags...`)
        importFns.tags(db, tagLookup, tags)

        report(`Importing ${securities?.length || 0} securities...`)
        const securityMap = importFns.securities(db, secLookup, securities)

        report(`Importing ${transactions.length} transactions...`)
        importFns.transactions(db, txnLookup, accountMap, securityMap, splitLookup, categoryMap, transactions)

        report(`Importing ${prices?.length || 0} prices...`)
        importFns.prices(db, priceLookup, securityMap, prices)

        report('Computing running balances...')
        E.updateRunningBalances(db)

        report('Computing lots...')
        ImportLots.importLots(db, T.toLotContext(db))

        report('Marking orphans...')
        markOrphanFn(db, {
            accounts: accLookup,
            categories: catLookup,
            tags: tagLookup,
            securities: secLookup,
            transactions: txnLookup,
            prices: priceLookup,
        })
        report('Done!')
    },

    // Import or match a single account, updating accountMap with id
    // Handles restore of previously orphaned accounts
    // @sig importSingleAccount :: (Database, Statement, {lookup, tracker}, Map, Account) -> void
    importSingleAccount: (db, insertStatement, { lookup, tracker }, accountMap, account) => {
        const { name, type, description, creditLimit } = account
        const existing = lookup.get(name)
        if (existing) {
            const { id, orphanedAt } = existing
            tracker.markSeen(id)
            insertStatement.run(id, name, type, description, creditLimit)
            orphanedAt && StableIdentity.restoreEntity(db, id)
            accountMap.set(name, id)
            return
        }

        const id = StableIdentity.createStableId(db, 'Account')
        insertStatement.run(id, name, type, description, creditLimit)
        StableIdentity.insertStableIdentity(db, { id, entityType: 'Account', signature: name })
        accountMap.set(name, id)
    },

    // Import or match a single category, updating categoryMap with id
    // Handles restore of previously orphaned categories
    // @sig importSingleCategory :: (Database, Statement, {lookup, tracker}, Map, Category) -> void
    importSingleCategory: (db, insertStatement, { lookup, tracker }, categoryMap, category) => {
        const { name, description, budgetAmount, isIncomeCategory, isTaxRelated, taxSchedule } = category
        const isIncome = T.toBoolInt(isIncomeCategory)
        const isTax = T.toBoolInt(isTaxRelated)
        const existing = lookup.get(name)
        if (existing) {
            const { id, orphanedAt } = existing
            tracker.markSeen(id)
            insertStatement.run(id, name, description, budgetAmount, isIncome, isTax, taxSchedule)
            orphanedAt && StableIdentity.restoreEntity(db, id)
            categoryMap.set(name, id)
            return
        }

        const id = StableIdentity.createStableId(db, 'Category')
        insertStatement.run(id, name, description, budgetAmount, isIncome, isTax, taxSchedule)
        StableIdentity.insertStableIdentity(db, { id, entityType: 'Category', signature: name })
        categoryMap.set(name, id)
    },

    // Import or match a single tag, updating tagMap with id
    // Handles restore of previously orphaned tags
    // @sig importSingleTag :: (Database, Statement, {lookup, tracker}, Map, Tag) -> void
    importSingleTag: (db, insertStatement, { lookup, tracker }, tagMap, tag) => {
        const { name, color, description } = tag
        const existing = lookup.get(name)
        if (existing) {
            const { id, orphanedAt } = existing
            tracker.markSeen(id)
            insertStatement.run(id, name, color, description)
            orphanedAt && StableIdentity.restoreEntity(db, id)
            tagMap.set(name, id)
            return
        }

        const id = StableIdentity.createStableId(db, 'Tag')
        insertStatement.run(id, name, color, description)
        StableIdentity.insertStableIdentity(db, { id, entityType: 'Tag', signature: name })
        tagMap.set(name, id)
    },

    // Store security in map by both name and symbol for lookup by either
    // @sig storeSecurityInMap :: (Map, String, String|null, String) -> void
    storeSecurityInMap: (securityMap, name, symbol, id) => {
        symbol && securityMap.set(symbol, id)
        securityMap.set(name, id)
    },

    // Import or match a single security, updating securityMap with id
    // Stores by BOTH name and symbol so transaction lookup by either works
    // Handles restore of previously orphaned securities
    // @sig importSingleSecurity :: (Database, Statement, {lookup, tracker}, Map, Security) -> void
    importSingleSecurity: (db, insertStatement, { lookup, tracker }, securityMap, security) => {
        const { name, symbol, type, goal } = security
        const signature = SigT.securitySignature(security)
        const existing = Matching.findSecurityMatch(lookup, security)
        if (existing) {
            const { id, orphanedAt } = existing
            tracker.markSeen(id)
            insertStatement.run(id, name, symbol, type, goal)
            orphanedAt && StableIdentity.restoreEntity(db, id)
            E.storeSecurityInMap(securityMap, name, symbol, id)
            return
        }

        const id = StableIdentity.createStableId(db, 'Security')
        insertStatement.run(id, name, symbol, type, goal)
        StableIdentity.insertStableIdentity(db, { id, entityType: 'Security', signature })
        E.storeSecurityInMap(securityMap, name, symbol, id)
    },

    // Import or match a single split, returning id
    // @sig importSingleSplit :: (Database, Statement, Map, String, Map, Split) -> {id, isNew}
    importSingleSplit: (db, insertStatement, splitLookup, transactionId, categoryMap, split) => {
        const { categoryName, amount, memo } = split
        const baseCategoryName = T.toBaseCategoryName(categoryName)
        const categoryId = baseCategoryName ? (categoryMap.get(baseCategoryName) ?? null) : null

        const signature = SigT.splitSignature(split, transactionId, categoryId)
        const existing = Matching.findTransactionMatch(splitLookup, signature)
        if (existing) {
            const { id, orphanedAt } = existing
            insertStatement.run(id, transactionId, categoryId, amount, memo)
            orphanedAt && StableIdentity.restoreEntity(db, id)
            return { id, isNew: false }
        }

        const id = StableIdentity.createStableId(db, 'Split')
        insertStatement.run(id, transactionId, categoryId, amount, memo)
        StableIdentity.insertStableIdentity(db, { id, entityType: 'Split', signature })
        return { id, isNew: true }
    },

    // Import or match a single transaction, returning id for split processing
    // Handles both parser format (account, security, transactionType) and legacy format (accountName, etc.)
    // @sig importSingleTransaction :: (Database, Statement, Map, Map, Map, Transaction) -> {id, isNew}
    importSingleTransaction: (db, insertStatement, txnLookup, accountMap, securityMap, txn) => {
        // prettier-ignore
        const { account, accountName: legacyAccountName, security, securitySignature, date, amount, transactionType,
            payee, memo, number, cleared, categoryId, address, runningBalance, quantity, price, commission } = txn

        // Support both canonical (parser) and legacy (cli.js alias) field names
        const accountName = account || legacyAccountName
        const securityKey = security || securitySignature

        // For investment transactions, transactionType IS the action ('Buy', 'Sell')
        // For bank transactions, it's the account type ('Bank', 'Credit Card')
        const isBankType = P.isBankTransactionType(transactionType)
        const investmentAction = isBankType ? null : transactionType

        const accountId = accountMap.get(accountName)
        const securityId = securityKey ? securityMap.get(securityKey) : null
        const dateString = T.toDateString(date)
        const addressString = T.toAddressString(address)
        const schemaTransactionType = isBankType ? 'bank' : 'investment'

        // Bank transactions require amount; default to 0 for opening balance entries missing T/U line
        const normalizedAmount = isBankType && amount == null ? 0 : amount

        const signature = T.computeTransactionSignature(txn, accountId, securityId)
        const existing = Matching.findTransactionMatch(txnLookup, signature)
        if (existing) {
            const { id, orphanedAt } = existing
            insertStatement.run(
                id,
                accountId,
                dateString,
                normalizedAmount,
                schemaTransactionType,
                payee,
                memo,
                number,
                cleared,
                categoryId,
                addressString,
                runningBalance,
                securityId,
                quantity,
                price,
                commission,
                investmentAction,
            )
            orphanedAt && StableIdentity.restoreEntity(db, id)
            return { id, isNew: false }
        }

        const id = StableIdentity.createStableId(db, 'Transaction')
        insertStatement.run(
            id,
            accountId,
            dateString,
            normalizedAmount,
            schemaTransactionType,
            payee,
            memo,
            number,
            cleared,
            categoryId,
            addressString,
            runningBalance,
            securityId,
            quantity,
            price,
            commission,
            investmentAction,
        )
        StableIdentity.insertStableIdentity(db, { id, entityType: 'Transaction', signature })
        return { id, isNew: true }
    },

    // Import a transaction with its splits using context object
    // @sig importTransactionWithSplitsCtx :: (TransactionContext, Transaction) -> void
    importTransactionWithSplitsCtx: (ctx, txn) => {
        const { db, insertStatement, txnLookup, accountMap, securityMap, splitLookup, categoryMap } = ctx
        const result = E.importSingleTransaction(db, insertStatement, txnLookup, accountMap, securityMap, txn)
        if (txn.splits?.length > 0) importSplits(db, splitLookup, result.id, categoryMap, txn.splits)
    },

    // Import or match a single price
    // @sig importSinglePrice :: (Database, Statement, Map, Map, Price) -> {id, isNew}
    importSinglePrice: (db, insertStatement, priceLookup, securityMap, price) => {
        const { date, price: priceValue } = price
        const securityKey = SigT.securitySignature(price)
        const securityId = securityMap.get(securityKey)
        if (!securityId) return null

        const dateString = T.toDateString(date)
        const signature = SigT.priceSignature(securityId, dateString)
        const existing = Matching.findTransactionMatch(priceLookup, signature)
        if (existing) {
            const { id, orphanedAt } = existing
            insertStatement.run(id, securityId, dateString, priceValue)
            orphanedAt && StableIdentity.restoreEntity(db, id)
            return { id, isNew: false }
        }

        const id = StableIdentity.createStableId(db, 'Price')
        insertStatement.run(id, securityId, dateString, priceValue)
        StableIdentity.insertStableIdentity(db, { id, entityType: 'Price', signature })
        return { id, isNew: true }
    },

    // Clear base tables before reimport (D8: import is always full replace)
    // stableIdentities is preserved across imports
    // @sig clearBaseTables :: Database -> void
    clearBaseTables: db =>
        db.exec(`
            DELETE FROM lotAllocations;
            DELETE FROM lots;
            DELETE FROM transactionSplits;
            DELETE FROM transactions;
            DELETE FROM prices;
            DELETE FROM securities;
            DELETE FROM categories;
            DELETE FROM tags;
            DELETE FROM accounts;
        `),

    // Update running balances for all transactions using SQL window function
    // Must be called after all transactions are imported
    // @sig updateRunningBalances :: Database -> void
    updateRunningBalances: db => {
        const cashImpactActions = Array.from(CASH_IMPACT_ACTIONS)
            .map(a => `'${a}'`)
            .join(', ')

        db.prepare(
            `
            WITH balances AS (
                SELECT
                    id,
                    SUM(
                        CASE
                            WHEN transactionType = 'bank' THEN amount
                            WHEN transactionType = 'investment' AND investmentAction IN (${cashImpactActions})
                                THEN COALESCE(amount, 0)
                            ELSE 0
                        END
                    ) OVER (
                        PARTITION BY accountId
                        ORDER BY date, rowid
                    ) as runningBalance
                FROM transactions
            )
            UPDATE transactions
            SET runningBalance = balances.runningBalance
            FROM balances
            WHERE transactions.id = balances.id
        `,
        ).run()
    },
}

// Build all lookup maps and trackers needed for matching during import
// @sig buildLookupMaps :: Database -> {accounts, categories, tags, securities, transactions, splits, prices}
const buildLookupMaps = db => {
    const accountLookup = Matching.buildNameLookup(db, 'Account')
    const categoryLookup = Matching.buildNameLookup(db, 'Category')
    const tagLookup = Matching.buildNameLookup(db, 'Tag')
    const { lookup: secLookup, tracker: secTracker } = Matching.buildSecurityLookupWithTracker(db)
    return {
        accounts: { lookup: accountLookup, tracker: Matching.createSeenTracker(accountLookup) },
        categories: { lookup: categoryLookup, tracker: Matching.createSeenTracker(categoryLookup) },
        tags: { lookup: tagLookup, tracker: Matching.createSeenTracker(tagLookup) },
        securities: { lookup: secLookup, tracker: secTracker },
        transactions: Matching.buildTransactionLookup(db, 'Transaction'),
        splits: Matching.buildSplitLookup(db),
        prices: Matching.buildPriceLookup(db),
    }
}

// Import accounts with stable identity matching (exact name match)
// Returns map of accountName → id for downstream use
// @sig importAccounts :: (Database, {lookup, tracker}, [Account]) -> Map<String, String>
const importAccounts = (db, accountLookup, accounts) => {
    const accountMap = new Map()
    const insertAccount = db.prepare(`
        INSERT INTO accounts (id, name, type, description, creditLimit)
        VALUES (?, ?, ?, ?, ?)
    `)
    accounts.forEach(account => E.importSingleAccount(db, insertAccount, accountLookup, accountMap, account))
    return accountMap
}

// Import categories with stable identity matching (exact name match)
// Returns map of categoryName → id for downstream use
// @sig importCategories :: (Database, {lookup, tracker}, [Category]) -> Map<String, String>
const importCategories = (db, categoryLookup, categories) => {
    const categoryMap = new Map()
    const insertCategory = db.prepare(`
        INSERT INTO categories
            (id, name, description, budgetAmount, isIncomeCategory, isTaxRelated, taxSchedule)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    categories.forEach(cat => E.importSingleCategory(db, insertCategory, categoryLookup, categoryMap, cat))
    return categoryMap
}

// Import tags with stable identity matching (exact name match)
// Returns map of tagName → id for downstream use
// @sig importTags :: (Database, {lookup, tracker}, [Tag]) -> Map<String, String>
const importTags = (db, tagLookup, tags) => {
    const tagMap = new Map()
    const insertTag = db.prepare(`
        INSERT INTO tags (id, name, color, description)
        VALUES (?, ?, ?, ?)
    `)
    tags.forEach(tag => E.importSingleTag(db, insertTag, tagLookup, tagMap, tag))
    return tagMap
}

// Import securities with stable identity matching (symbol first, then name)
// Returns map of securitySignature → id for downstream use
// @sig importSecurities :: (Database, {lookup, tracker}, [Security]) -> Map<String, String>
const importSecurities = (db, secLookup, securities) => {
    const securityMap = new Map()
    const insertSecurity = db.prepare(`
        INSERT INTO securities (id, name, symbol, type, goal)
        VALUES (?, ?, ?, ?, ?)
    `)
    securities.forEach(sec => E.importSingleSecurity(db, insertSecurity, secLookup, securityMap, sec))
    return securityMap
}

// Import transactions with stable identity matching (count-based pairing for duplicates)
// Also imports splits for each transaction that has them
// @sig importTransactions :: (Database, Map, Map, Map, Map, Map, [Transaction]) -> void
const importTransactions = (db, txnLookup, accountMap, securityMap, splitLookup, categoryMap, transactions) => {
    const insertTransaction = db.prepare(`
        INSERT INTO transactions (
            id, accountId, date, amount, transactionType, payee, memo, number, cleared,
            categoryId, address, runningBalance, securityId, quantity, price, commission, investmentAction
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const ctx = { db, insertStatement: insertTransaction, txnLookup, accountMap, securityMap, splitLookup, categoryMap }
    transactions.forEach(txn => E.importTransactionWithSplitsCtx(ctx, txn))
}

// Import splits for a single transaction with stable identity matching
// Duplicate splits are paired arbitrarily per D4 (fungible pairing)
// @sig importSplits :: (Database, Map, String, Map, [Split]) -> void
const importSplits = (db, splitLookup, transactionId, categoryMap, splits) => {
    const insertSplit = db.prepare(`
        INSERT INTO transactionSplits (id, transactionId, categoryId, amount, memo)
        VALUES (?, ?, ?, ?, ?)
    `)
    splits.forEach(split => E.importSingleSplit(db, insertSplit, splitLookup, transactionId, categoryMap, split))
}

// Import prices with stable identity matching (per D14: securityStableId|date)
// Duplicate prices are paired arbitrarily per D4 (fungible pairing)
// @sig importPrices :: (Database, Map, Map, [Price]) -> void
const importPrices = (db, priceLookup, securityMap, prices) => {
    if (!prices || prices.length === 0) return
    const insertPrice = db.prepare(`
        INSERT INTO prices (id, securityId, date, price)
        VALUES (?, ?, ?, ?)
    `)
    prices.forEach(price => E.importSinglePrice(db, insertPrice, priceLookup, securityMap, price))
}

// Mark unmatched entities as orphaned (those not seen during reimport)
// Per D13: when a transaction is orphaned, its splits are also orphaned
// @sig markOrphanedEntities :: (Database, {accounts, categories, tags, securities, transactions, prices}) -> void
const markOrphanedEntities = (db, lookups) => {
    const { accounts, categories, tags, securities, transactions, prices } = lookups
    const transactionOrphans = Matching.collectUnmatchedIds(transactions)
    const splitOrphans = transactionOrphans.flatMap(txnId => A.findSplitsByTransaction(db, txnId))
    const orphanIds = [
        ...accounts.tracker.getUnseen(),
        ...categories.tracker.getUnseen(),
        ...tags.tracker.getUnseen(),
        ...securities.tracker.getUnseen(),
        ...transactionOrphans,
        ...splitOrphans,
        ...Matching.collectUnmatchedIds(prices),
    ]
    orphanIds.forEach(stableId => StableIdentity.markOrphaned(db, stableId))
}

// Orchestrate full import with stable matching
// Order: clear → build maps → accounts → categories → tags → securities → transactions+splits → prices → mark orphans
// @sig processImport :: (Database, {accounts, categories, tags, securities, transactions, prices}, Function?) -> void
const processImport = (db, data, onProgress) => {
    db.pragma('synchronous = OFF')
    db.pragma('journal_mode = WAL')
    const lookups = buildLookupMaps(db)
    const importFns = { accounts: importAccounts, categories: importCategories, tags: importTags }
    const moreFns = { securities: importSecurities, transactions: importTransactions, prices: importPrices }
    const allFns = { ...importFns, ...moreFns }
    db.transaction(() => E.executeImportWork(db, data, lookups, allFns, markOrphanedEntities, onProgress))()
}

const Import = {
    buildLookupMaps,
    importAccounts,
    importCategories,
    importTags,
    importSecurities,
    importTransactions,
    importSplits,
    importPrices,
    markOrphanedEntities,
    processImport,
}

export { Import }
