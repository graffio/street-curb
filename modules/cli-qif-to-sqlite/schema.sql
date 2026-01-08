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
-- BASE TABLES (Raw QIF Data)
-- =====================================================

CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('Bank', 'Cash', 'Credit Card', 'Investment', 'Other Asset', 'Other Liability', '401(k)/403(b)')),
    description TEXT,
    creditLimit DECIMAL(15,2)
);

CREATE TABLE securities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT,
    type TEXT,
    goal TEXT,
    UNIQUE(name, symbol)
);

CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    budgetAmount DECIMAL(15,2),
    isIncomeCategory BOOLEAN,
    isTaxRelated BOOLEAN,
    taxSchedule TEXT
);

CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    description TEXT
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
    ))
);

CREATE TABLE transactionSplits (
    id TEXT PRIMARY KEY,
    transactionId TEXT REFERENCES transactions(id),
    categoryId TEXT REFERENCES categories(id),
    amount DECIMAL(15,2),
    memo TEXT
);

CREATE TABLE prices (
    id TEXT PRIMARY KEY,
    securityId TEXT REFERENCES securities(id),
    date DATE NOT NULL,
    price DECIMAL(15,2) NOT NULL,
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
-- USEFUL VIEWS FOR COMMON QUERIES
-- =====================================================

-- Current holdings computed from open lots
CREATE VIEW currentHoldings AS
SELECT
    l.accountId,
    l.securityId,
    SUM(l.remainingQuantity) as quantity,
    SUM(l.costBasis) as costBasis,
    SUM(l.costBasis) / SUM(l.remainingQuantity) as avgCostPerShare,
    MAX(l.createdAt) as lastUpdated
FROM lots l
WHERE l.closedDate IS NULL
GROUP BY l.accountId, l.securityId
HAVING SUM(l.remainingQuantity) != 0;

-- Current holdings with latest prices and market values
CREATE VIEW currentHoldingsWithPrices AS
SELECT
    h.*,
    s.name as securityName,
    s.symbol as securitySymbol,
    a.name as accountName,
    p.price as currentPrice,
    (h.quantity * p.price) as currentMarketValue,
    ((h.quantity * p.price) - h.costBasis) as unrealizedGainLoss
FROM currentHoldings h
JOIN securities s ON h.securityId = s.id
JOIN accounts a ON h.accountId = a.id
LEFT JOIN (
    SELECT securityId, price,
           ROW_NUMBER() OVER (PARTITION BY securityId ORDER BY date DESC) as rn
    FROM prices
) p ON h.securityId = p.securityId AND p.rn = 1;

-- Transaction history with account and security names
CREATE VIEW transactionDetails AS
SELECT
    t.*,
    a.name as accountName,
    s.name as securityName,
    s.symbol as securitySymbol,
    c.name as categoryName
FROM transactions t
JOIN accounts a ON t.accountId = a.id
LEFT JOIN securities s ON t.securityId = s.id
LEFT JOIN categories c ON t.categoryId = c.id;

-- =====================================================
-- COMPUTED DAILY PORTFOLIOS VIEW
-- =====================================================
-- Real-time portfolio calculations without storage overhead
-- Optimized for performance with large datasets

CREATE VIEW dailyPortfolios AS
WITH
    -- Get all unique account/date combinations from transactions
    portfolioDates AS (
        SELECT DISTINCT accountId, date
        FROM transactions
        ORDER BY accountId, date
    ),

    -- Calculate cash balance for each account/date
    cashBalances AS (
        SELECT
            t1.accountId,
            t1.date,
            COALESCE(SUM(t2.amount), 0) as cashBalance
        FROM portfolioDates t1
        LEFT JOIN transactions t2 ON t1.accountId = t2.accountId AND t2.date <= t1.date
        GROUP BY t1.accountId, t1.date
    ),

    -- Calculate market value for each account/date using correct price lookup
    marketValues AS (
        SELECT
            pd.accountId,
            pd.date,
            COALESCE(SUM(
                CASE
                    WHEN l.closedDate IS NULL AND ABS(l.remainingQuantity) > 1e-6
                    THEN l.remainingQuantity * COALESCE(
                        (
                            SELECT p1.price
                            FROM prices p1
                            WHERE p1.securityId = l.securityId AND p1.date <= pd.date
                            ORDER BY p1.date DESC
                            LIMIT 1
                        ), 0)
                    ELSE 0
                END
            ), 0) as totalMarketValue
        FROM portfolioDates pd
        LEFT JOIN lots l ON pd.accountId = l.accountId
        GROUP BY pd.accountId, pd.date
    ),

    -- Calculate cost basis for each account/date
    costBases AS (
        SELECT
            pd.accountId,
            pd.date,
            COALESCE(SUM(l.costBasis), 0) as totalCostBasis
        FROM portfolioDates pd
        LEFT JOIN lots l ON pd.accountId = l.accountId AND l.closedDate IS NULL AND l.remainingQuantity != 0
        GROUP BY pd.accountId, pd.date
    )

SELECT
    cb.accountId,
    cb.date,
    cb.cashBalance,
    (cb.cashBalance + mv.totalMarketValue) as totalMarketValue,
    cst.totalCostBasis,
    (mv.totalMarketValue - cst.totalCostBasis) as unrealizedGainLoss
FROM cashBalances cb
JOIN marketValues mv ON cb.accountId = mv.accountId AND cb.date = mv.date
JOIN costBases cst ON cb.accountId = cst.accountId AND cb.date = cst.date;

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
