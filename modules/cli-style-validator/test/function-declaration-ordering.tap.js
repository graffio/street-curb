import { test } from 'tap'
import { checkFunctionDeclarationOrdering } from '../src/lib/rules/function-declaration-ordering.js'
import { parseCode } from '../src/lib/parser.js'

test('Function declaration ordering rule tests', t => {
    t.test('Given functions are correctly at the block top', t => {
        t.test('When all inner functions are defined before variable declarations', t => {
            const code = `const processData = (data) => {
                const validateUser = user => {
                    if (!user.email) return false
                    if (!user.name || user.name.length < 2) return false
                    return user.isActive !== false
                }
                
                const enrichUserData = user => {
                    const baseData = { ...user, processed: true }
                    const timestamp = new Date().toISOString()
                    return { ...baseData, processedAt: timestamp }
                }
                
                const validUsers = data.filter(validateUser)
                return validUsers.map(enrichUserData)
            }`

            const ast = parseCode(code)
            const violations = checkFunctionDeclarationOrdering(ast, code, 'test.js')

            t.equal(violations.length, 0, 'Then no violations should be detected')
            t.end()
        })
        t.end()
    })

    t.test('Given a function is defined after an executable statement', t => {
        t.test('When the function comes after a filtering operation', t => {
            const code = `const processData = (data) => {
                const validUsers = data.filter(user => user.isActive)
                
                const enrichUserData = user => {
                    const baseData = { ...user, processed: true }
                    const timestamp = new Date().toISOString()
                    return { ...baseData, processedAt: timestamp }
                }
                
                return validUsers.map(enrichUserData)
            }`

            const ast = parseCode(code)
            const violations = checkFunctionDeclarationOrdering(ast, code, 'test.js')

            t.equal(violations.length, 1, 'Then one violation should be detected')
            t.equal(
                violations[0].type,
                'function-declaration-ordering',
                'Then the violation type should be function-declaration-ordering',
            )
            t.match(
                violations[0].message,
                /Arrow function 'enrichUserData' must be defined before hooks/,
                'Then the message should indicate the function should be at the top',
            )
            t.end()
        })
        t.end()
    })

    t.test('Given a function is defined after a variable declaration', t => {
        t.test('When the function comes after a config variable', t => {
            const code = `const processData = (data) => {
                const config = { version: '1.0', includeTimestamp: true }
                
                const enrichUserData = user => {
                    const baseData = { ...user, processed: true }
                    const timestamp = config.includeTimestamp ? new Date().toISOString() : null
                    return timestamp ? { ...baseData, processedAt: timestamp } : baseData
                }
                
                return data.map(enrichUserData)
            }`

            const ast = parseCode(code)
            const violations = checkFunctionDeclarationOrdering(ast, code, 'test.js')

            t.equal(violations.length, 1, 'Then one violation should be detected')
            t.match(
                violations[0].message,
                /Arrow function 'enrichUserData' must be defined before hooks/,
                'Then the message should indicate the arrow function should be at the top',
            )
            t.end()
        })
        t.end()
    })

    t.test('Given single-line anonymous functions are used inline', t => {
        t.test('When the functions are simple arrow functions on one line', t => {
            const code = `const processData = (data) => {
                const validUsers = data.filter(user => user.isActive)
                return validUsers.map(user => ({ ...user, processed: true }))
            }`

            const ast = parseCode(code)
            const violations = checkFunctionDeclarationOrdering(ast, code, 'test.js')

            t.equal(violations.length, 0, 'Then no violations should be detected for single-line functions')
            t.end()
        })
        t.end()
    })

    t.test('Given functions in nested blocks', t => {
        t.test('When a function is defined after a variable in a nested if block', t => {
            const code = `const processData = (data) => {
                if (data.length > 0) {
                    const userCount = data.length
                    
                    const validateAndEnrich = user => {
                        if (!user.email) return null
                        const enriched = { ...user, processed: true, count: userCount }
                        return enriched
                    }
                    
                    return data.filter(user => user.isActive).map(validateAndEnrich)
                }
                return []
            }`

            const ast = parseCode(code)
            const violations = checkFunctionDeclarationOrdering(ast, code, 'test.js')

            t.equal(violations.length, 1, 'Then one violation should be detected in the nested block')
            t.match(
                violations[0].message,
                /Arrow function 'validateAndEnrich' must be defined before hooks/,
                'Then the message should indicate the function should be at the top of its block',
            )
            t.end()
        })
        t.end()
    })

    t.test('Given regular function declarations', t => {
        t.test('When a function declaration comes after a variable', t => {
            const code = `const processData = (data) => {
                const config = { setting: true }
                
                function helperFunction(item) {
                    return item.processed ? item : { ...item, processed: true }
                }
                
                return data.map(helperFunction)
            }`

            const ast = parseCode(code)
            const violations = checkFunctionDeclarationOrdering(ast, code, 'test.js')

            t.equal(violations.length, 1, 'Then one violation should be detected')
            t.match(
                violations[0].message,
                /Function 'helperFunction' must be defined before hooks/,
                'Then the message should indicate the function should be at the top',
            )
            t.end()
        })
        t.end()
    })

    t.test('Given mixed function types', t => {
        t.test('When both arrow functions and function expressions are misplaced', t => {
            const code = `const processData = (data) => {
                const threshold = 5
                
                const filterItems = item => item.value > threshold
                
                const processItem = function(item) {
                    return { ...item, processed: true }
                }
                
                return data.filter(filterItems).map(processItem)
            }`

            const ast = parseCode(code)
            const violations = checkFunctionDeclarationOrdering(ast, code, 'test.js')

            t.equal(violations.length, 2, 'Then two violations should be detected')
            t.match(
                violations[0].message,
                /Arrow function 'filterItems'/,
                'Then the first violation should be for the arrow function',
            )
            t.match(
                violations[1].message,
                /Function 'processItem'/,
                'Then the second violation should be for the function expression',
            )
            t.end()
        })
        t.end()
    })

    t.test('Given an empty AST', t => {
        t.test('When the AST is null', t => {
            const violations = checkFunctionDeclarationOrdering(null, '', 'test.js')

            t.equal(violations.length, 0, 'Then no violations should be detected')
            t.end()
        })
        t.end()
    })

    t.end()
})
