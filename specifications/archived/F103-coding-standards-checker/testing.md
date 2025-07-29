# F103 Coding Standards Checker Testing

**Date:** 2025.07.28  
**Purpose:** Test strategy for temporary A001 violation detection tool

## Test Strategy

### **TDD Approach**
- **Red-Green-Refactor** cycle for each violation rule
- **Rule-by-rule development** - implement one violation type at a time
- **Integration tests** for complete tool functionality
- **Regression tests** using existing compliant codebase

### **Test Categories**
1. **Unit tests** - Individual violation rules in isolation
2. **Integration tests** - Complete CLI tool with file processing
3. **Regression tests** - Verify no false positives on existing code
4. **Performance tests** - Large file and directory handling

## Test Scenarios

### **Line Length Violations**
```javascript
// test/rules/line-length.tap.js
t.test('Line length violation detection', async t => {
    await t.test('Given a file with lines over 120 characters', async t => {
        await t.test('When checking line length', async t => {
            const code = 'const veryLongVariableName = "this is an extremely long string that exceeds the 120 character limit for sure"'
            const violations = checkLineLength(null, code, 'test.js')
            
            t.equal(violations.length, 1, 'Then one violation is detected')
            t.equal(violations[0].type, 'line-length', 'Then violation type is line-length')
            t.equal(violations[0].line, 1, 'Then violation is on line 1')
        })
    })
    
    await t.test('Given a file with lines under 120 characters', async t => {
        await t.test('When checking line length', async t => {
            const code = 'const shortVar = "short string"'
            const violations = checkLineLength(null, code, 'test.js')
            
            t.equal(violations.length, 0, 'Then no violations are detected')
        })
    })
})
```

### **Indentation Violations**
```javascript
// test/rules/indentation.tap.js  
t.test('Single indentation level enforcement', async t => {
    await t.test('Given a function with nested conditionals', async t => {
        await t.test('When checking indentation levels', async t => {
            const code = `
const badFunction = () => {
    if (condition1) {
        if (condition2) {
            doSomething()
        }
    }
}`
            const ast = parseCode(code)
            const violations = checkIndentation(ast, code, 'test.js')
            
            t.equal(violations.length, 1, 'Then one indentation violation is detected')
            t.equal(violations[0].type, 'nested-indentation', 'Then violation type is nested-indentation')
            t.match(violations[0].message, /multiple indentation levels/, 'Then message mentions indentation')
        })
    })
    
    await t.test('Given a function with single indentation level', async t => {
        await t.test('When checking indentation levels', async t => {
            const code = `
const goodFunction = () => {
    if (!condition1) return
    if (!condition2) return
    doSomething()
}`
            const ast = parseCode(code)
            const violations = checkIndentation(ast, code, 'test.js')
            
            t.equal(violations.length, 0, 'Then no violations are detected')
        })
    })
})
```

### **If/Else Pattern Violations**
```javascript
// test/rules/if-else.tap.js
t.test('If/else pattern detection', async t => {
    await t.test('Given a function with if/else blocks', async t => {
        await t.test('When checking for early return patterns', async t => {
            const code = `
const processData = (data) => {
    if (data) {
        return processValidData(data)
    } else {
        return handleInvalidData()
    }
}`
            const ast = parseCode(code)
            const violations = checkIfElse(ast, code, 'test.js')
            
            t.equal(violations.length, 1, 'Then one if/else violation is detected')
            t.equal(violations[0].type, 'if-else-block', 'Then violation type is if-else-block')
            t.match(violations[0].message, /early return/, 'Then message suggests early returns')
        })
    })
})
```

### **@sig Annotation Violations**
```javascript
// test/rules/sig-annotations.tap.js
t.test('@sig annotation requirement', async t => {
    await t.test('Given an exported function without @sig', async t => {
        await t.test('When checking @sig annotations', async t => {
            const code = `
export const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.price, 0)
}`
            const ast = parseCode(code)
            const violations = checkSigAnnotations(ast, code, 'test.js')
            
            t.equal(violations.length, 1, 'Then one @sig violation is detected')
            t.equal(violations[0].type, 'missing-sig', 'Then violation type is missing-sig')
            t.match(violations[0].message, /@sig annotation/, 'Then message mentions @sig requirement')
        })
    })
    
    await t.test('Given an exported function with @sig', async t => {
        await t.test('When checking @sig annotations', async t => {
            const code = `
/**
 * Calculates total price of items
 * @sig calculateTotal :: ([Item]) -> Number
 */
export const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.price, 0)
}`
            const ast = parseCode(code)
            const violations = checkSigAnnotations(ast, code, 'test.js')
            
            t.equal(violations.length, 0, 'Then no violations are detected')
        })
    })
})
```

### **CLI Integration Tests**
```javascript
// test/cli-integration.tap.js
t.test('CLI integration', async t => {
    await t.test('Given a file with multiple violations', async t => {
        await t.test('When running check-a001 CLI', async t => {
            const testFile = 'test/fixtures/violations.js'
            const result = await runCLI(['tools/check-a001.js', testFile])
            
            t.equal(result.exitCode, 1, 'Then CLI exits with error code')
            t.match(result.stdout, /line-length/, 'Then output includes line-length violations')
            t.match(result.stdout, /indentation/, 'Then output includes indentation violations')
        })
    })
    
    await t.test('Given a compliant file', async t => {
        await t.test('When running check-a001 CLI', async t => {
            const testFile = 'src/utils/segments.js' // Known compliant file
            const result = await runCLI(['tools/check-a001.js', testFile])
            
            t.equal(result.exitCode, 0, 'Then CLI exits successfully')
            t.match(result.stdout, /No violations found/, 'Then output indicates no violations')
        })
    })
})
```

## Success Criteria

### **Rule Accuracy**
- [ ] Zero false positives on existing A001-compliant codebase
- [ ] 100% detection rate for known violation patterns
- [ ] Correct line number reporting for all violations
- [ ] Clear, actionable violation messages

### **Performance Benchmarks**
- [ ] Process entire src/ directory in under 2 seconds
- [ ] Handle files up to 1000 lines without memory issues
- [ ] Concurrent file processing for large codebases

### **Integration Requirements**
- [ ] CLI returns appropriate exit codes (0 = success, 1 = violations found)
- [ ] JSON output format compatible with CI/CD systems
- [ ] Git pre-commit hook integration works correctly

## Test Data

### **Violation Test Fixtures**
```javascript
// test/fixtures/line-length-violations.js
const thisIsAnExtremelyLongVariableNameThatDefinitelyExceedsTheOneHundredTwentyCharacterLimitAndShouldBeDetected = true

// test/fixtures/indentation-violations.js  
const badFunction = () => {
    if (condition) {
        if (nested) {
            deeply()
        }
    }
}

// test/fixtures/if-else-violations.js
const processUser = (user) => {
    if (user.isActive) {
        return activateUser(user)
    } else {
        return deactivateUser(user)
    }
}
```

### **Compliant Test Fixtures**
```javascript
// test/fixtures/compliant-code.js
/**
 * Processes user activation based on status
 * @sig processUser :: (User) -> ProcessedUser
 */
const processUser = (user) => {
    if (!user.isActive) return deactivateUser(user)
    return activateUser(user)
}

export { processUser }
```

## Regression Testing

### **Continuous Validation**
- Run checker against existing codebase after each rule implementation
- Maintain whitelist of known compliant files for regression testing
- Track performance metrics to detect degradation