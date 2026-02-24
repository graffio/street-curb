// ABOUTME: Tests for require-action-registry rule
// ABOUTME: Verifies detection of onClick/onKeyDown without ActionRegistry and hardcoded key names

import t from 'tap'
import { checkRequireActionRegistry } from '../src/lib/rules/check-require-action-registry.js'
import { parseCode } from '../src/lib/parse-code.js'

// ----- Check 1: onClick without ActionRegistry -----

t.test('Given a JSX file with onClick but no ActionRegistry', t => {
    t.test('When onClick is the only interaction handler', t => {
        const code = `const Foo = () => <button onClick={handleClick}>Go</button>`
        const ast = parseCode(code)
        const violations = checkRequireActionRegistry(ast, code, 'Component.jsx')

        const v = violations.find(v => v.message.includes('onClick'))
        t.ok(v, 'Then an onClick violation is detected')
        t.match(v.message, /ActionRegistry/, 'Then the message mentions ActionRegistry')
        t.match(v.message, /FIX:/, 'Then the message includes a fix suggestion')
        t.end()
    })

    t.end()
})

t.test('Given a JSX file with onClick and ActionRegistry.register', t => {
    t.test('When ActionRegistry.register is called in the file', t => {
        const code = `ActionRegistry.register({ id: 'click', execute: handleClick })
const Foo = () => <button onClick={handleClick}>Go</button>`
        const ast = parseCode(code)
        const violations = checkRequireActionRegistry(ast, code, 'Component.jsx')

        const v = violations.find(v => v.message.includes('onClick'))
        t.notOk(v, 'Then no onClick violation is detected')
        t.end()
    })

    t.end()
})

// ----- Check 2: onKeyDown without ActionRegistry -----

t.test('Given a JSX file with onKeyDown but no ActionRegistry', t => {
    t.test('When onKeyDown is used without ActionRegistry.register', t => {
        const code = `const Foo = () => <input onKeyDown={handleKey} />`
        const ast = parseCode(code)
        const violations = checkRequireActionRegistry(ast, code, 'Component.jsx')

        const v = violations.find(v => v.message.includes('onKeyDown'))
        t.ok(v, 'Then an onKeyDown violation is detected')
        t.match(v.message, /ActionRegistry/, 'Then the message mentions ActionRegistry')
        t.end()
    })

    t.end()
})

t.test('Given a JSX file with onKeyDown and ActionRegistry.register', t => {
    t.test('When ActionRegistry.register is called in the file', t => {
        const code = `ActionRegistry.register({ id: 'keydown', execute: handleKey })
const Foo = () => <input onKeyDown={handleKey} />`
        const ast = parseCode(code)
        const violations = checkRequireActionRegistry(ast, code, 'Component.jsx')

        const v = violations.find(v => v.message.includes('onKeyDown'))
        t.notOk(v, 'Then no onKeyDown violation is detected')
        t.end()
    })

    t.end()
})

// ----- Check 3: Hardcoded key names -----

t.test('Given a JSX file with a hardcoded key name outside allowed context', t => {
    t.test('When Escape is used in a comparison', t => {
        const code = `const Foo = () => {
    const handleKey = e => { if (e.key === 'Escape') close() }
    return <div onKeyDown={handleKey}>modal</div>
}`
        const ast = parseCode(code)
        const violations = checkRequireActionRegistry(ast, code, 'Component.jsx')

        const v = violations.find(v => v.message.includes('Escape'))
        t.ok(v, 'Then a hardcoded key violation is detected')
        t.match(v.message, /keymap system/, 'Then the message mentions keymap system')
        t.match(v.message, /FIX:/, 'Then the message includes a fix suggestion')
        t.end()
    })

    t.end()
})

t.test('Given a JSX file with a hardcoded key name inside ActionRegistry.register callback', t => {
    t.test('When ArrowDown is used inside the execute function', t => {
        const code = `ActionRegistry.register({
    id: 'navigate',
    execute: () => { if (direction === 'ArrowDown') goDown() }
})
const Foo = () => <div>nav</div>`
        const ast = parseCode(code)
        const violations = checkRequireActionRegistry(ast, code, 'Component.jsx')

        const v = violations.find(v => v.message.includes('ArrowDown'))
        t.notOk(v, 'Then no hardcoded key violation is detected inside ActionRegistry callback')
        t.end()
    })

    t.end()
})

t.test('Given a JSX file with a hardcoded key name inside DEFAULT_BINDINGS', t => {
    t.test('When ArrowDown appears as a property value in DEFAULT_BINDINGS', t => {
        const code = `const DEFAULT_BINDINGS = { ArrowDown: 'navigate:down', Enter: 'confirm' }
const Foo = () => <div>nav</div>`
        const ast = parseCode(code)
        const violations = checkRequireActionRegistry(ast, code, 'Component.jsx')

        const v = violations.find(v => v.message.includes('ArrowDown') || v.message.includes('Enter'))
        t.notOk(v, 'Then no hardcoded key violation is detected inside DEFAULT_BINDINGS')
        t.end()
    })

    t.end()
})

// ----- Check 3b: .key / .code member access -----

t.test('Given a JSX file with e.key access outside allowed context', t => {
    t.test('When e.key is used in a comparison (variable name is e, not event)', t => {
        const code = `const Foo = () => {
    const handleKey = e => { if (e.key === 'Enter') submit() }
    return <input onKeyDown={handleKey} />
}`
        const ast = parseCode(code)
        const violations = checkRequireActionRegistry(ast, code, 'Component.jsx')

        const v = violations.find(v => v.message.includes('Enter'))
        t.ok(v, 'Then a hardcoded key violation is detected for e.key usage')
        t.end()
    })

    t.end()
})

// ----- Check 3c: Space literal context filtering -----

t.test('Given a JSX file with space string in a comparison context', t => {
    t.test('When space is compared against event.key', t => {
        const code = `const Foo = () => {
    const handleKey = e => { if (e.key === ' ') activate() }
    return <div onKeyDown={handleKey}>item</div>
}`
        const ast = parseCode(code)
        const violations = checkRequireActionRegistry(ast, code, 'Component.jsx')

        const v = violations.find(v => v.message.includes("' '"))
        t.ok(v, 'Then a hardcoded key violation is detected for space in comparison')
        t.end()
    })

    t.end()
})

t.test('Given a JSX file with space string as JSX text content', t => {
    t.test('When space is used as a non-comparison string', t => {
        const code = `const separator = ' '
const Foo = () => <span>{items.join(' ')}</span>`
        const ast = parseCode(code)
        const violations = checkRequireActionRegistry(ast, code, 'Component.jsx')

        const v = violations.find(v => v.message.includes("' '"))
        t.notOk(v, 'Then no violation is detected for space in non-comparison context')
        t.end()
    })

    t.end()
})

// ----- File scope: non-JSX -----

t.test('Given a non-JSX file', t => {
    t.test('When file is a .js file with onClick-like code', t => {
        const code = `const onClick = () => console.log('clicked')`
        const ast = parseCode(code)
        const violations = checkRequireActionRegistry(ast, code, 'module.js')

        t.equal(violations.length, 0, 'Then no violations for non-JSX files')
        t.end()
    })

    t.end()
})

// ----- File scope: test file -----

t.test('Given a test file', t => {
    t.test('When file is a .tap.js file with onClick', t => {
        const code = `const Foo = () => <button onClick={handleClick}>Go</button>`
        const ast = parseCode(code)
        const violations = checkRequireActionRegistry(ast, code, 'Component.tap.js')

        t.equal(violations.length, 0, 'Then no violations for test files')
        t.end()
    })

    t.end()
})

// ----- Exemption: COMPLEXITY comment -----

t.test('Given a JSX file with COMPLEXITY exemption', t => {
    t.test('When COMPLEXITY comment exempts require-action-registry', t => {
        const code = `// COMPLEXITY: require-action-registry — focused-input handling
const Foo = () => <button onClick={handleClick}>Go</button>`
        const ast = parseCode(code)
        const violations = checkRequireActionRegistry(ast, code, 'Component.jsx')

        t.equal(violations.length, 0, 'Then no violations when exempted')
        t.end()
    })

    t.end()
})
