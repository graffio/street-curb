# F103 Coding Standards Checker Implementation

**Date:** 2025.07.28  
**Purpose:** Simple A001 violation detection tool for single file processing

## Technical Architecture

### **Core Components**
```
tools/
├── cli.js                     # CLI entry point with yargs
├── lib/
│   ├── api.js                 # Main checker API (testable)
│   ├── parser.js              # Acorn AST parsing with JSX
│   ├── rules/                 # Individual violation rules
│   │   ├── line-length.js     # 120 character limit
│   │   ├── indentation.js     # Single level indentation 
│   │   ├── if-else.js         # Early return preference
│   │   ├── sig-annotations.js # @sig requirement checker
│   │   ├── braces.js          # Unnecessary braces removal
│   │   └── functions.js       # Function organization rules
│   └── violations.js          # Violation data structures
```

### **Data Flow**
1. **CLI Input** - Single file path via yargs
2. **API Processing** - Parse file and run all rules
3. **JSON Output** - Structured violations for LLM consumption

## API Specifications

### **Main API Interface**
```javascript
// lib/api.js
/**
 * Check single file for A001 violations
 * @sig checkFile :: String -> Promise<CheckResult>
 *     CheckResult = { filePath: String, violations: [Violation], isCompliant: Boolean }
 *     Violation = { type: String, line: Number, column: Number, message: String, rule: String }
 */
export const checkFile = async (filePath) => {
    const sourceCode = await readFile(filePath, 'utf8')
    const ast = parseCode(sourceCode)
    const violations = runAllRules(ast, sourceCode, filePath)
    
    return {
        filePath,
        violations,
        isCompliant: violations.length === 0
    }
}
```

### **Individual Rule Interface**
```javascript
/**
 * Standard rule interface for violation detection
 * @sig checkRule :: (AST, String, String) -> [Violation]
 */
export const checkRule = (ast, sourceCode, filePath) => {
    // Return array of violations found
}
```

### **CLI Interface**
```bash
# Simple usage
node tools/cli.js src/components/MyComponent.jsx

# JSON output
{
  "filePath": "src/components/MyComponent.jsx",
  "isCompliant": false,
  "violations": [
    {
      "type": "line-length",
      "line": 42,
      "column": 121,
      "message": "Line exceeds 120 character limit",
      "rule": "line-length"
    }
  ]
}
```

## Violation Detection Rules

### **Rule Priority Order**
1. **Line length** (120 characters) - Regex-based
2. **Multiple indentation** - AST-based function nesting detection
3. **If/else patterns** - AST-based IfStatement with alternate
4. **Missing @sig annotations** - Comment parsing for exported functions
5. **Unnecessary braces** - AST-based single-statement blocks
6. **Function organization** - Declaration before use validation

### **Parser Configuration**
```javascript
// lib/parser.js
import { Parser } from 'acorn'
import jsx from 'acorn-jsx'

export const parseCode = (sourceCode) => {
    return Parser.extend(jsx()).parse(sourceCode, {
        ecmaVersion: 2022,
        sourceType: 'module',
        locations: true,
        preserveComments: true
    })
}
```

## JSON Output Format

### **Compliant File**
```json
{
  "filePath": "src/utils/segments.js",
  "isCompliant": true,
  "violations": []
}
```

### **File with Violations**
```json
{
  "filePath": "src/components/BadComponent.jsx",
  "isCompliant": false,
  "violations": [
    {
      "type": "line-length",
      "line": 15,
      "column": 121,
      "message": "Line exceeds 120 character limit",
      "rule": "line-length"
    },
    {
      "type": "nested-indentation",
      "line": 25,
      "column": 12,
      "message": "Function has multiple indentation levels - use early returns",
      "rule": "indentation"
    },
    {
      "type": "missing-sig",
      "line": 10,
      "column": 1,
      "message": "Exported function missing @sig annotation",
      "rule": "sig-annotations"
    }
  ]
}
```

## Development Approach

### **TDD Rule Development**
Each rule follows this pattern:
1. **Red**: Write failing test for specific violation
2. **Green**: Implement minimal detection logic
3. **Refactor**: Optimize and handle edge cases

### **API Testing Strategy**
```javascript
// test/api.tap.js - Test the main API
t.test('Given a file with A001 violations', async t => {
    await t.test('When checking the file', async t => {
        const result = await checkFile('test/fixtures/violations.js')
        t.notOk(result.isCompliant, 'Then file is not compliant')
        t.ok(result.violations.length > 0, 'Then violations are detected')
    })
})
```

### **Individual Rule Testing**
```javascript
// test/rules/line-length.tap.js - Test individual rules
t.test('Given a line over 120 characters', async t => {
    await t.test('When checking line length', async t => {
        const code = 'const veryLongLine = "' + 'x'.repeat(100) + '"'
        const violations = checkLineLength(null, code, 'test.js')
        t.equal(violations.length, 1, 'Then one violation is detected')
    })
})
```