import { test } from 'tap'
import { _createSelector, createChannel } from '../../src/channels/index.js'

test('createChannel', t => {
    t.test('Given I create a channel with initial state', t => {
        t.test('When I call getState', t => {
            const channel = createChannel({ count: 0, name: 'test' })
            const state = channel.getState()

            t.same(state, { count: 0, name: 'test' }, 'Then it returns the initial state')
            t.end()
        })
        t.end()
    })

    t.test('Given I have a channel', t => {
        t.test('When I call setState with an object', t => {
            const channel = createChannel({ count: 0, name: 'test' })
            channel.setState({ count: 5 })

            t.same(channel.getState(), { count: 5, name: 'test' }, 'Then it merges the update')
            t.end()
        })

        t.test('When I call setState with an object', t => {
            const channel = createChannel({ count: 0, name: 'test' })
            channel.setState({ count: 5, eek: 5 })

            t.same(channel.getState(), { count: 5, name: 'test' }, 'Then it merges the update')
            t.end()
        })

        t.test('When I call setState with a function', t => {
            const channel = createChannel({ count: 0 })
            channel.setState(state => ({ count: state.count + 1 }))

            t.equal(channel.getState().count, 1, 'Then it applies the function')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('subscription mechanics', t => {
    t.test('Given I have a channel and subscriber', t => {
        t.test('When state changes', t => {
            const channel = createChannel({ count: 0 })
            const calls = []
            const selector = state => state.count

            channel.subscribe(selector, value => calls.push(value))
            channel.setState({ count: 1 })

            t.same(calls, [1], 'Then subscriber is called with new value')
            t.end()
        })

        t.test('When unrelated state changes', t => {
            const channel = createChannel({ count: 0, other: 'a' })
            const calls = []
            const selector = state => state.count

            channel.subscribe(selector, value => calls.push(value))
            channel.setState({ other: 'b' })

            t.same(calls, [], 'Then subscriber is not called')
            t.end()
        })

        t.test('When same value is set', t => {
            const channel = createChannel({ count: 0 })
            const calls = []
            const selector = state => state.count

            channel.subscribe(selector, value => calls.push(value))
            channel.setState({ count: 0 })

            t.same(calls, [], 'Then subscriber is not called')
            t.end()
        })
        t.end()
    })

    t.test('Given I have multiple subscribers', t => {
        t.test('When state changes', t => {
            const channel = createChannel({ count: 0, name: 'test' })
            const countCalls = []
            const nameCalls = []

            channel.subscribe(
                state => state.count,
                value => countCalls.push(value),
            )
            channel.subscribe(
                state => state.name,
                value => nameCalls.push(value),
            )

            channel.setState({ count: 1 })

            t.same(countCalls, [1], 'Then count subscriber is called')
            t.same(nameCalls, [], 'Then name subscriber is not called')
            t.end()
        })
        t.end()
    })

    t.test('Given I have a subscription', t => {
        t.test('When I unsubscribe', t => {
            const channel = createChannel({ count: 0 })
            const calls = []
            const selector = state => state.count

            const unsubscribe = channel.subscribe(selector, value => calls.push(value))
            unsubscribe()
            channel.setState({ count: 1 })

            t.same(calls, [], 'Then subscriber is no longer called')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('selector behavior with pick', t => {
    t.test('Given I have a channel with object state', t => {
        t.test('When I subscribe to multiple keys that return same object content', t => {
            const channel = createChannel({ title: 'Test', subtitle: 'Sub', other: 'value' })
            const calls = []
            const selector = state => ({ title: state.title, subtitle: state.subtitle })

            channel.subscribe(selector, value => calls.push(value))

            // Change unrelated field
            channel.setState({ other: 'changed' })

            t.same(calls, [], 'Then subscriber is not called due to deep equality')

            // Change selected field
            channel.setState({ title: 'New Title' })

            t.equal(calls.length, 1, 'Then subscriber is called when selected data changes')
            t.same(calls[0], { title: 'New Title', subtitle: 'Sub' }, 'Then new object is provided')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('edge cases', t => {
    t.test('Given I subscribe with the same selector twice', t => {
        t.test('When state changes', t => {
            const channel = createChannel({ count: 0 })
            const calls1 = []
            const calls2 = []
            const selector = state => state.count

            channel.subscribe(selector, value => calls1.push(value))
            channel.subscribe(selector, value => calls2.push(value))

            channel.setState({ count: 1 })

            t.same(calls1, [1], 'Then first subscriber is called')
            t.same(calls2, [1], 'Then second subscriber is called')
            t.end()
        })
        t.end()
    })

    t.test('Given I have nested objects', t => {
        t.test('When nested content changes', t => {
            const channel = createChannel({ user: { name: 'John', age: 30 } })
            const calls = []
            const selector = state => state.user

            channel.subscribe(selector, value => calls.push(value))

            // Change nested property
            channel.setState({ user: { name: 'John', age: 31 } })

            t.equal(calls.length, 1, 'Then subscriber is called')
            t.same(calls[0], { name: 'John', age: 31 }, 'Then new nested object is provided')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('performance characteristics', t => {
    t.test('Given I have many subscribers', t => {
        t.test('When I update state', t => {
            const channel = createChannel({ count: 0, other: 'test' })
            let countCalls = 0
            let otherCalls = 0

            // Add many subscribers to count
            for (let i = 0; i < 100; i++) {
                channel.subscribe(
                    state => state.count,
                    () => countCalls++,
                )
            }

            // Add one subscriber to other
            channel.subscribe(
                state => state.other,
                () => otherCalls++,
            )

            // Update only count
            channel.setState({ count: 1 })

            t.equal(countCalls, 100, 'Then all count subscribers are called')
            t.equal(otherCalls, 0, 'Then other subscriber is not called')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('createSelector', t => {
    t.test('Given I create a selector with no keys', t => {
        t.test('When I apply it to state', t => {
            const selector = _createSelector()
            const state = { a: 1, b: 2, c: 3 }
            const result = selector(state)

            t.same(result, state, 'Then it returns the full state')
            t.equal(result, state, 'Then it returns the same reference')
            t.end()
        })
        t.end()
    })

    t.test('Given I create a selector with a single key', t => {
        t.test('When I apply it to state', t => {
            const selector = _createSelector('title')
            const state = { title: 'Test', subtitle: 'Sub', other: 'value' }
            const result = selector(state)

            t.equal(result, 'Test', 'Then it returns just that property value')
            t.end()
        })

        t.test('When the key does not exist', t => {
            const selector = _createSelector('missing')
            const state = { title: 'Test' }
            const result = selector(state)

            t.equal(result, undefined, 'Then it returns undefined')
            t.end()
        })
        t.end()
    })

    t.test('Given I create a selector with multiple keys', t => {
        t.test('When I apply it to state', t => {
            const selector = _createSelector(['title', 'subtitle'])
            const state = { title: 'Test', subtitle: 'Sub', other: 'value' }
            const result = selector(state)

            t.same(result, { title: 'Test', subtitle: 'Sub' }, 'Then it returns picked properties')
            t.not(result, state, 'Then it returns a new object')
            t.end()
        })

        t.test('When some keys do not exist', t => {
            const selector = _createSelector(['title', 'missing'])
            const state = { title: 'Test', other: 'value' }
            const result = selector(state)

            t.same(result, { title: 'Test' }, 'Then it includes only existing properties')
            t.end()
        })

        t.test('When applied multiple times with same state', t => {
            const selector = _createSelector(['title', 'subtitle'])
            const state = { title: 'Test', subtitle: 'Sub', other: 'value' }

            const result1 = selector(state)
            const result2 = selector(state)

            t.same(result1, result2, 'Then results have same content')
            t.equal(result1, result2, 'Then results are the same object instance (memoized)')
            t.end()
        })
        t.end()
    })

    t.test('Given I create a selector with invalid keys', t => {
        t.test('When keys is a number', t => {
            t.throws(() => _createSelector(123), 'Then it throws an error')
            t.end()
        })

        t.test('When keys is an object', t => {
            t.throws(() => _createSelector({}), 'Then it throws an error')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('selector integration with channels', t => {
    t.test('Given I have a channel and use string selector', t => {
        t.test('When state changes for that key', t => {
            const channel = createChannel({ title: 'Initial', other: 'value' })
            const calls = []

            // Simulate useChannel(channel, 'title')
            const selector = _createSelector('title')
            channel.subscribe(selector, value => calls.push(value))

            channel.setState({ title: 'Updated' })

            t.same(calls, ['Updated'], 'Then subscriber receives the single value')
            t.end()
        })

        t.test('When state changes for other key', t => {
            const channel = createChannel({ title: 'Initial', other: 'value' })
            const calls = []

            const selector = _createSelector('title')
            channel.subscribe(selector, value => calls.push(value))

            channel.setState({ other: 'changed' })

            t.same(calls, [], 'Then subscriber is not called')
            t.end()
        })
        t.end()
    })

    t.test('Given I have a channel and use array selector', t => {
        t.test('When state changes for selected keys', t => {
            const channel = createChannel({ title: 'Initial', subtitle: 'Sub', other: 'value' })
            const calls = []

            // Simulate useChannel(channel, ['title', 'subtitle'])
            const selector = _createSelector(['title', 'subtitle'])
            channel.subscribe(selector, value => calls.push(value))

            channel.setState({ title: 'Updated' })

            t.equal(calls.length, 1, 'Then subscriber is called once')
            t.same(calls[0], { title: 'Updated', subtitle: 'Sub' }, 'Then subscriber receives picked object')
            t.end()
        })

        t.test('When state changes for non-selected key', t => {
            const channel = createChannel({ title: 'Initial', subtitle: 'Sub', other: 'value' })
            const calls = []

            const selector = _createSelector(['title', 'subtitle'])
            channel.subscribe(selector, value => calls.push(value))

            channel.setState({ other: 'changed' })

            t.same(calls, [], 'Then subscriber is not called due to deep equality')
            t.end()
        })
        t.end()
    })
    t.end()
})
