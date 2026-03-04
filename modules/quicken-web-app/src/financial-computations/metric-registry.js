// ABOUTME: Registry of named metric computations for investment positions
// ABOUTME: LookupTable of MetricDefinition, accessed by name — fail-fast on unknown metrics

import { LookupTable } from '@graffio/functional'
import { MetricDefinition } from '../../type-definitions/metric-definition.type.js'
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
    MetricDefinition('total_return',         (position, ctx) => computeTotalReturn(position, ctx).totalReturnDollars, 'position'),
    MetricDefinition('total_return_pct',     (position, ctx) => computeTotalReturn(position, ctx).totalReturnPercent, 'position'),
    MetricDefinition('realized_gain',        (position, ctx) => computeRealizedGains(position, ctx).totalRealizedGain, 'position'),
    MetricDefinition('dividend_income',      (position, ctx) => computeDividendIncome(position, ctx), 'position'),
    MetricDefinition('irr',                  (position, ctx) => computeIrr(position, ctx), 'position'),
    MetricDefinition('benchmark_return_pct', (position, ctx) => computeBenchmarkReturn(position, ctx), 'position'),
    MetricDefinition('alpha',                (position, ctx) => computeTotalReturn(position, ctx).totalReturnPercent - computeBenchmarkReturn(position, ctx), 'position'),
]

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const MetricRegistry = LookupTable(METRICS, MetricDefinition, 'name')

export { MetricRegistry }
