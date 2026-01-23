// ABOUTME: Import orchestration for QIF data with stable identity matching
// ABOUTME: Coordinates account/security/transaction import and orphan detection

import { CategoryResolver } from './category-resolver.js'
import { ImportLots } from './import-lots.js'
import { Matching } from './Matching.js'
import { PlaceholderCreator } from './placeholder-creator.js'
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
    // Check if category string is a special marker that should not resolve to categoryId
    // Includes _RlzdGain, _UnrlzdGain (Quicken internal markers), --Split--, and CGLong/CGShort/CGMid
    // @sig isSpecialMarker :: String|null -> Boolean
    isSpecialMarker: cat =>
        cat?.startsWith('_RlzdGain') ||
        cat?.startsWith('_UnrlzdGain') ||
        CategoryResolver.P.isSplitMarker(cat) ||
        CategoryResolver.P.isGainMarker(cat),

    // Check if QIF transaction type is a bank type (vs investment)
    // @sig isBankTransactionType :: String -> Boolean
    isBankTransactionType: type => BANK_TRANSACTION_TYPES.has(type),
}

const T = {
    // Time and report an import step, returning the result
    // @sig toTimedResult :: (Function, String, () -> a) -> a
    toTimedResult: (report, label, fn) => {
        const start = performance.now()
        const result = fn()
        const elapsed = (performance.now() - start).toFixed(0)
        report(`${label} (${elapsed}ms)`)
        return result
    },

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
    // Uses CategoryResolver for transfer detection, filters special markers
    // @sig toBaseCategoryName :: String|null -> String|null
    toBaseCategoryName: cat => {
        if (!cat || CategoryResolver.P.isTransfer(cat) || P.isSpecialMarker(cat)) return null
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

    // Resolve category string to categoryId, transferAccountId, and gainMarkerType
    // @sig resolveCategoryFields :: (String|null, Map, Map) -> {categoryId, transferAccountId, gainMarkerType}
    resolveCategoryFields: (category, categoryMap, accountMap) => {
        const { transferAccountName, gainMarkerType } = CategoryResolver.F.resolveCategory(category)
        const baseCategoryName = T.toBaseCategoryName(category)
        const categoryId = baseCategoryName ? (categoryMap.get(baseCategoryName) ?? null) : null
        const transferAccountId = transferAccountName ? (accountMap.get(transferAccountName) ?? null) : null
        return { categoryId, transferAccountId, gainMarkerType }
    },
}

const F = {
    // Create a change tracker to aggregate import statistics
    // Tracks counts by entity type (Account, Category, Transaction, etc.)
    // @sig createChangeTracker :: () -> {record, getCounts, getChanges}
    createChangeTracker: () => {
        const counts = { created: 0, modified: 0, orphaned: 0, restored: 0 }
        const changes = []
        return {
            record: (entityType, entityId, changeType) => {
                counts[changeType]++
                changes.push({ entityType, entityId, changeType })
            },
            getCounts: () => counts,
            getChanges: () => changes,
        }
    },
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
    // Restore an orphaned entity and record the change
    // @sig restoreOrphanedEntity :: (Database, String, String, ChangeTracker, Boolean|String) -> void
    restoreOrphanedEntity: (db, entityType, id, changeTracker, orphanedAt) => {
        if (!orphanedAt) return
        StableIdentity.restoreEntity(db, id)
        changeTracker.record(entityType, id, 'restored')
    },

    // Delegate transaction import to importFns with context object
    // @sig doImportTransactions :: (Object, ImportFns) -> void
    doImportTransactions: (ctx, fns) => {
        const { db, txnLookup, accountMap, securityMap, splitLookup, categoryMap, transactions, changeTracker } = ctx
        fns.transactions(db, txnLookup, accountMap, securityMap, splitLookup, categoryMap, transactions, changeTracker)
    },

    // Record orphan change and mark entity as orphaned in both stableIdentities and data table
    // @sig recordAndMarkOrphaned :: (Database, ChangeTracker, String, String) -> void
    recordAndMarkOrphaned: (db, changeTracker, entityType, id) => {
        changeTracker.record(entityType, id, 'orphaned')
        StableIdentity.markOrphaned(db, id)
        E.markOrphanedInTable(db, entityType, id)
    },

    // Set orphanedAt in the data table for an entity
    // @sig markOrphanedInTable :: (Database, String, String) -> void
    markOrphanedInTable: (db, entityType, id) => {
        const tableMap = {
            Account: 'accounts',
            Category: 'categories',
            Tag: 'tags',
            Security: 'securities',
            Transaction: 'transactions',
            Split: 'transactionSplits',
            Price: 'prices',
        }
        const table = tableMap[entityType]
        if (table) db.prepare(`UPDATE ${table} SET orphanedAt = datetime('now') WHERE id = ?`).run(id)
    },

    // Execute the import work within a transaction
    // Handles both combined (transactions) and separate (bankTransactions/investmentTransactions) formats
    // @sig executeImportWork :: (Database, Object, Object, Object, Object, ChangeTracker, Function?) -> void
    executeImportWork: (db, data, lookups, importFns, markOrphanFn, changeTracker, onProgress) => {
        const { accounts, categories, tags, securities, prices, bankTransactions, investmentTransactions } = data
        const report = onProgress || (() => {})

        // Support both parser format (separate arrays) and combined format
        const transactions = data.transactions || [...(bankTransactions || []), ...(investmentTransactions || [])]
        const { accounts: accLookup, categories: catLookup, tags: tagLookup } = lookups
        const { securities: secLookup, transactions: txnLookup, splits: splitLookup, prices: priceLookup } = lookups

        T.toTimedResult(report, 'Clearing derived tables', () => E.clearDerivedTables(db))

        const accountMap = T.toTimedResult(report, `Importing ${accounts?.length || 0} accounts`, () =>
            importFns.accounts(db, accLookup, accounts, changeTracker),
        )

        const categoryMap = T.toTimedResult(report, `Importing ${categories?.length || 0} categories`, () =>
            importFns.categories(db, catLookup, categories, changeTracker),
        )

        T.toTimedResult(report, `Importing ${tags?.length || 0} tags`, () =>
            importFns.tags(db, tagLookup, tags, changeTracker),
        )

        const securityMap = T.toTimedResult(report, `Importing ${securities?.length || 0} securities`, () =>
            importFns.securities(db, secLookup, securities, changeTracker),
        )

        const txnCtx = { db, txnLookup, accountMap, securityMap, splitLookup, categoryMap, transactions, changeTracker }
        T.toTimedResult(report, `Importing ${transactions.length} transactions`, () =>
            E.doImportTransactions(txnCtx, importFns),
        )

        T.toTimedResult(report, `Importing ${prices?.length || 0} prices`, () =>
            importFns.prices(db, priceLookup, securityMap, prices, changeTracker),
        )

        T.toTimedResult(report, 'Computing running balances', () => E.updateRunningBalances(db))

        T.toTimedResult(report, 'Computing lots', () => ImportLots.importLots(db, T.toLotContext(db)))

        T.toTimedResult(report, 'Creating placeholders for missing references', () =>
            PlaceholderCreator.createPlaceholders(db, changeTracker),
        )

        const orphanLookups = { accounts: accLookup, categories: catLookup, tags: tagLookup }
        const moreOrphanLookups = { securities: secLookup, transactions: txnLookup, prices: priceLookup }
        T.toTimedResult(report, 'Marking orphans', () =>
            markOrphanFn(db, { ...orphanLookups, ...moreOrphanLookups }, changeTracker),
        )
        report('Done!')
    },

    // Import or match a single account, updating accountMap with id
    // Handles restore of previously orphaned accounts, records changes to tracker
    // @sig importSingleAccount :: (Database, Statement, {lookup, tracker}, Map, Account, ChangeTracker) -> void
    importSingleAccount: (db, insertStatement, { lookup, tracker }, accountMap, account, changeTracker) => {
        const { name, type, description, creditLimit } = account
        const existing = lookup.get(name)
        if (existing) {
            const { id, orphanedAt } = existing
            tracker.markSeen(id)
            insertStatement.run(id, name, type, description, creditLimit)
            E.restoreOrphanedEntity(db, 'Account', id, changeTracker, orphanedAt)
            accountMap.set(name, id)
            return
        }

        const id = StableIdentity.createStableId(db, 'Account')
        insertStatement.run(id, name, type, description, creditLimit)
        StableIdentity.insertStableIdentity(db, { id, entityType: 'Account', signature: name })
        accountMap.set(name, id)
        changeTracker.record('Account', id, 'created')
    },

    // Import or match a single category, updating categoryMap with id
    // Handles restore of previously orphaned categories, records changes to tracker
    // @sig importSingleCategory :: (Database, Statement, {lookup, tracker}, Map, Category, ChangeTracker) -> void
    importSingleCategory: (db, insertStatement, { lookup, tracker }, categoryMap, category, changeTracker) => {
        const { name, description, budgetAmount, isIncomeCategory, isTaxRelated, taxSchedule } = category
        const isIncome = T.toBoolInt(isIncomeCategory)
        const isTax = T.toBoolInt(isTaxRelated)
        const existing = lookup.get(name)
        if (existing) {
            const { id, orphanedAt } = existing
            tracker.markSeen(id)
            insertStatement.run(id, name, description, budgetAmount, isIncome, isTax, taxSchedule)
            E.restoreOrphanedEntity(db, 'Category', id, changeTracker, orphanedAt)
            categoryMap.set(name, id)
            return
        }

        const id = StableIdentity.createStableId(db, 'Category')
        insertStatement.run(id, name, description, budgetAmount, isIncome, isTax, taxSchedule)
        StableIdentity.insertStableIdentity(db, { id, entityType: 'Category', signature: name })
        categoryMap.set(name, id)
        changeTracker.record('Category', id, 'created')
    },

    // Import or match a single tag, updating tagMap with id
    // Handles restore of previously orphaned tags, records changes to tracker
    // @sig importSingleTag :: (Database, Statement, {lookup, tracker}, Map, Tag, ChangeTracker) -> void
    importSingleTag: (db, insertStatement, { lookup, tracker }, tagMap, tag, changeTracker) => {
        const { name, color, description } = tag
        const existing = lookup.get(name)
        if (existing) {
            const { id, orphanedAt } = existing
            tracker.markSeen(id)
            insertStatement.run(id, name, color, description)
            E.restoreOrphanedEntity(db, 'Tag', id, changeTracker, orphanedAt)
            tagMap.set(name, id)
            return
        }

        const id = StableIdentity.createStableId(db, 'Tag')
        insertStatement.run(id, name, color, description)
        StableIdentity.insertStableIdentity(db, { id, entityType: 'Tag', signature: name })
        tagMap.set(name, id)
        changeTracker.record('Tag', id, 'created')
    },

    // Store security in map by both name and symbol for lookup by either
    // @sig storeSecurityInMap :: (Map, String, String|null, String) -> void
    storeSecurityInMap: (securityMap, name, symbol, id) => {
        symbol && securityMap.set(symbol, id)
        securityMap.set(name, id)
    },

    // Import or match a single security, updating securityMap with id
    // Stores by BOTH name and symbol so transaction lookup by either works
    // Handles restore of previously orphaned securities, records changes to tracker
    // @sig importSingleSecurity :: (Database, Statement, {lookup, tracker}, Map, Security, ChangeTracker) -> void
    importSingleSecurity: (db, insertStatement, { lookup, tracker }, securityMap, security, changeTracker) => {
        const { name, symbol, type, goal } = security
        const signature = SigT.securitySignature(security)
        const existing = Matching.findSecurityMatch(lookup, security)
        if (existing) {
            const { id, orphanedAt } = existing
            tracker.markSeen(id)
            insertStatement.run(id, name, symbol, type, goal)
            E.restoreOrphanedEntity(db, 'Security', id, changeTracker, orphanedAt)
            E.storeSecurityInMap(securityMap, name, symbol, id)
            return
        }

        const id = StableIdentity.createStableId(db, 'Security')
        insertStatement.run(id, name, symbol, type, goal)
        StableIdentity.insertStableIdentity(db, { id, entityType: 'Security', signature })
        E.storeSecurityInMap(securityMap, name, symbol, id)
        changeTracker.record('Security', id, 'created')
    },

    // Import or match a single split, returning id, records changes to tracker
    // Handles transfers in splits (e.g., "[Checking]" in category)
    // @sig importSingleSplit :: (Database, Statement, Map, String, Map, Map, Split, ChangeTracker) -> {id, isNew}
    importSingleSplit: (db, stmt, splitLookup, transactionId, categoryMap, accountMap, split, changeTracker) => {
        const { categoryName, amount, memo } = split
        const resolved = T.resolveCategoryFields(categoryName, categoryMap, accountMap)
        const { categoryId, transferAccountId } = resolved

        const signature = SigT.splitSignature(split, transactionId, categoryId)
        const existing = Matching.findTransactionMatch(splitLookup, signature)
        if (existing) {
            const { id, orphanedAt } = existing
            stmt.run(id, transactionId, categoryId, transferAccountId, amount, memo)
            E.restoreOrphanedEntity(db, 'Split', id, changeTracker, orphanedAt)
            return { id, isNew: false }
        }

        const id = StableIdentity.createStableId(db, 'Split')
        stmt.run(id, transactionId, categoryId, transferAccountId, amount, memo)
        StableIdentity.insertStableIdentity(db, { id, entityType: 'Split', signature })
        changeTracker.record('Split', id, 'created')
        return { id, isNew: true }
    },

    // Import or match a single transaction, returning id for split processing
    // Handles both parser format (account, security, transactionType) and legacy format (accountName, etc.)
    // Resolves category string to categoryId, transferAccountId, and gainMarkerType
    // @sig importSingleTransaction :: (Db, {insert, update}, Map, Map, Map, Map, Txn, ChangeTracker) -> {id, isNew}
    importSingleTransaction: (db, statements, txnLookup, accountMap, securityMap, categoryMap, txn, changeTracker) => {
        // prettier-ignore
        const { account, accountName: legacyAccountName, security, securitySignature, date, amount, transactionType,
            payee, memo, number, cleared, category, categoryId: preResolvedCategoryId, address, runningBalance,
            quantity, price, commission } = txn

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

        // Resolve category: use pre-resolved categoryId if available, otherwise resolve from category string
        const resolved = T.resolveCategoryFields(category, categoryMap, accountMap)
        const categoryId = preResolvedCategoryId ?? resolved.categoryId
        const { transferAccountId, gainMarkerType } = resolved

        // Bank transactions require amount; default to 0 for opening balance entries missing T/U line
        const normalizedAmount = isBankType && amount == null ? 0 : amount

        // Common values for both INSERT and UPDATE (field order matches statement definitions)
        const values = [
            accountId,
            dateString,
            normalizedAmount,
            schemaTransactionType,
            payee,
            memo,
            number,
            cleared,
            categoryId,
            transferAccountId,
            gainMarkerType,
            addressString,
            runningBalance,
            securityId,
            quantity,
            price,
            commission,
            investmentAction,
        ]

        const signature = T.computeTransactionSignature(txn, accountId, securityId)
        const existing = Matching.findTransactionMatch(txnLookup, signature)
        if (existing) {
            const { id, orphanedAt } = existing
            statements.update.run(...values, id) // UPDATE: id at end (WHERE id = ?)
            E.restoreOrphanedEntity(db, 'Transaction', id, changeTracker, orphanedAt)
            return { id, isNew: false }
        }

        const id = StableIdentity.createStableId(db, 'Transaction')
        statements.insert.run(id, ...values) // INSERT: id at start
        StableIdentity.insertStableIdentity(db, { id, entityType: 'Transaction', signature })
        changeTracker.record('Transaction', id, 'created')
        return { id, isNew: true }
    },

    // Import a transaction with its splits using context object
    // @sig importTransactionWithSplitsCtx :: (TransactionContext, Transaction) -> void
    importTransactionWithSplitsCtx: (ctx, txn) => {
        const { db, statements, txnLookup, accountMap, securityMap, splitLookup, categoryMap, changeTracker } = ctx
        const result = E.importSingleTransaction(
            db,
            statements,
            txnLookup,
            accountMap,
            securityMap,
            categoryMap,
            txn,
            changeTracker,
        )
        if (txn.splits?.length > 0)
            importSplits(db, splitLookup, result.id, categoryMap, accountMap, txn.splits, changeTracker)
    },

    // Import or match a single price, records changes to tracker
    // @sig importSinglePrice :: (Database, {insert, update}, Map, Map, Price, ChangeTracker) -> {id, isNew}
    importSinglePrice: (db, statements, priceLookup, securityMap, price, changeTracker) => {
        const { date, price: priceValue } = price
        const securityKey = SigT.securitySignature(price)
        const securityId = securityMap.get(securityKey)
        if (!securityId) return null

        const dateString = T.toDateString(date)
        const signature = SigT.priceSignature(securityId, dateString)
        const existing = Matching.findTransactionMatch(priceLookup, signature)
        if (existing) {
            const { id, orphanedAt } = existing
            statements.update.run(priceValue, id)
            E.restoreOrphanedEntity(db, 'Price', id, changeTracker, orphanedAt)
            return { id, isNew: false }
        }

        const id = StableIdentity.createStableId(db, 'Price')
        statements.insert.run(id, securityId, dateString, priceValue)
        StableIdentity.insertStableIdentity(db, { id, entityType: 'Price', signature })
        changeTracker.record('Price', id, 'created')
        return { id, isNew: true }
    },

    // Clear derived tables before reimport (lots are fully recomputed from transactions)
    // Base tables use INSERT OR REPLACE for incremental updates
    // @sig clearDerivedTables :: Database -> void
    clearDerivedTables: db =>
        db.exec(`
            DELETE FROM lotAllocations;
            DELETE FROM lots;
        `),

    // Update running balances for all active (non-orphaned) transactions using SQL window function
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
                WHERE orphanedAt IS NULL
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
// @sig importAccounts :: (Database, {lookup, tracker}, [Account], ChangeTracker) -> Map<String, String>
const importAccounts = (db, accountLookup, accounts, changeTracker) => {
    const accountMap = new Map()
    const insertAccount = db.prepare(`
        INSERT OR REPLACE INTO accounts (id, name, type, description, creditLimit, orphanedAt)
        VALUES (?, ?, ?, ?, ?, NULL)
    `)
    accounts.forEach(account =>
        E.importSingleAccount(db, insertAccount, accountLookup, accountMap, account, changeTracker),
    )
    return accountMap
}

// Import categories with stable identity matching (exact name match)
// Returns map of categoryName → id for downstream use
// @sig importCategories :: (Database, {lookup, tracker}, [Category], ChangeTracker) -> Map<String, String>
const importCategories = (db, categoryLookup, categories, changeTracker) => {
    const categoryMap = new Map()
    const insertCategory = db.prepare(`
        INSERT OR REPLACE INTO categories
            (id, name, description, budgetAmount, isIncomeCategory, isTaxRelated, taxSchedule, orphanedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
    `)
    categories.forEach(cat =>
        E.importSingleCategory(db, insertCategory, categoryLookup, categoryMap, cat, changeTracker),
    )
    return categoryMap
}

// Import tags with stable identity matching (exact name match)
// Returns map of tagName → id for downstream use
// @sig importTags :: (Database, {lookup, tracker}, [Tag], ChangeTracker) -> Map<String, String>
const importTags = (db, tagLookup, tags, changeTracker) => {
    const tagMap = new Map()
    const insertTag = db.prepare(`
        INSERT OR REPLACE INTO tags (id, name, color, description, orphanedAt)
        VALUES (?, ?, ?, ?, NULL)
    `)
    tags.forEach(tag => E.importSingleTag(db, insertTag, tagLookup, tagMap, tag, changeTracker))
    return tagMap
}

// Import securities with stable identity matching (symbol first, then name)
// Returns map of securitySignature → id for downstream use
// @sig importSecurities :: (Database, {lookup, tracker}, [Security], ChangeTracker) -> Map<String, String>
const importSecurities = (db, secLookup, securities, changeTracker) => {
    const securityMap = new Map()
    const insertSecurity = db.prepare(`
        INSERT OR REPLACE INTO securities (id, name, symbol, type, goal, orphanedAt)
        VALUES (?, ?, ?, ?, ?, NULL)
    `)
    securities.forEach(sec => E.importSingleSecurity(db, insertSecurity, secLookup, securityMap, sec, changeTracker))
    return securityMap
}

// Import transactions with stable identity matching (count-based pairing for duplicates)
// Also imports splits for each transaction that has them
// @sig importTransactions :: (Database, Map, Map, Map, Map, Map, [Transaction], ChangeTracker) -> void
const importTransactions = (db, txnLookup, accountMap, securityMap, splitLookup, categoryMap, transactions, ct) => {
    const cols = `id, accountId, date, amount, transactionType, payee, memo, number, cleared, categoryId,
        transferAccountId, gainMarkerType, address, runningBalance, securityId, quantity, price, commission,
        investmentAction, orphanedAt`
    const setCols = `accountId=?, date=?, amount=?, transactionType=?, payee=?, memo=?, number=?, cleared=?,
        categoryId=?, transferAccountId=?, gainMarkerType=?, address=?, runningBalance=?, securityId=?, quantity=?,
        price=?, commission=?, investmentAction=?, orphanedAt=NULL`
    const statements = {
        insert: db.prepare(`INSERT INTO transactions (${cols}) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL)`),
        update: db.prepare(`UPDATE transactions SET ${setCols} WHERE id=?`),
    }
    const ctx = { db, statements, txnLookup, accountMap, securityMap, splitLookup, categoryMap }
    const ctxWithTracker = { ...ctx, changeTracker: ct }
    transactions.forEach(txn => E.importTransactionWithSplitsCtx(ctxWithTracker, txn))
}

// Import splits for a single transaction with stable identity matching
// Duplicate splits are paired arbitrarily per D4 (fungible pairing)
// @sig importSplits :: (Database, Map, String, Map, Map, [Split], ChangeTracker) -> void
const importSplits = (db, splitLookup, transactionId, categoryMap, accountMap, splits, changeTracker) => {
    const splitCols = 'id, transactionId, categoryId, transferAccountId, amount, memo, orphanedAt'
    const insertSplit = db.prepare(`
        INSERT OR REPLACE INTO transactionSplits (${splitCols}) VALUES (?, ?, ?, ?, ?, ?, NULL)
    `)
    splits.forEach(split =>
        E.importSingleSplit(db, insertSplit, splitLookup, transactionId, categoryMap, accountMap, split, changeTracker),
    )
}

// Import prices with stable identity matching (per D14: securityStableId|date)
// Duplicate prices are paired arbitrarily per D4 (fungible pairing)
// @sig importPrices :: (Database, Map, Map, [Price], ChangeTracker) -> void
const importPrices = (db, priceLookup, securityMap, prices, changeTracker) => {
    if (!prices || prices.length === 0) return

    // UPDATE only touches price and orphanedAt - securityId/date can't change (they're in the signature)
    // This avoids UNIQUE constraint rechecks on (securityId, date)
    const statements = {
        insert: db.prepare('INSERT INTO prices (id, securityId, date, price, orphanedAt) VALUES (?, ?, ?, ?, NULL)'),
        update: db.prepare('UPDATE prices SET price = ?, orphanedAt = NULL WHERE id = ?'),
    }
    prices.forEach(price => E.importSinglePrice(db, statements, priceLookup, securityMap, price, changeTracker))
}

// Mark unmatched entities as orphaned (those not seen during reimport)
// Per D13: when a transaction is orphaned, its splits are also orphaned
// Records each orphan to changeTracker for reporting
// @sig markOrphanedEntities :: (Database, Object, ChangeTracker) -> void
const markOrphanedEntities = (db, lookups, changeTracker) => {
    const { accounts, categories, tags, securities, transactions, prices } = lookups

    accounts.tracker.getUnseen().forEach(id => E.recordAndMarkOrphaned(db, changeTracker, 'Account', id))
    categories.tracker.getUnseen().forEach(id => E.recordAndMarkOrphaned(db, changeTracker, 'Category', id))
    tags.tracker.getUnseen().forEach(id => E.recordAndMarkOrphaned(db, changeTracker, 'Tag', id))
    securities.tracker.getUnseen().forEach(id => E.recordAndMarkOrphaned(db, changeTracker, 'Security', id))

    const transactionOrphans = Matching.collectUnmatchedIds(transactions)
    transactionOrphans.forEach(id => E.recordAndMarkOrphaned(db, changeTracker, 'Transaction', id))

    const splitOrphans = transactionOrphans.flatMap(txnId => A.findSplitsByTransaction(db, txnId))
    splitOrphans.forEach(id => E.recordAndMarkOrphaned(db, changeTracker, 'Split', id))

    Matching.collectUnmatchedIds(prices).forEach(id => E.recordAndMarkOrphaned(db, changeTracker, 'Price', id))
}

// Orchestrate full import with stable matching
// Order: clear → build maps → accounts → categories → tags → securities → transactions+splits → prices → mark orphans
// Returns { changeCounts, changes } for reporting to caller
// @sig processImport :: (Database, Object, Function?) -> {changeCounts, changes}
const processImport = (db, data, onProgress) => {
    db.pragma('synchronous = OFF')
    db.pragma('journal_mode = WAL')
    const lookups = buildLookupMaps(db)
    const changeTracker = F.createChangeTracker()
    const importFns = { accounts: importAccounts, categories: importCategories, tags: importTags }
    const moreFns = { securities: importSecurities, transactions: importTransactions, prices: importPrices }
    const allFns = { ...importFns, ...moreFns }
    db.transaction(() =>
        E.executeImportWork(db, data, lookups, allFns, markOrphanedEntities, changeTracker, onProgress),
    )()
    return { changeCounts: changeTracker.getCounts(), changes: changeTracker.getChanges() }
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
