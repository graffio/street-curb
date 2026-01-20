// ABOUTME: Tests for react-redux-separation rule
// ABOUTME: Verifies detection of forbidden patterns in React component bodies

import t from 'tap'
import { ReactReduxSeparation } from '../src/lib/rules/react-redux-separation.js'
import { Parser } from '../src/lib/parser.js'

const { parseCode } = Parser
const { checkReactReduxSeparation } = ReactReduxSeparation

t.test('Given a JSX file with useState', t => {
    t.test('When useState is called in component body', t => {
        const code = `const MyComponent = () => {
    const [value, setValue] = useState(0)
    return <div>{value}</div>
}`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'Component.jsx')

        const useStateViolation = violations.find(v => v.message.includes('useState'))
        t.ok(useStateViolation, 'Then a useState violation should be detected')
        t.match(useStateViolation.message, /FIX:/, 'Then the message should include a fix suggestion')
        t.end()
    })

    t.test('When useState has an EXEMPT: hover comment', t => {
        const code = `const MyComponent = () => {
    // EXEMPT: hover
    const [hovered, setHovered] = useState(false)
    return <div>{hovered}</div>
}`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'Component.jsx')

        const useStateViolation = violations.find(v => v.message.includes('useState'))
        t.notOk(useStateViolation, 'Then no useState violation should be detected')
        t.end()
    })

    t.test('When useState has an EXEMPT: focus comment', t => {
        const code = `const MyComponent = () => {
    // EXEMPT: focus
    const [focused, setFocused] = useState(false)
    return <div>{focused}</div>
}`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'Component.jsx')

        const useStateViolation = violations.find(v => v.message.includes('useState'))
        t.notOk(useStateViolation, 'Then no useState violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a JSX file with useMemo', t => {
    t.test('When useMemo is called in component body', t => {
        const code = `const MyComponent = ({ items }) => {
    const filtered = useMemo(() => items.filter(i => i.active), [items])
    return <div>{filtered.length}</div>
}`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'Component.jsx')

        const useMemoViolation = violations.find(v => v.message.includes('useMemo'))
        t.ok(useMemoViolation, 'Then a useMemo violation should be detected')
        t.match(useMemoViolation.message, /selector/, 'Then the message should mention selector')
        t.end()
    })

    t.end()
})

t.test('Given a JSX file with useChannel import', t => {
    t.test('When useChannel is imported', t => {
        const code = `import { useChannel } from '@graffio/core'
const MyComponent = () => <div>Hello</div>`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'Component.jsx')

        const channelViolation = violations.find(v => v.message.includes('useChannel'))
        t.ok(channelViolation, 'Then a useChannel violation should be detected')
        t.match(channelViolation.message, /Redux/, 'Then the message should mention Redux')
        t.end()
    })

    t.end()
})

t.test('Given a JSX file with collection methods', t => {
    t.test('When .filter() is called in component body', t => {
        const code = `const MyComponent = ({ items }) => {
    const active = items.filter(i => i.active)
    return <div>{active.length}</div>
}`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'Component.jsx')

        const filterViolation = violations.find(v => v.message.includes('.filter()'))
        t.ok(filterViolation, 'Then a collection method violation should be detected')
        t.match(filterViolation.message, /selector/, 'Then the message should mention selector')
        t.end()
    })

    t.test('When .map() is called in component body', t => {
        const code = `const MyComponent = ({ items }) => {
    const names = items.map(i => i.name)
    return <div>{names.join(', ')}</div>
}`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'Component.jsx')

        const mapViolation = violations.find(v => v.message.includes('.map()'))
        t.ok(mapViolation, 'Then a collection method violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a JSX file with spread elements', t => {
    t.test('When object spread is used in component body', t => {
        const code = `const MyComponent = ({ style }) => {
    const merged = { ...style, color: 'red' }
    return <div style={merged}>Hello</div>
}`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'Component.jsx')

        const spreadViolation = violations.find(v => v.message.includes('Spread'))
        t.ok(spreadViolation, 'Then a spread violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a non-JSX file', t => {
    t.test('When file is a .js file', t => {
        const code = `const useState = value => [value, () => {}]
const result = useState(0)`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'utility.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a test file', t => {
    t.test('When file is a .tap.js file', t => {
        const code = `const MyComponent = () => {
    const [value] = useState(0)
    return <div>{value}</div>
}`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'Component.tap.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for test files')
        t.end()
    })

    t.end()
})

t.test('Given a useCallback with complex body', t => {
    t.test('When useCallback has multiple statements', t => {
        const code = `const MyComponent = () => {
    const handleClick = useCallback(() => {
        const value = computeSomething()
        doSomethingWith(value)
    }, [])
    return <button onClick={handleClick}>Click</button>
}`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'Component.jsx')

        const callbackViolation = violations.find(v => v.message.includes('useCallback'))
        t.ok(callbackViolation, 'Then a useCallback violation should be detected')
        t.match(callbackViolation.message, /single/, 'Then the message should mention single call')
        t.end()
    })

    t.test('When useCallback has single expression', t => {
        const code = `const MyComponent = () => {
    const handleClick = useCallback(() => post(Action.Click()), [])
    return <button onClick={handleClick}>Click</button>
}`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'Component.jsx')

        const callbackViolation = violations.find(v => v.message.includes('useCallback'))
        t.notOk(callbackViolation, 'Then no useCallback violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a selector file with a long selector', t => {
    t.test('When selector exceeds 6 lines', t => {
        const code = `const selectItems = state => {
    const items = state.items
    const filtered = items.filter(i => i.active)
    const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name))
    const mapped = sorted.map(i => i.name)
    const result = mapped.join(', ')
    return result
}`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'store/selectors/items.js')

        const longViolation = violations.find(v => v.message.includes('lines'))
        t.ok(longViolation, 'Then a too-long violation should be detected')
        t.match(longViolation.message, /selectItems/, 'Then the message should include selector name')
        t.end()
    })

    t.test('When selector is 6 lines or fewer', t => {
        const code = `const selectItems = state => {
    const items = state.items
    return items.filter(i => i.active)
}`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'store/selectors/items.js')

        const longViolation = violations.find(v => v.message.includes('lines'))
        t.notOk(longViolation, 'Then no too-long violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a selector file with nested conditionals', t => {
    t.test('When selector has nested if statements', t => {
        const code = `const selectLabel = state => {
    if (state.type === 'a') {
        if (state.subtype === 'x') return 'AX'
        return 'A'
    }
    return 'B'
}`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'store/selectors/labels.js')

        const nestedViolation = violations.find(v => v.message.includes('nested conditionals'))
        t.ok(nestedViolation, 'Then a nested conditional violation should be detected')
        t.end()
    })

    t.test('When selector has nested ternary', t => {
        const code = `const selectLabel = state => state.a ? state.b ? 'AB' : 'A' : 'none'`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'store/selectors/labels.js')

        const nestedViolation = violations.find(v => v.message.includes('nested ternary'))
        t.ok(nestedViolation, 'Then a nested ternary violation should be detected')
        t.end()
    })

    t.test('When selector has single-level ternary', t => {
        const code = `const selectLabel = state => state.active ? 'Yes' : 'No'`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'store/selectors/labels.js')

        const nestedViolation = violations.find(v => v.message.includes('nested'))
        t.notOk(nestedViolation, 'Then no nested violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a selector file with chained collection methods', t => {
    t.test('When selector chains more than 2 collection methods', t => {
        const code = `const selectNames = state => state.items.filter(i => i.active).map(i => i.name).slice(0, 10)`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'store/selectors/names.js')

        const chainViolation = violations.find(v => v.message.includes('collection methods'))
        t.ok(chainViolation, 'Then a collection chain violation should be detected')
        t.match(chainViolation.message, /3/, 'Then the message should mention count')
        t.end()
    })

    t.test('When selector chains 2 or fewer collection methods', t => {
        const code = `const selectNames = state => state.items.filter(i => i.active).map(i => i.name)`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'store/selectors/names.js')

        const chainViolation = violations.find(v => v.message.includes('collection methods'))
        t.notOk(chainViolation, 'Then no collection chain violation should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a non-selector file', t => {
    t.test('When file is not in selectors path', t => {
        const code = `const selectItems = state => {
    const a = 1
    const b = 2
    const c = 3
    const d = 4
    const e = 5
    return state.items
}`
        const ast = parseCode(code)
        const violations = checkReactReduxSeparation(ast, code, 'utils/helpers.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})
