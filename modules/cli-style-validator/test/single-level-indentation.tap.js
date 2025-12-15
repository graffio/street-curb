import t from 'tap'
import { checkSingleLevelIndentation } from '../src/lib/rules/single-level-indentation.js'
import { parseCode } from '../src/lib/parser.js'

t.test('Given a function with nested indentation violations', t => {
    t.test('When the function contains nested if statements', t => {
        const code = `const processData = (data) => {
            if (data) {
                if (data.length > 0) {
                    return data.filter(item => item.active)
                }
            }
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected')
        t.equal(
            violations[0].type,
            'single-level-indentation',
            'Then the violation type should be single-level-indentation',
        )
        t.equal(violations[0].rule, 'single-level-indentation', 'Then the rule field should be set correctly')
        t.match(violations[0].message, /nested indentation/i, 'Then the message should mention nested indentation')
        t.end()
    })

    t.test('When the function contains nested for loops', t => {
        const code = `const processMatrix = (matrix) => {
            for (let i = 0; i < matrix.length; i++) {
                for (let j = 0; j < matrix[i].length; j++) {
                    matrix[i][j] = matrix[i][j] * 2
                }
            }
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected for the nested loop')
        t.match(violations[0].message, /nested indentation/i, 'Then the message should mention nested indentation')
        t.end()
    })

    t.test('When the function contains nested while loops', t => {
        const code = `const processQueue = (queue) => {
            while (queue.length > 0) {
                const item = queue.shift()
                while (item.pending) {
                    item.process()
                }
            }
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected for the nested while loop')
        t.end()
    })

    t.test('When the function contains multiple levels of nesting', t => {
        const code = `const complexFunction = (data) => {
            if (data) {
                for (let item of data) {
                    if (item.active) {
                        console.log(item)
                    }
                }
            }
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 2, 'Then two violations should be detected')
        t.equal(
            violations[0].type,
            'single-level-indentation',
            'Then the first violation should be single-level-indentation',
        )
        t.equal(
            violations[1].type,
            'single-level-indentation',
            'Then the second violation should be single-level-indentation',
        )
        t.end()
    })

    t.test('When the function contains a nested switch statement', t => {
        const code = `const handleEvent = (event) => {
            if (event) {
                switch (event.type) {
                    case 'click':
                        handleClick()
                        break
                    case 'hover':
                        handleHover()
                        break
                }
            }
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected for the nested switch')
        t.end()
    })

    t.end()
})

t.test('Given a function with proper single-level indentation', t => {
    t.test('When the function uses early returns instead of nesting', t => {
        const code = `const processData = (data) => {
            if (!data) return null
            if (data.length === 0) return []
            
            return data.filter(item => item.active)
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.test('When the function contains only single-level if statements', t => {
        const code = `const handleClick = (event) => {
            if (event.shiftKey) doShiftClick()
            if (event.ctrlKey) doCtrlClick()
            if (event.altKey) doAltClick()
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected')
        t.end()
    })

    t.end()
})

t.test('Given a function with allowed nesting patterns', t => {
    t.test('When the function contains try-catch blocks with nested statements', t => {
        const code = `const handleError = (operation) => {
            try {
                if (operation.risky) {
                    operation.execute()
                }
            } catch (error) {
                if (error.recoverable) {
                    error.recover()
                }
            }
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for nesting inside try-catch')
        t.end()
    })

    t.test('When the function contains nested object literals', t => {
        const code = `const createConfig = (options) => {
            return {
                database: {
                    host: options.host,
                    port: options.port,
                    credentials: {
                        username: options.user,
                        password: options.pass
                    }
                }
            }
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for nested object literals')
        t.end()
    })

    t.test('When the React component contains nested JSX elements', t => {
        const code = `const MyComponent = ({ items }) => {
            return (
                <div>
                    {items.map(item => (
                        <div key={item.id}>
                            <span>{item.name}</span>
                            <button onClick={() => handleClick(item)}>
                                Click me
                            </button>
                        </div>
                    ))}
                </div>
            )
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for nested JSX elements')
        t.end()
    })

    t.end()
})

t.test('Given functions with multi-line unnamed function violations', t => {
    t.test('When an arrow function callback is longer than 1 line', t => {
        const code = `const processData = (items) => {
            return items.map(item => {
                const processed = item.value * 2
                return processed + 1
            })
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected for the multi-line arrow function')
        t.match(
            violations[0].message,
            /multi-line unnamed function/,
            'Then the message should mention multi-line unnamed function',
        )
        t.end()
    })

    t.test('When a function expression callback is longer than 1 line', t => {
        const code = `const processItems = (data) => {
            return data.filter(function(item) {
                const isValid = item.active
                return isValid && item.value > 0
            })
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 1, 'Then one violation should be detected for the multi-line function expression')
        t.end()
    })

    t.test('When there are multiple multi-line unnamed functions', t => {
        const code = `const processAll = (data) => {
            const filtered = data.filter(item => {
                const valid = item.active
                return valid
            })
            const mapped = filtered.map(item => {
                const doubled = item.value * 2
                return doubled
            })
            return mapped
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 2, 'Then two violations should be detected for both multi-line unnamed functions')
        t.end()
    })

    t.end()
})

t.test('Given functions with proper single-line unnamed functions', t => {
    t.test('When arrow function callbacks are single-line', t => {
        const code = `const processData = (items) => {
            return items
                .filter(item => item.active)
                .map(item => item.value * 2)
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for single-line arrow functions')
        t.end()
    })

    t.test('When function expressions are single-line', t => {
        const code = `const processItems = (data) => {
            return data.reduce(function(acc, item) { return acc + item.value }, 0)
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 0, 'Then no violations should be detected for single-line function expressions')
        t.end()
    })

    t.end()
})

t.test('Given a function with nested callback functions', t => {
    t.test('When the callback function contains nested indentation violations', t => {
        const code = `const outerFunction = (data) => {
            if (data) return data.map(item => item.value)
            
            return data.reduce((acc, item) => {
                if (item.valid) {
                    if (item.processed) {
                        return acc + item.value
                    }
                }
                return acc
            }, 0)
        }`
        const ast = parseCode(code)
        const violations = checkSingleLevelIndentation(ast, code, 'test.js')

        t.equal(violations.length, 2, 'Then two violations should be detected')
        const nestedViolation = violations.find(v => v.message.toLowerCase().includes('nested indentation'))
        const unnamedViolation = violations.find(v => v.message.includes('multi-line unnamed function'))
        t.ok(nestedViolation, 'Then one violation should be for nested indentation')
        t.ok(unnamedViolation, 'Then one violation should be for multi-line unnamed function')
        t.end()
    })

    t.end()
})
