// ABOUTME: Computes total dividend income for a position from investment transactions
// ABOUTME: Pure function — (Position, Context) → Number

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = {
    // Checks if a transaction matches a position's account and security
    // @sig isForPosition :: (Transaction, Position) -> Boolean
    isForPosition: (txn, position) => txn.accountId === position.accountId && txn.securityId === position.securityId,

    // Checks if a transaction is a dividend-type action
    // @sig isDividendAction :: String -> Boolean
    isDividendAction: action => DIVIDEND_ACTIONS.includes(action),

    // Checks if a record is within a date range (undefined range = all dates)
    // @sig isInDateRange :: ({ date: String }, Object?) -> Boolean
    isInDateRange: (record, dateRange) => {
        if (!dateRange) return true
        const { start, end } = dateRange
        if (start && record.date < start) return false
        if (end && record.date > end) return false
        return true
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// Transaction actions that count as dividend income
const DIVIDEND_ACTIONS = ['Div', 'DivX', 'ReinvDiv', 'ReinvInt', 'ReinvLg', 'ReinvMd', 'ReinvSh']

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// @sig computeDividendIncome :: (Position, Context) -> Number
const computeDividendIncome = (position, context) => {
    const { transactions, dateRange } = context
    return [...transactions]
        .filter(
            txn =>
                P.isForPosition(txn, position) &&
                P.isDividendAction(txn.investmentAction) &&
                P.isInDateRange(txn, dateRange),
        )
        .reduce((sum, txn) => sum + Math.abs(txn.amount), 0)
}

export { computeDividendIncome }
