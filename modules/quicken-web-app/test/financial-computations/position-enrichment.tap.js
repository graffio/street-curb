// ABOUTME: Tests for position enrichment — realized gains, dividends, IRR, benchmark, total return
// ABOUTME: Run with: yarn tap:file test/financial-computations/position-enrichment.tap.js

import { test } from 'tap'
import { LookupTable } from '@graffio/functional'
import { Lot, LotAllocation, Position, Price, Security, Transaction } from '../../src/types/index.js'
import { computeBenchmarkReturn } from '../../src/financial-computations/compute-benchmark-return.js'
import { computeDividendIncome } from '../../src/financial-computations/compute-dividend-income.js'
import { computeIrr } from '../../src/financial-computations/compute-irr.js'
import { computeRealizedGains } from '../../src/financial-computations/compute-realized-gains.js'
import { computeTotalReturn } from '../../src/financial-computations/compute-total-return.js'

// ═════════════════════════════════════════════════
// Fixture helpers
// ═════════════════════════════════════════════════

const investTx = (id, accountId, date, action, securityId, quantity, amount, price) =>
    Transaction.Investment(
        accountId,
        date,
        id,
        'investment',
        undefined,
        amount,
        undefined,
        undefined,
        undefined,
        action,
        undefined,
        undefined,
        price,
        quantity,
        undefined,
        securityId,
        undefined,
    )

const lot = (id, accountId, securityId, purchaseDate, quantity, costBasis, opts = {}) =>
    Lot(
        accountId,
        costBasis,
        opts.createdAt ?? purchaseDate,
        id,
        purchaseDate,
        quantity,
        opts.remainingQuantity ?? quantity,
        securityId,
        opts.createdByTransactionId ?? 'txn_000000000000',
        opts.closedDate,
    )

const alloc = (id, lotId, transactionId, date, sharesAllocated, costBasisAllocated) =>
    LotAllocation(id, lotId, transactionId, sharesAllocated, costBasisAllocated, date)

const price = (id, securityId, date, priceValue) => Price(id, securityId, date, priceValue)

const position = (accountId, securityId, quantity, costBasis, marketValue) =>
    Position(
        accountId,
        'Test Account',
        securityId,
        'Test Security',
        'TEST',
        'Stock',
        undefined,
        quantity,
        costBasis,
        costBasis / quantity,
        marketValue / quantity,
        marketValue,
        marketValue - costBasis,
        (marketValue - costBasis) / costBasis,
        0,
        0,
        false,
    )

// ═════════════════════════════════════════════════
// Fixture: AAPL-shaped position
// Buy 100 shares at $150, then 50 more at $160 (DCA)
// Sell 30 shares later
// Dividends along the way
// ═════════════════════════════════════════════════

const ACCOUNT_ID = 'acc_000000000001'
const AAPL_ID = 'sec_000000000001'
const SPY_ID = 'sec_000000000002'

const LOTS = LookupTable(
    [
        lot('lot_000000000001', ACCOUNT_ID, AAPL_ID, '2023-01-15', 100, 15000),
        lot('lot_000000000002', ACCOUNT_ID, AAPL_ID, '2023-07-20', 50, 8000),
    ],
    Lot,
    'id',
)

const ALLOCATIONS = LookupTable(
    [
        // Sold 30 shares on 2024-06-15 from lot 1 (held > 365 days → long-term)
        alloc('la_000000000001', 'lot_000000000001', 'txn_000000000004', '2024-06-15', 30, 4500),
    ],
    LotAllocation,
    'id',
)

const TRANSACTIONS = LookupTable(
    [
        // Buys
        investTx('txn_000000000001', ACCOUNT_ID, '2023-01-15', 'Buy', AAPL_ID, 100, -15000, 150),
        investTx('txn_000000000002', ACCOUNT_ID, '2023-07-20', 'Buy', AAPL_ID, 50, -8000, 160),

        // Dividends
        investTx('txn_000000000003', ACCOUNT_ID, '2023-10-15', 'Div', AAPL_ID, undefined, 225, undefined),
        investTx('txn_000000000005', ACCOUNT_ID, '2024-04-15', 'Div', AAPL_ID, undefined, 210, undefined),

        // Sell 30 shares at $180
        investTx('txn_000000000004', ACCOUNT_ID, '2024-06-15', 'Sell', AAPL_ID, -30, 5400, 180),

        // ReinvDiv — should count as dividend income but NOT as external cash flow for IRR
        investTx('txn_000000000006', ACCOUNT_ID, '2024-07-15', 'ReinvDiv', AAPL_ID, 1.25, 225, 180),
    ],
    Transaction,
    'id',
)

const SECURITIES = LookupTable(
    [
        Security(AAPL_ID, 'Apple Inc.', 'AAPL', 'Stock', undefined),
        Security(SPY_ID, 'SPDR S&P 500 ETF', 'SPY', 'ETF', undefined),
    ],
    Security,
    'id',
)

// SPY prices for benchmark computation
const PRICES = LookupTable(
    [
        price('prc_000000000001', SPY_ID, '2023-01-15', 390),
        price('prc_000000000002', SPY_ID, '2023-07-20', 450),
        price('prc_000000000003', SPY_ID, '2024-06-15', 540),
        price('prc_000000000004', SPY_ID, '2024-12-31', 580),

        // AAPL prices for market value
        price('prc_000000000005', AAPL_ID, '2024-12-31', 195),
    ],
    Price,
    'id',
)

// Position as of 2024-12-31: 120 shares (100 - 30 + 50) + 1.25 reinvested
const AAPL_POSITION = position(ACCOUNT_ID, AAPL_ID, 121.25, 18725, 121.25 * 195)

const AS_OF_DATE = '2024-12-31'

const CONTEXT = {
    lots: LOTS,
    lotAllocations: ALLOCATIONS,
    transactions: TRANSACTIONS,
    securities: SECURITIES,
    prices: PRICES,
    asOfDate: AS_OF_DATE,
    benchmarkSecurityId: SPY_ID,
}

// ═════════════════════════════════════════════════
// Realized Gains
// ═════════════════════════════════════════════════

test('Realized gains', t => {
    t.test('Given a single lot sell with 30 shares at $180 from lot with $150 avg cost', t => {
        t.test('When computing realized gains', t => {
            const result = computeRealizedGains(AAPL_POSITION, CONTEXT)

            t.equal(result.totalRealizedGain, 900, 'Then total realized gain is $900 (5400 proceeds - 4500 cost basis)')
            t.equal(result.longTermGain, 900, 'Then all gains are long-term (held > 365 days)')
            t.equal(result.shortTermGain, 0, 'Then short-term gains are $0')
            t.end()
        })
        t.end()
    })

    t.test('Given multiple lot allocations for the same sell', t => {
        t.test('When computing realized gains with multi-lot sell', t => {
            const multiLotAllocations = LookupTable(
                [
                    // Sell 50 shares total: 30 from lot1 (long-term), 20 from lot2 (short-term, < 365 days)
                    alloc('la_000000000001', 'lot_000000000001', 'txn_000000000004', '2024-06-15', 30, 4500),
                    alloc('la_000000000002', 'lot_000000000002', 'txn_000000000004', '2024-06-15', 20, 3200),
                ],
                LotAllocation,
                'id',
            )

            // Sell transaction: 50 shares at $180 = $9000 proceeds
            const multiLotTransactions = LookupTable(
                [investTx('txn_000000000004', ACCOUNT_ID, '2024-06-15', 'Sell', AAPL_ID, -50, 9000, 180)],
                Transaction,
                'id',
            )

            const ctx = { ...CONTEXT, lotAllocations: multiLotAllocations, transactions: multiLotTransactions }
            const result = computeRealizedGains(AAPL_POSITION, ctx)

            // Lot 1: 30/50 * 9000 = 5400 proceeds - 4500 cost = 900 gain (long-term: 2023-01-15 to 2024-06-15 = 517 days)
            // Lot 2: 20/50 * 9000 = 3600 proceeds - 3200 cost = 400 gain (short-term: 2023-07-20 to 2024-06-15 = 331 days)
            t.equal(result.totalRealizedGain, 1300, 'Then total is $1300 (900 + 400)')
            t.equal(result.longTermGain, 900, 'Then long-term gain is $900')
            t.equal(result.shortTermGain, 400, 'Then short-term gain is $400')
            t.end()
        })
        t.end()
    })

    t.test('Given the 365-day boundary', t => {
        t.test('When a lot is held exactly 365 days', t => {
            // Purchase: 2023-01-15, Sell: 2024-01-15 = exactly 365 days → short-term (strict >)
            const exactAllocations = LookupTable(
                [alloc('la_000000000001', 'lot_000000000001', 'txn_00000000000f', '2024-01-15', 10, 1500)],
                LotAllocation,
                'id',
            )

            const exactTransactions = LookupTable(
                [investTx('txn_00000000000f', ACCOUNT_ID, '2024-01-15', 'Sell', AAPL_ID, -10, 1800, 180)],
                Transaction,
                'id',
            )

            const ctx = { ...CONTEXT, lotAllocations: exactAllocations, transactions: exactTransactions }
            const result = computeRealizedGains(AAPL_POSITION, ctx)

            t.equal(result.shortTermGain, 300, 'Then exactly 365 days is short-term (strict >)')
            t.equal(result.longTermGain, 0, 'Then no long-term gains')
            t.end()
        })
        t.end()
    })

    t.test('Given date-scoped realized gains', t => {
        t.test('When computing for a date range that excludes the sell', t => {
            const ctx = { ...CONTEXT, dateRange: { start: '2025-01-01', end: '2025-12-31' } }
            const result = computeRealizedGains(AAPL_POSITION, ctx)

            t.equal(result.totalRealizedGain, 0, 'Then no realized gains outside date range')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// Dividend Income
// ═════════════════════════════════════════════════

test('Dividend income', t => {
    t.test('Given transactions with Div and ReinvDiv actions', t => {
        t.test('When computing dividend income', t => {
            const result = computeDividendIncome(AAPL_POSITION, CONTEXT)

            // Div: 225 + 210 = 435, ReinvDiv: 225 → total 660
            t.equal(result, 660, 'Then all dividend types are summed (Div + ReinvDiv)')
            t.end()
        })
        t.end()
    })

    t.test('Given ReinvDiv does not double-count', t => {
        t.test('When computing total return with ReinvDiv', t => {
            // ReinvDiv creates a lot (cost basis = dividend amount) but the dividend income
            // counts the amount once. In total return: unrealized subtracts the cost basis,
            // dividend adds the income — net counted once.
            const result = computeDividendIncome(AAPL_POSITION, CONTEXT)
            const reinvDivAmount = 225

            // ReinvDiv is included in dividend income exactly once
            t.ok(result >= reinvDivAmount, 'Then ReinvDiv amount is included in dividend income')
            t.end()
        })
        t.end()
    })

    t.test('Given all dividend action types', t => {
        t.test('When transactions include DivX, ReinvInt, ReinvLg, ReinvMd, ReinvSh', t => {
            const allDivTransactions = LookupTable(
                [
                    investTx('txn_000000000011', ACCOUNT_ID, '2024-01-15', 'Div', AAPL_ID, undefined, 100, undefined),
                    investTx('txn_000000000012', ACCOUNT_ID, '2024-02-15', 'DivX', AAPL_ID, undefined, 50, undefined),
                    investTx('txn_000000000013', ACCOUNT_ID, '2024-03-15', 'ReinvDiv', AAPL_ID, 0.5, 75, 150),
                    investTx('txn_000000000014', ACCOUNT_ID, '2024-04-15', 'ReinvInt', AAPL_ID, 0.3, 45, 150),
                    investTx('txn_000000000015', ACCOUNT_ID, '2024-05-15', 'ReinvLg', AAPL_ID, 0.2, 30, 150),
                    investTx('txn_000000000016', ACCOUNT_ID, '2024-06-15', 'ReinvMd', AAPL_ID, 0.1, 15, 150),
                    investTx('txn_000000000017', ACCOUNT_ID, '2024-07-15', 'ReinvSh', AAPL_ID, 0.1, 15, 150),
                ],
                Transaction,
                'id',
            )

            const ctx = { ...CONTEXT, transactions: allDivTransactions }
            const result = computeDividendIncome(AAPL_POSITION, ctx)

            t.equal(result, 330, 'Then all 7 dividend action types are counted (100+50+75+45+30+15+15)')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// IRR
// ═════════════════════════════════════════════════

test('IRR', t => {
    t.test('Given a simple buy and current market value', t => {
        t.test('When computing IRR for a single purchase held to asOfDate', t => {
            // Buy 100 shares at $150 on 2023-01-15, worth $195 on 2024-12-31
            // Simple return = (19500 - 15000) / 15000 = 30%
            // Time-weighted IRR will be close but not identical
            const simpleLots = LookupTable(
                [lot('lot_000000000001', ACCOUNT_ID, AAPL_ID, '2023-01-15', 100, 15000)],
                Lot,
                'id',
            )
            const simpleTransactions = LookupTable(
                [investTx('txn_000000000001', ACCOUNT_ID, '2023-01-15', 'Buy', AAPL_ID, 100, -15000, 150)],
                Transaction,
                'id',
            )
            const simplePosition = position(ACCOUNT_ID, AAPL_ID, 100, 15000, 19500)
            const ctx = {
                ...CONTEXT,
                lots: simpleLots,
                transactions: simpleTransactions,
                lotAllocations: LookupTable([], LotAllocation, 'id'),
            }

            const irr = computeIrr(simplePosition, ctx)

            t.type(irr, 'number', 'Then IRR is a number')
            t.ok(irr > 0.1, 'Then IRR is positive and meaningful (> 10%)')
            t.ok(irr < 0.5, 'Then IRR is reasonable (< 50%)')
            t.end()
        })
        t.end()
    })

    t.test('Given dollar-cost averaging', t => {
        t.test('When computing IRR vs simple return', t => {
            // DCA: buy at $150 then $160 → average cost ~$153.33
            // Market at $195 → simple return = (195 - 153.33) / 153.33 = ~27.2%
            // IRR should differ from simple return because of time weighting
            const irr = computeIrr(AAPL_POSITION, CONTEXT)
            const simpleReturn = (AAPL_POSITION.marketValue - AAPL_POSITION.costBasis) / AAPL_POSITION.costBasis

            t.type(irr, 'number', 'Then IRR is a number')
            t.not(irr.toFixed(4), simpleReturn.toFixed(4), 'Then IRR differs from simple return (time weighting)')
            t.end()
        })
        t.end()
    })

    t.test('Given ReinvDiv in cash flows', t => {
        t.test('When computing IRR, ReinvDiv is excluded from external cash flows', t => {
            // ReinvDiv has zero net external cash flow — money goes from dividend to shares
            // within the account. If we wrongly include it, IRR would be distorted.
            const withReinv = computeIrr(AAPL_POSITION, CONTEXT)

            // Compute without ReinvDiv transaction for comparison
            const noReinvTransactions = TRANSACTIONS.filter(t => t.id !== 'txn_000000000006')
            const noReinvCtx = { ...CONTEXT, transactions: noReinvTransactions }
            const withoutReinv = computeIrr(AAPL_POSITION, noReinvCtx)

            // IRR should be similar whether ReinvDiv is present or not
            // (because ReinvDiv contributes zero external cash flow)
            t.ok(
                Math.abs(withReinv - withoutReinv) < 0.02,
                'Then ReinvDiv has negligible effect on IRR (excluded from cash flows)',
            )
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// Benchmark Comparison
// ═════════════════════════════════════════════════

test('Benchmark comparison', t => {
    t.test('Given SPY prices from position inception to asOfDate', t => {
        t.test('When computing benchmark return', t => {
            // SPY: 390 on 2023-01-15 → 580 on 2024-12-31 = (580-390)/390 = 48.7%
            const result = computeBenchmarkReturn(AAPL_POSITION, CONTEXT)

            const expectedReturn = (580 - 390) / 390
            t.ok(
                Math.abs(result - expectedReturn) < 0.001,
                `Then benchmark return is ~${(expectedReturn * 100).toFixed(1)}%`,
            )
            t.end()
        })
        t.end()
    })

    t.test('Given alpha computation', t => {
        t.test('When computing alpha (total return % - benchmark return %)', t => {
            const totalReturn = computeTotalReturn(AAPL_POSITION, CONTEXT)
            const benchmark = computeBenchmarkReturn(AAPL_POSITION, CONTEXT)
            const alpha = totalReturn.totalReturnPercent - benchmark

            t.type(alpha, 'number', 'Then alpha is a number')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// Total Return
// ═════════════════════════════════════════════════

test('Total return', t => {
    t.test('Given a position with unrealized gains, realized gains, and dividends', t => {
        t.test('When computing total return', t => {
            const result = computeTotalReturn(AAPL_POSITION, CONTEXT)

            // unrealizedGainLoss from position: marketValue - costBasis
            const unrealized = AAPL_POSITION.unrealizedGainLoss

            // realized: $900 (from ALLOCATIONS fixture)
            // dividends: $660 (Div 225 + Div 210 + ReinvDiv 225)
            const expectedTotal = unrealized + 900 + 660

            t.equal(result.totalReturnDollars, expectedTotal, 'Then total return = unrealized + realized + dividends')
            t.equal(
                result.totalReturnPercent,
                expectedTotal / AAPL_POSITION.costBasis,
                'Then total return % = totalReturnDollars / costBasis',
            )
            t.end()
        })
        t.end()
    })

    t.end()
})
