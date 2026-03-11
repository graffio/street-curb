// ABOUTME: Tests for MetricDefinition registry — LookupTable of named metric computations
// ABOUTME: Run with: yarn tap:file test/metric-registry.tap.js

import { test } from 'tap'
import { MetricRegistry } from '../src/financial-computations/metric-registry.js'

// ═════════════════════════════════════════════════
// Registry structure
// ═════════════════════════════════════════════════

test('Metric registry', t => {
    t.test('Given the default metric registry', t => {
        t.test('When looking up a registered metric', t => {
            const irr = MetricRegistry.table.get('irr')
            t.ok(irr, 'Then IRR metric is found')
            t.equal(irr.name, 'irr', 'Then metric name matches')
            t.type(irr.compute, 'string', 'Then compute is a string reference')
            t.end()
        })
        t.end()
    })

    t.test('Given an unknown metric name', t => {
        t.test('When looking up via LookupTable.get', t => {
            // LookupTable.get returns undefined for unknown keys (no throw)
            // But the execution engine should fail-fast when a query requests an unknown metric
            const result = MetricRegistry.table.get('unknown_metric')
            t.equal(result, undefined, 'Then unknown metric returns undefined')
            t.end()
        })
        t.end()
    })

    t.test('Given all 7 initial metrics', t => {
        t.test('When checking registry completeness', t => {
            const expectedNames = [
                'total_return',
                'total_return_pct',
                'realized_gain',
                'dividend_income',
                'irr',
                'benchmark_return_pct',
                'alpha',
            ]

            expectedNames.forEach(name => {
                const metric = MetricRegistry.table.get(name)
                t.ok(metric, `Then '${name}' is registered`)
                t.type(metric.compute, 'string', `Then '${name}' has a string compute reference`)
            })
            t.end()
        })
        t.end()
    })

    t.test('Given MetricRegistry.resolveMetricFn', t => {
        t.test('When resolving a known metric name', t => {
            const fn = MetricRegistry.resolveMetricFn('irr')
            t.type(fn, 'function', 'Then it returns a function')
            t.end()
        })

        t.test('When resolving an unknown metric name', t => {
            t.throws(() => MetricRegistry.resolveMetricFn('nonexistent'), /No compute function/, 'Then it throws')
            t.end()
        })
        t.end()
    })

    t.end()
})
