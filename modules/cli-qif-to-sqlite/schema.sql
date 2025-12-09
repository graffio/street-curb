-- =====================================================
-- QIF Database Schema: SQLite Implementation
-- =====================================================
-- 
-- This schema supports the QIF Database Migration project.
-- Design: Normalized relational schema with base tables for raw QIF data
-- and derived tables for computed financial entities.
--
-- Base Tables: Store raw QIF Entry objects in normalized form
-- Derived Tables: Store computed data (lots, holdings, portfolios) for performance
--

-- =====================================================
-- BASE TABLES (Raw QIF Data)
-- =====================================================

CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('Bank', 'Cash', 'Credit Card', 'Investment', 'Other Asset', 'Other Liability', '401(k)/403(b)')),
    description TEXT,
    credit_limit DECIMAL(15,2)
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
    budget_amount DECIMAL(15,2),
    is_income_category BOOLEAN,
    is_tax_related BOOLEAN,
    tax_schedule TEXT
);

CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    description TEXT
);

CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id),
    date DATE NOT NULL,
    amount DECIMAL(15,2),
    transaction_type TEXT CHECK (transaction_type IN ('bank', 'investment')),
    payee TEXT,
    memo TEXT,
    number TEXT,
    cleared TEXT,
    category_id TEXT REFERENCES categories(id),
    address TEXT,

    -- Investment-specific fields
    security_id TEXT REFERENCES securities(id),
    quantity DECIMAL(15,6),
    price DECIMAL(15,2),
    commission DECIMAL(15,2),
    investment_action TEXT CHECK (investment_action IN (
        'Buy', 'BuyX', 'Cash', 'CGLong', 'CGShort', 'ContribX', 'CvrShrt', 'Div', 'DivX', 'Exercise', 'Expire', 'Grant',
        'IntInc', 'MargInt', 'MiscExp', 'MiscInc', 'MiscIncX', 'ReinvDiv', 'ReinvInt', 'ReinvLg', 'ReinvMd', 'ReinvSh',
        'Reminder', 'RtrnCapX', 'Sell', 'SellX', 'ShrsIn', 'ShrsOut', 'ShtSell', 'StkSplit', 'Vest', 'WithdrwX',
        'XIn', 'XOut'
    ))
);

CREATE TABLE transaction_splits (
    id TEXT PRIMARY KEY,
    transaction_id TEXT REFERENCES transactions(id),
    category_id TEXT REFERENCES categories(id),
    amount DECIMAL(15,2),
    memo TEXT
);

CREATE TABLE prices (
    id TEXT PRIMARY KEY,
    security_id TEXT REFERENCES securities(id),
    date DATE NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    UNIQUE(security_id, date)
);

-- =====================================================
-- DERIVED TABLES (Computed Financial Data)
-- =====================================================

-- Individual purchase lots for FIFO cost basis tracking
CREATE TABLE lots (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id),
    security_id TEXT REFERENCES securities(id),
    purchase_date DATE NOT NULL,
    quantity DECIMAL(15,6) NOT NULL,
    cost_basis DECIMAL(15,2) NOT NULL,
    remaining_quantity DECIMAL(15,6) NOT NULL,
    closed_date DATE, -- NULL = open, non-NULL = closed
    created_by_transaction_id TEXT REFERENCES transactions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure remaining_quantity doesn't exceed original quantity (in magnitude)
    CHECK (ABS(remaining_quantity) <= ABS(quantity))
);

-- =====================================================
-- PERFORMANCE INDICES FOR LARGE DATASETS
-- =====================================================

-- Base table indices for common query patterns
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_account_date ON transactions(account_id, date);
CREATE INDEX idx_transactions_security_date ON transactions(security_id, date);
CREATE INDEX idx_transaction_splits_transaction ON transaction_splits(transaction_id);

-- Critical indexes for prices table (hundreds of thousands of rows)
CREATE INDEX idx_prices_security_date ON prices(security_id, date);
CREATE INDEX idx_prices_date_security ON prices(date, security_id);
CREATE INDEX idx_prices_security_date_desc ON prices(security_id, date DESC);

-- Derived table indices for portfolio analysis
CREATE INDEX idx_lots_account_security ON lots(account_id, security_id);
CREATE INDEX idx_lots_security_date ON lots(security_id, purchase_date);
CREATE INDEX idx_lots_open ON lots(closed_date) WHERE closed_date IS NULL;
CREATE INDEX idx_lots_account_open ON lots(account_id, closed_date) WHERE closed_date IS NULL;

-- =====================================================
-- USEFUL VIEWS FOR COMMON QUERIES
-- =====================================================

-- Current holdings computed from open lots
CREATE VIEW current_holdings AS
SELECT
    l.account_id,
    l.security_id,
    SUM(l.remaining_quantity) as quantity,
    SUM(l.cost_basis) as cost_basis,
    SUM(l.cost_basis) / SUM(l.remaining_quantity) as avg_cost_per_share,
    MAX(l.created_at) as last_updated
FROM lots l
WHERE l.closed_date IS NULL
GROUP BY l.account_id, l.security_id
HAVING SUM(l.remaining_quantity) != 0;

-- Current holdings with latest prices and market values
CREATE VIEW current_holdings_with_prices AS
SELECT 
    h.*,
    s.name as security_name,
    s.symbol as security_symbol,
    a.name as account_name,
    p.price as current_price,
    (h.quantity * p.price) as current_market_value,
    ((h.quantity * p.price) - h.cost_basis) as unrealized_gain_loss
FROM current_holdings h
JOIN securities s ON h.security_id = s.id
JOIN accounts a ON h.account_id = a.id
LEFT JOIN (
    SELECT security_id, price, 
           ROW_NUMBER() OVER (PARTITION BY security_id ORDER BY date DESC) as rn
    FROM prices
) p ON h.security_id = p.security_id AND p.rn = 1;

-- Transaction history with account and security names
CREATE VIEW transaction_details AS
SELECT 
    t.*,
    a.name as account_name,
    s.name as security_name,
    s.symbol as security_symbol,
    c.name as category_name
FROM transactions t
JOIN accounts a ON t.account_id = a.id
LEFT JOIN securities s ON t.security_id = s.id
LEFT JOIN categories c ON t.category_id = c.id;

-- =====================================================
-- COMPUTED DAILY PORTFOLIOS VIEW
-- =====================================================
-- Real-time portfolio calculations without storage overhead
-- Optimized for performance with large datasets

CREATE VIEW daily_portfolios AS
WITH
    -- Get all unique account/date combinations from transactions
    portfolio_dates AS (
        SELECT DISTINCT account_id, date
        FROM transactions
        ORDER BY account_id, date
    ),

    -- Calculate cash balance for each account/date
    cash_balances AS (
        SELECT
            t1.account_id,
            t1.date,
            COALESCE(SUM(t2.amount), 0) as cash_balance
        FROM portfolio_dates t1
        LEFT JOIN transactions t2 ON t1.account_id = t2.account_id AND t2.date <= t1.date
        GROUP BY t1.account_id, t1.date
    ),

    -- Calculate market value for each account/date using correct price lookup
    market_values AS (
        SELECT
            pd.account_id,
            pd.date,
            COALESCE(SUM(
                CASE
                    WHEN l.closed_date IS NULL AND ABS(l.remaining_quantity) > 1e-6
                    THEN l.remaining_quantity * COALESCE(
                        (
                            SELECT p1.price
                            FROM prices p1
                            WHERE p1.security_id = l.security_id AND p1.date <= pd.date
                            ORDER BY p1.date DESC
                            LIMIT 1
                        ), 0)
                    ELSE 0
                END
            ), 0) as total_market_value
        FROM portfolio_dates pd
        LEFT JOIN lots l ON pd.account_id = l.account_id
        GROUP BY pd.account_id, pd.date
    ),

    -- Calculate cost basis for each account/date
    cost_bases AS (
        SELECT
            pd.account_id,
            pd.date,
            COALESCE(SUM(l.cost_basis), 0) as total_cost_basis
        FROM portfolio_dates pd
        LEFT JOIN lots l ON pd.account_id = l.account_id AND l.closed_date IS NULL AND l.remaining_quantity != 0
        GROUP BY pd.account_id, pd.date
    )

SELECT
    cb.account_id,
    cb.date,
    cb.cash_balance,
    (cb.cash_balance + mv.total_market_value) as total_market_value,
    cst.total_cost_basis,
    (mv.total_market_value - cst.total_cost_basis) as unrealized_gain_loss
FROM cash_balances cb
JOIN market_values mv ON cb.account_id = mv.account_id AND cb.date = mv.date
JOIN cost_bases cst ON cb.account_id = cst.account_id AND cb.date = cst.date;

-- =====================================================
-- DATA VALIDATION CONSTRAINTS
-- =====================================================

-- Ensure investment transactions have required fields
CREATE TRIGGER validate_investment_transaction
BEFORE INSERT ON transactions
WHEN NEW.transaction_type = 'investment'
BEGIN
    SELECT CASE
        WHEN NEW.investment_action IS NULL THEN
            RAISE(ABORT, 'Investment transactions must have investment_action')
    END;
END;
