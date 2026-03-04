// ABOUTME: Computes internal rate of return (IRR) for a position using Newton's method
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

    // Checks if a transaction is a cash flow action for IRR (excludes reinvestments)
    // @sig isCashFlowAction :: String -> Boolean
    isCashFlowAction: action => CASH_FLOW_ACTIONS.includes(action),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Extracts cash flows for IRR from investment transactions
    // @sig toCashFlows :: (Position, LookupTable, String) -> [{ date: String, amount: Number }]
    toCashFlows: (position, transactions, asOfDate) => {
        const positionTxns = transactions.filter(
            txn => P.isForPosition(txn, position) && P.isCashFlowAction(txn.investmentAction),
        )
        const flows = [
            ...positionTxns.map(txn => ({ date: txn.date, amount: txn.amount })),
            { date: asOfDate, amount: position.marketValue },
        ]
        return flows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    },

    // Converts a date string to year fraction from a reference date
    // @sig toYearFraction :: (String, String) -> Number
    toYearFraction: (dateStr, referenceDate) => {
        const d = new Date(dateStr)
        const ref = new Date(referenceDate)
        return (d - ref) / (365.25 * 24 * 60 * 60 * 1000)
    },

    // Performs one Newton's method iteration for IRR convergence
    // @sig toNewtonStep :: ([{ amount, t }], Number) -> Number
    toNewtonStep: (yearFractions, rate) => {
        const npv = yearFractions.reduce((sum, { amount, t }) => sum + amount / Math.pow(1 + rate, t), 0)
        const deriv = yearFractions.reduce((sum, { amount, t }) => sum + (-t * amount) / Math.pow(1 + rate, t + 1), 0)
        if (Math.abs(deriv) < 1e-12) return rate
        return rate - npv / deriv
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// Transaction actions that represent external cash flows (for IRR)
// Excludes ReinvDiv/ReinvInt/ReinvLg/ReinvMd/ReinvSh — internal reinvestments with zero net cash flow
const CASH_FLOW_ACTIONS = ['Buy', 'BuyX', 'Sell', 'SellX', 'Div', 'DivX', 'ShrsIn', 'ShrsOut']

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// @sig computeIrr :: (Position, Context) -> Number
const computeIrr = (position, context) => {
    const { transactions, asOfDate } = context
    const cashFlows = T.toCashFlows(position, transactions, asOfDate)
    if (cashFlows.length < 2) return 0

    const referenceDate = cashFlows[0]?.date ?? asOfDate
    const yearFractions = cashFlows.map(({ amount, date }) => ({ amount, t: T.toYearFraction(date, referenceDate) }))

    return Array.from({ length: 20 }).reduce(rate => T.toNewtonStep(yearFractions, rate), 0.1)
}

export { computeIrr }
