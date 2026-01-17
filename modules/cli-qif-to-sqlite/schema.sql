-- =====================================================
-- QIF Database Schema: SQLite Implementation
-- =====================================================
--
-- This schema supports the QIF Database Migration project.
-- Design: Normalized relational schema with base tables for raw QIF data
-- and derived tables for computed financial entities.
--
-- Column names use camelCase to match JavaScript conventions directly.
--

-- =====================================================
-- STABLE IDENTITY TRACKING
-- =====================================================
-- Maps signatures to stable IDs for reimport matching.
-- The stable ID is used directly in base tables (no separate entityId layer).
-- Enables editing QIF files without losing entity identity.

CREATE TABLE stableIdentities (
    id TEXT PRIMARY KEY,                 -- e.g., 'txn_000000000001'
    entityType TEXT NOT NULL,
    signature TEXT NOT NULL,
    orphanedAt TEXT,
    acknowledgedAt TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    lastModifiedAt TEXT
);

CREATE INDEX idx_stableIdentities_entityType_signature ON stableIdentities(entityType, signature);

-- Stable ID generation counters (D23)
-- 12-digit zero-padded IDs like txn_000000000001 (matches web app regex patterns)
CREATE TABLE stableIdCounters (
    entityType TEXT PRIMARY KEY,
    nextId INTEGER DEFAULT 1
);

-- Import history tracking (D18) — last 20 imports retained
CREATE TABLE importHistory (
    importId TEXT PRIMARY KEY,
    importedAt TEXT DEFAULT (datetime('now')),
    qifFileHash TEXT,
    summary TEXT  -- JSON: {created, modified, orphaned, restored}
);

-- Entity changes per import (pruned with importHistory)
CREATE TABLE entityChanges (
    stableId TEXT,
    importId TEXT,
    changeType TEXT CHECK (changeType IN ('created', 'modified', 'orphaned', 'restored')),
    entityType TEXT,
    PRIMARY KEY (stableId, importId)
);

-- User-specified lot assignments (D19) — overrides default FIFO/LIFO
CREATE TABLE lotAssignmentOverrides (
    sellTransactionStableId TEXT,
    openTransactionStableId TEXT,
    quantity REAL,
    PRIMARY KEY (sellTransactionStableId, openTransactionStableId)
);

-- User preferences (default lot strategy, etc.)
CREATE TABLE userPreferences (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- =====================================================
-- BASE TABLES (Raw QIF Data)
-- =====================================================

CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('Bank', 'Cash', 'Credit Card', 'Investment', 'Other Asset', 'Other Liability', '401(k)/403(b)')),
    description TEXT,
    creditLimit DECIMAL(15,2),
    orphanedAt TEXT
);

CREATE TABLE securities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT,
    type TEXT,
    goal TEXT,
    orphanedAt TEXT,
    UNIQUE(name, symbol)
);

CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    budgetAmount DECIMAL(15,2),
    isIncomeCategory BOOLEAN,
    isTaxRelated BOOLEAN,
    taxSchedule TEXT,
    orphanedAt TEXT
);

CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    description TEXT,
    orphanedAt TEXT
);

CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    accountId TEXT REFERENCES accounts(id),
    date DATE NOT NULL,
    amount DECIMAL(15,2),
    transactionType TEXT CHECK (transactionType IN ('bank', 'investment')),
    payee TEXT,
    memo TEXT,
    number TEXT,
    cleared TEXT,
    categoryId TEXT REFERENCES categories(id),
    address TEXT,

    -- Transfer and gain marker resolution
    transferAccountId TEXT REFERENCES accounts(id),
    gainMarkerType TEXT CHECK (gainMarkerType IN ('CGLong', 'CGShort', 'CGMid')),

    -- Computed balance
    runningBalance DECIMAL(15,2),

    -- Investment-specific fields
    securityId TEXT REFERENCES securities(id),
    quantity DECIMAL(15,6),
    price DECIMAL(15,2),
    commission DECIMAL(15,2),
    investmentAction TEXT CHECK (investmentAction IN (
        'Buy', 'BuyX', 'Cash', 'CGLong', 'CGShort', 'ContribX', 'CvrShrt', 'Div', 'DivX', 'Exercise', 'Expire', 'Grant',
        'IntInc', 'MargInt', 'MiscExp', 'MiscInc', 'MiscIncX', 'ReinvDiv', 'ReinvInt', 'ReinvLg', 'ReinvMd', 'ReinvSh',
        'Reminder', 'RtrnCapX', 'Sell', 'SellX', 'ShrsIn', 'ShrsOut', 'ShtSell', 'StkSplit', 'Vest', 'WithdrwX',
        'XIn', 'XOut'
    )),
    orphanedAt TEXT
);

CREATE TABLE transactionSplits (
    id TEXT PRIMARY KEY,
    transactionId TEXT REFERENCES transactions(id),
    categoryId TEXT REFERENCES categories(id),
    transferAccountId TEXT REFERENCES accounts(id),
    amount DECIMAL(15,2),
    memo TEXT,
    orphanedAt TEXT
);

CREATE TABLE prices (
    id TEXT PRIMARY KEY,
    securityId TEXT REFERENCES securities(id),
    date DATE NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    orphanedAt TEXT,
    UNIQUE(securityId, date)
);

-- =====================================================
-- DERIVED TABLES (Computed Financial Data)
-- =====================================================

-- Individual purchase lots for FIFO cost basis tracking
CREATE TABLE lots (
    id TEXT PRIMARY KEY,
    accountId TEXT REFERENCES accounts(id),
    securityId TEXT REFERENCES securities(id),
    purchaseDate DATE NOT NULL,
    quantity DECIMAL(15,6) NOT NULL,
    costBasis DECIMAL(15,2) NOT NULL,
    remainingQuantity DECIMAL(15,6) NOT NULL,
    closedDate DATE, -- NULL = open, non-NULL = closed
    createdByTransactionId TEXT REFERENCES transactions(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure remainingQuantity doesn't exceed original quantity (in magnitude)
    CHECK (ABS(remainingQuantity) <= ABS(quantity))
);

-- Lot allocations for FIFO tracking: records each time shares are taken from a lot
-- Used to compute historical lot state at any point in time
CREATE TABLE lotAllocations (
    id TEXT PRIMARY KEY,
    lotId TEXT NOT NULL REFERENCES lots(id),
    transactionId TEXT NOT NULL REFERENCES transactions(id),
    sharesAllocated DECIMAL(15,6) NOT NULL,
    costBasisAllocated DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL
);

-- =====================================================
-- PERFORMANCE INDICES FOR LARGE DATASETS
-- =====================================================

-- Base table indices for common query patterns
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_accountId_date ON transactions(accountId, date);
CREATE INDEX idx_transactions_securityId_date ON transactions(securityId, date);
CREATE INDEX idx_transactionSplits_transactionId ON transactionSplits(transactionId);

-- Indices for filtering active (non-orphaned) entities
CREATE INDEX idx_accounts_active ON accounts(orphanedAt) WHERE orphanedAt IS NULL;
CREATE INDEX idx_securities_active ON securities(orphanedAt) WHERE orphanedAt IS NULL;
CREATE INDEX idx_categories_active ON categories(orphanedAt) WHERE orphanedAt IS NULL;
CREATE INDEX idx_tags_active ON tags(orphanedAt) WHERE orphanedAt IS NULL;
CREATE INDEX idx_transactions_active ON transactions(orphanedAt) WHERE orphanedAt IS NULL;
CREATE INDEX idx_transactionSplits_active ON transactionSplits(orphanedAt) WHERE orphanedAt IS NULL;
CREATE INDEX idx_prices_active ON prices(orphanedAt) WHERE orphanedAt IS NULL;

-- Critical indexes for prices table (hundreds of thousands of rows)
CREATE INDEX idx_prices_securityId_date ON prices(securityId, date);
CREATE INDEX idx_prices_date_securityId ON prices(date, securityId);
CREATE INDEX idx_prices_securityId_date_desc ON prices(securityId, date DESC);

-- Derived table indices for portfolio analysis
CREATE INDEX idx_lots_accountId_securityId ON lots(accountId, securityId);
CREATE INDEX idx_lots_securityId_purchaseDate ON lots(securityId, purchaseDate);
CREATE INDEX idx_lots_open ON lots(closedDate) WHERE closedDate IS NULL;
CREATE INDEX idx_lots_accountId_open ON lots(accountId, closedDate) WHERE closedDate IS NULL;

-- Lot allocation indices for historical queries
CREATE INDEX idx_lotAllocations_lotId ON lotAllocations(lotId);
CREATE INDEX idx_lotAllocations_date ON lotAllocations(date);
CREATE INDEX idx_lotAllocations_lotId_date ON lotAllocations(lotId, date);

-- =====================================================
-- DATA VALIDATION CONSTRAINTS
-- =====================================================

-- Ensure investment transactions have required fields
CREATE TRIGGER validateInvestmentTransaction
BEFORE INSERT ON transactions
WHEN NEW.transactionType = 'investment'
BEGIN
    SELECT CASE
        WHEN NEW.investmentAction IS NULL THEN
            RAISE(ABORT, 'Investment transactions must have investmentAction')
    END;
END;
