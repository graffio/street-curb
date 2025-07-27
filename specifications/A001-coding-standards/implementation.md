# JavaScript Functional Style Guide

## Core Principles
1. Embrace functional programming paradigms.
2. Prioritize code clarity and simplicity.
3. Maintain consistent formatting and naming conventions.

## Functional Programming
- NEVER use object-oriented keywords like `Class` or `new`.
- ALWAYS prefer `map`, `reduce`, `filter` over imperative loops.
- BREAK DOWN complex operations into smaller, single-purpose functions.
- USE early returns and guard clauses to reduce nesting.
- USE our home-grown functional library (derived from RAMDA) in @functional
    - Unlike Ramda, 'functional' doesn't curry its arguments and has no currying/uncurrying functions
- NEVER mutate values directly. Instead, create new ones using functions like 'assoc'.
  Example: Use `o = assoc('a', 4, o)` instead of `o.a = 4`.

## CRITICAL: NO TYPESCRIPT EVER
- This project uses PLAIN JAVASCRIPT ONLY
- If you suggest TypeScript, .ts files, or TypeScript syntax, you are making an error
- When other examples online use TypeScript, convert them to plain JavaScript
- React components should be .jsx files with plain JavaScript syntax
- React props should be documented with PropTypes if the function is exported, otherwise with Hindley-Milner style
- Never mention "types" in the context of TypeScript - use runtime validation instead

### Type Documentation (Not TypeScript)
- USE @sig comments with Hindley-Milner notation; this format is further specified later
- NEVER use JSDoc type annotations
- NEVER use TypeScript type annotations

### Runtime Validation (Not TypeScript)
- USE PropTypes for React component props
- USE our home-grown tagged and / or taggedSum functions for runtime type checking (see @tagged-type.js for more information, especially the comments)
- USE runtime assertions for critical data validation
- NEVER use TypeScript for type checking

## Use our home-grown tagged and taggedSum library defined in @tagged-type.js
## Use yarn not npm

## Security
- VALIDATE all inputs at boundaries
- SANITIZE data before database operations
- USE environment variables for secrets
- NEVER commit sensitive data
- PREFER immutable data structures to prevent accidental mutations

## File Extensions
- ALWAYS use .js for JavaScript files
- ALWAYS use .jsx for React components
- NEVER suggest .ts or .tsx extensions
- NEVER mention tsconfig.json or TypeScript configuration

## Formatting and Structure
- STRICTLY adhere to a maximum line length of 120 characters.
- USE 4 spaces for indentation.
- LIMIT functions to a single level of indentation.
- DEFINE all inner functions at the top of their containing function.
- DEFINE functions before use, with main function(s) at the end of the file.

- ALWAYS Remove unnecessary parens and braces

    ❌ AVOID THIS
    ```
        if (a) {
            b()
        }
    ```
    ✅ DO THIS INSTEAD
    ```
        if (a) b()
    ```

## Error Handling and Asynchronous Operations
- NEVER throw exceptions in pure functions
- USE try/catch only at boundaries (API calls, file I/O)
- PREFER async/await over raw promises.
- ALWAYS handle Promise rejections explicitly

## Tooling and Quality
- USE ESLint with functional programming rules
- USE Prettier for consistent formatting
- CONFIGURE pre-commit hooks for linting
- IMPLEMENT automated testing (prefer pure function testing).
- USE `tap` command for testing (node-tap package), not Jest
- Test files: `test/*.tap.js` pattern
- Run tests with: `tap test/filename.tap.js` or `tap test/`

## Testing with node-tap
- PREFER testing pure functions (easy to test)
- AVOID mocking when possible - test with real pure functions
- WRITE tests that verify @sig contracts
- ALWAYS write tests that act as documentation, using Given/When/Then
     
    ❌ AVOID THIS
    ```  
      t.same(processAddSegment([], 240), 20, "processAddSegment returns 20")
    ```
    ✅ DO THIS INSTEAD
    ```
        t.test('Given a user clicks "Add First Segment"', t => {
            t.test('When there are no segments yet', t => {
                const result = processAddSegment([], 240)
                t.equal(result.segments.length, 20, 'Then one segment of 20 feet is added')
                t.end()
            })
            t.end()
        })
    ```

- RUN tests using `tap` command, not `node test`

```
  yarn tap             // run all tests
  tap test/abc.tap.js  // run a single test
```


- USE proper English and AVOID test descriptions that essentially reproduce code
 
    ❌ AVOID THIS
    ``` 
      t.test('Then should maintain blockfaceLength = sum(segments) + unknownRemaining', ...) 
    ```
    ✅ DO THIS INSTEAD

    ```
      t.test('Then the segment lengths and the remaining unknown length always total to the blockface length', ...)
    ``` 
  
## React Patterns
- NEVER use classes for components
- EXTRACT components when JSX gets complex (>20 lines)
- USE proper dependency arrays in useEffect
- PREFER useCallback/useMemo only when actually needed

## React State Management
- STRONGLY PREFER Redux (via selectors) for stateful logic rather than React useState, hooks or context
- PREFER useState only for truly component-local state
- KEEP components pure - state logic in Redux

## React UI
- ALL components should be based on Radix UI and Radix Themes (and Vanilla Extract)

## Naming Conventions
- USE kebab-case for file names: `parse-qif-file.js` not `Parse QIF.js`.
- INCLUDE only one uppercase character when using abbreviations in names: `parseQifFile` not `parseQIFFile`.

## ECMAScript and Modules
- USE the latest ECMAScript version.
- USE 'import' syntax, not 'require'.
- USE a single `export` statement at the bottom of each file; avoid `export default`; exporting multiple objects
  with a single export is fine; the point is for the reader to have exactly one place to look to see what's exported

## Functions
- USE arrow functions for anonymous functions.
- CREATE named functions if an anonymous function doesn't fit on one line.
    Pay particular attention to this inside React functions like useEffect -- or other library calls -- 
    that take functions as arguments.

      ❌ AVOID THIS
      ```
        const foo = map(o => {
            return o + 2 
        }, rrr)
        useEffect(() => {
            ...
            abc(foo)
        }, [foo, bar])
      ```

      ✅ DO THIS INSTEAD
      ```
        const add2 = o => o + 2
        const abcOnIncrmentedRs = () => {
            ...
            abc(rrrsIncrementedBy2)
        }
  
        const rrrsIncrementedBy2 = map(add2, rrr)
        useEffect(abcOnIncrmentedRs, [foo, bar])
      ```


- AVOID `if/else` statements. Use ternary operators or early-return functions instead

    ❌ AVOID THIS
    ```
        if (condition) {
            doSomething()
        } else {
            doSomethingElse()
        }
    ```
    ✅ DO THIS INSTEAD
    ```
        if (condition) return doSomething()
        return doSomethingElse()
    ```
    ✅ Or, better, in this case, DO THIS INSTEAD
    ```
        return condition ? doSomething() : doSomethingElse()
    ```

- NEVER use nested ternary operators, CREATE new functions or variables instead
- AVOID switch statements. Use functions with simple `if (x) return y` style instead.

## Guard Clauses and Early Returns
- ALWAYS use guard clauses at the start of the main logic (after nested functions) to handle invalid/null/undefined inputs
- RETURN early for error conditions before main logic
- AVOID deeply nested conditionals by returning early

    ❌ AVOID THIS
    ```
        const process = (data) => {
            if (data) {
                if (data.length > 0) {
                    // main logic here
                }
            }
        }
    ```
    ✅ DO THIS INSTEAD
    ```
        const process = (data) => {
            if (!data) return null
            if (data.length === 0) return []

            // main logic here - no nesting
        }
    ```


## Variables and Data Structures
- USE `const` by default, `let` only when rebinding is necessary. NEVER use `var`.
- USE single quotes for strings unless the string contains single quotes.
- INCLUDE trailing commas in multiline object and array literals.


## Comments and Documentation
- USE // for 1 or 2 line comments; use /* */ for anything longer
- INCLUDE helpful inline comments that explain what specific lines of code do, especially for:
  - Variable purposes (e.g., `// Reference to scrollable container`)
  - Business logic explanations (e.g., `// 50% rule for mouse scrolling`)
  - Non-obvious implementation details (e.g., `// Immediate snap`)
  - Browser behavior overrides (e.g., `// Override browser's default scroll distance`)
- INCLUDE detailed function documentation with @sig type annotations.
- The Hindley-Milner block should be the LAST thing in a function comment
- ALWAYS include a @sig line in function documentation using Hindley-Milner type notation

  A @sig comment should be simple to read, so if the type of an argument isn't a simple word, then create an 
  appropriate alias for it and put the definition below. In the example below `Func` is introduced entirely to 
  make the @sig easier to read. Of course, the introduced name should make sense it its context.
  Note that Func has been indented 4 spaces from the @sig to make it clearer that it's related to the @sig

    ❌ AVOID THIS
    ```
        // @sig map :: (A -> B, [A]) -> [B]
    ``` 
    ✅ DO THIS INSTEAD
    ```
        /*
         * @sig map :: (Func, [A]) -> [B]
         *     Func = A -> B
         */
    ```


## Blank Lines
- Overall: use blank lines to separate logical sections; avoid blank lines that would cause something to look like 
  a section when it isn't one. Multiple declarations are a section; multiple `if` statements MAY be 1 section or many 
  depending on whether they're really defining the same condition. 
  `if` statements with braces are always their own section
- Always put a blank line before any statements (but not function declarations) that include an opening brace

    ❌ AVOID THIS
    ```
        abc()
        if (x) {
        }
    ```    
    ✅ DO THIS INSTEAD
    ```    
        abc()
            
        if (x) {
        }
    ```
    ✅ THIS IS ALSO GOOD with no blank before the second if -- but only because it's clear they are really part of 1 section

    ```
        if (a) b()
        if (c) d()
    ```

- Put a blank line before the first comment of any block of comments

    ❌ AVOID THIS
    ```  
        abc() // comment
        // comment
        def() // comment
        // comment
        // comment
        ghi() // comment
    ```  
    ✅ DO THIS INSTEAD
    ```  
        abc() // comment
      
        // comment
        def() // comment
      
        // comment
        // comment
        ghi() // comment
    ```  


## Documentation (@sig requirements)
- ALWAYS include @sig for all functions at the top-level of a JavaScript file, including, especially, exported functions
- INCLUDE usage examples for non-trivial functions
- the @sig block should be the last thing the function comment

Examples:
```
    /*
     * Process the given users using the given config
     * @sig processUsers :: ([User], Config) -> Promise<[ProcessedUser]>
     *     User = { id: String, name: String, active: Boolean }
     *     Config = { includeInactive: Boolean }
     *     ProcessedUser = { id: String, displayName: String }
     */
```

### Hindley-Milner Type Notation Style
- USE capitalized primitive types: `String`, `Number`, `Boolean`, `Object`, `Array`
- USE `Type?` for optional types, not `Type | undefined`
- PLACE the `?` after the type name in object definitions: `{name: String, age: Number?}`
- NEVER use lowercase primitive types like `string`, `number`, `boolean`
- USE specific string literals when a String is one of a small group of options: `alpha|beta|gamma` rather than `String`
- INCLUDE spaces inside braces for function parameter objects: `{ name: String, age: Number }` not `{name: String, age: Number}`

    ❌ AVOID THIS
    ```
        Config = {
            rowCount: number,
            rowHeight: number,
            overscan?: number,
            enableSnap?: boolean,
            onScroll?: ScrollCallback,
            onRowMount?: RowMountCallback
        }
    ```
    ✅ DO THIS INSTEAD
    ```
        Config = {
            rowCount: Number,
            rowHeight: Number,
            overscan: Number?,
            enableSnap: Boolean?,
            onScroll: ScrollCallback?,
            onRowMount: RowMountCallback?
        }
    ```


## Maniacal preference for short, readable code

- PREFER complete lines of code to 120 characters or fewer, creating new variables or functions to keep lines short
- ALWAYS remove unnecessary braces and other punctuation
- AVOID `for` statements; they should be replaced with a functional equivalent in most cases.
    - Nested `for` statements should be pulled into a new function
- AVOID more than one level of code indentation in a function: a nested `if` is wrong. These are ok to nest:
  - try / catch
  - object literals

    ❌ AVOID THIS
    ```
        const f = () => {
            if (condition1) {
                a()
                b()
                c()
            } else {
                d()
                e()
            }
        }
    ```
    ✅ DO THIS INSTEAD
    ```
        const g = () => {
            a()
            b()
            c()
        }
        
        const h = () => {
            d()
            e()
        }
        
        const f = () => condition1 ? g() : h()
    ```

    ❌ AVOID THIS
    ```
        const f = () => {
            if (condition1) {
                if (condition2)
                    return doSomething2()
                else return doSomething1()
            } else {
                return doSomething3()
            }
        }
    ```
    ✅ DO THIS INSTEAD
    ```
       const f = () => {
           if (condition1 && condition2) return doSomething2()
           if (condition1) return doSomething1()
           return doSomething3()
       }
    ```

    ❌ AVOID THIS
    ```
        return (
            <div>
                {items.map(item => (
                    <div key={item.id}>
                        {item.name}
                    </div>
                ))}
            </div>
        )

    ```
    ✅ DO THIS INSTEAD
    ```
        const f = item => (
            <div key={item.id}>
                {item.name}
            </div>
        )
        
      return (
          <div>
              {items.map(f)}
          </div>
      )
    ```

- FOLLOW the "functions first" rule even when variables are used in helper functions

    ❌ AVOID THIS
     ```
        const processItems = (items, shouldFilter) => {
            let results = []
            if (shouldFilter) {
                for (const item of items) {
                    if (item.active) {
                        results.push(transform(item))
                    }
                }
            } else {
                results = items.map(transform)
            }
            return results
        }
     ```
    ✅ DO THIS INSTEAD
    ```
        const processItems = (items, shouldFilter) => {
            const processFiltered = () => items.filter(item => item.active).map(transform)
            const processAll = () => items.map(transform)
      
            // These variables are declared AFTER the functions but BEFORE they're called
            const transform = item => ({ ...item, processed: true })
      
            return shouldFilter ? processFiltered() : processAll()
        }
    ```

  This example shows:
  1. Functions first: processFiltered and processAll are defined before variables
  2. Variables accessible: The functions can access transform because when they're called, transform has already been declared
  3. No mutation: Uses functional patterns instead of mutating arrays
  4. Clear execution order: Functions are defined → variables are declared → functions are called

## Your behavior

- NEVER guess at an answer; ALWAYS ask me questions about what to do, or about any ambiguities or contradictions in my instructions
- NEVER modify code that isn't directly related to the task at hand; for instance, don't randomly rename variables or change or delete unrelated documentation
- PREFER to answer as briefly as possible
