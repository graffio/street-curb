// ABOUTME: Tests for SetQueryIR action round-trip through the reducer
// ABOUTME: Verifies store, replace, and reference identity semantics for per-viewId query IR

import { test } from 'tap'
import { LookupTable } from '@graffio/functional'
import { IRComputation, IRDomain, IRSource, Query } from '../src/query-language/types/index.js'
import { Action } from '../src/types/action.js'
import { Reducer } from '../src/store/reducer.js'

// ═════════════════════════════════════════════════
// Helper: build a minimal Query IR
// ═════════════════════════════════════════════════

const makeQuery = name =>
    Query(
        name,
        undefined,
        LookupTable([IRSource('_default', IRDomain.Transactions(), undefined, undefined)], IRSource, 'name'),
        IRComputation.Identity('_default'),
        undefined,
    )

// ═════════════════════════════════════════════════
// Helper: dispatch an action through the reducer
// ═════════════════════════════════════════════════

const dispatch = (state, action) => Reducer.rootReducer(state, { type: action.constructor.toString(), action })

// ═════════════════════════════════════════════════
// (a) Store and retrieve Query IR by viewId
// ═════════════════════════════════════════════════

test('SetQueryIR round-trip', t => {
    t.test('Given an empty initial state', t => {
        const state = Reducer.createEmptyState()

        t.test('When dispatching SetQueryIR for a viewId', t => {
            const query = makeQuery('transactions')
            const next = dispatch(state, Action.SetQueryIR('view_1', query))

            t.same(next.queryIR.view_1, query, 'Then the query is stored at that viewId')
            t.equal(Object.keys(next.queryIR).length, 1, 'Then only that viewId exists')
            t.end()
        })
        t.end()
    })

    t.test('Given a state with an existing Query IR', t => {
        const query1 = makeQuery('first')
        const state = dispatch(Reducer.createEmptyState(), Action.SetQueryIR('view_1', query1))

        t.test('When dispatching SetQueryIR with a new query for the same viewId', t => {
            const query2 = makeQuery('second')
            const next = dispatch(state, Action.SetQueryIR('view_1', query2))

            t.same(next.queryIR.view_1, query2, 'Then the query is replaced')
            t.notSame(next.queryIR.view_1, query1, 'Then the old query is gone')
            t.end()
        })

        t.test('When dispatching SetQueryIR for a different viewId', t => {
            const query2 = makeQuery('second')
            const next = dispatch(state, Action.SetQueryIR('view_2', query2))

            t.same(next.queryIR.view_1, query1, 'Then the first viewId is unchanged')
            t.same(next.queryIR.view_2, query2, 'Then the second viewId is stored')
            t.equal(Object.keys(next.queryIR).length, 2, 'Then both viewIds exist')
            t.end()
        })
        t.end()
    })

    t.test('Given a state with two Query IRs', t => {
        let state = Reducer.createEmptyState()
        const query1 = makeQuery('first')
        const query2 = makeQuery('second')
        state = dispatch(state, Action.SetQueryIR('view_1', query1))
        state = dispatch(state, Action.SetQueryIR('view_2', query2))

        t.test('When updating only one viewId', t => {
            const query3 = makeQuery('third')
            const next = dispatch(state, Action.SetQueryIR('view_1', query3))

            t.equal(next.queryIR.view_2, query2, 'Then the untouched viewId preserves reference identity')
            t.end()
        })
        t.end()
    })

    t.end()
})
