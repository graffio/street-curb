// ABOUTME: Registry of named metric computations for investment positions
// ABOUTME: LookupTable of MetricDefinition, accessed by name — fail-fast on unknown metrics

import { LookupTable } from '@graffio/functional'
import { MetricDefinition } from '../types/metric-definition.js'
import { computeBenchmarkReturn } from './compute-benchmark-return.js'
import { computeDividendIncome } from './compute-dividend-income.js'
import { computeIrr } from './compute-irr.js'
import { computeRealizedGains } from './compute-realized-gains.js'
import { computeTotalReturn } from './compute-total-return.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const METRICS = [
    MetricDefinition('total_return',         'total_return',         'position'),
    MetricDefinition('total_return_pct',     'total_return_pct',     'position'),
    MetricDefinition('realized_gain',        'realized_gain',        'position'),
    MetricDefinition('dividend_income',      'dividend_income',      'position'),
    MetricDefinition('irr',                  'irr',                  'position'),
    MetricDefinition('benchmark_return_pct', 'benchmark_return_pct', 'position'),
    MetricDefinition('alpha',                'alpha',                'position'),
]

// prettier-ignore
const COMPUTE_FNS = {
    total_return:         (position, ctx) => computeTotalReturn(position, ctx).totalReturnDollars,
    total_return_pct:     (position, ctx) => computeTotalReturn(position, ctx).totalReturnPercent,
    realized_gain:        (position, ctx) => computeRealizedGains(position, ctx).totalRealizedGain,
    dividend_income:      (position, ctx) => computeDividendIncome(position, ctx),
    irr:                  (position, ctx) => computeIrr(position, ctx),
    benchmark_return_pct: (position, ctx) => computeBenchmarkReturn(position, ctx),
    alpha:                (position, ctx) => computeTotalReturn(position, ctx).totalReturnPercent - computeBenchmarkReturn(position, ctx),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const _table = LookupTable(METRICS, MetricDefinition, 'name')

// Look up the compute function for a metric by its string name reference
/** @sig resolveMetricFn :: String -> (Position, Context) -> Number */
const resolveMetricFn = name => {
    const fn = COMPUTE_FNS[name]
    if (!fn) throw new Error(`No compute function for metric '${name}'`)
    return fn
}

const MetricRegistry = { table: _table, resolveMetricFn }

export { MetricRegistry }
