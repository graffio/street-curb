import tap from 'tap'

const hasOwn = (k, o) => Object.prototype.hasOwnProperty.call(o, k)

/*
 * Include obj's 'ownProperties' that are NOT in names
 * @sig omit :: ([String], {k:v}) -> {k:v}
 */
const omit = function omit(names, obj) {
    const shouldOmitKey = {}
    const length = names.length

    for (let i = 0; i < length; i++) shouldOmitKey[names[i]] = 1

    const result = {}
    for (const prop in obj) if (!shouldOmitKey[prop] && hasOwn(prop, obj)) result[prop] = obj[prop]
    return result
}

// ---------------------------------------------------------------------------------------------------------------------
// Add assertions to Tap
// ---------------------------------------------------------------------------------------------------------------------

// reverse to put the message first simply to make the tests more legible
tap.Test.prototype.addAssert('okR', 2, function okR(message, b) {
    this.ok(b, message)
})
tap.Test.prototype.addAssert('notOkR', 2, function notOkR(message, b) {
    this.notOk(b, message)
})
tap.Test.prototype.addAssert('sameR', 3, function sameR(message, a, b) {
    this.same(b, a, message)
})
tap.Test.prototype.addAssert('equalR', 3, function equalR(message, a, b) {
    this.equal(b, a, message)
})
tap.Test.prototype.addAssert('throwsR', 3, function throwsR(message, f, err) {
    this.throws(f, err, message)
})

/*
 * Calling f() is supposed to throw an error whose message matches regex
 * If it doesn't fail or fails for a reason that doesn't match the regex, the test fails
 */
tap.Test.prototype.addAssert('throws2', 3, async function throws2(message, f, regex) {
    try {
        await f()
        this.fail(`Should have thrown error, but didn't: ${message}`)
    } catch (e) {
        if (e.message.match(regex)) this.pass(message)
        else {
            const s = `${message}: expected error message ${regex} but found /${e.message}/`
            this.fail(s)
        }
    }
})

tap.Test.prototype.addAssert('matchR', 3, function matchR(message, a, b, err) {
    this.match(a, b, message)
})
tap.Test.prototype.addAssert('approximately', 4, function approximately(message, epsilon, a, expected) {
    return Math.abs(a - expected) <= epsilon
        ? this.pass(message)
        : this.fail(`${message}; found ${a} expected ${expected}`)
})

/*
 * Compare a and b after first removing the keys from a and b. If a and b are arrays, flatten one level and compare
 */
tap.Test.prototype.addAssert('sameIgnoringKeys', 4, function sameIgnoringKeys(message, keys, a, b) {
    if (!Array.isArray(b)) return this.same(omit(keys, b), omit(keys, a), message)

    // arrays: omit keys from each entry
    a = a.map(o => omit(keys, o))
    b = b.map(o => omit(keys, o))
    this.same(b, a, message)
})

/*
 * Compare a and b after first removing id key from a and b. If a and b are arrays, flatten one level and compare
 */
tap.Test.prototype.addAssert('sameIgnoringId', 3, function sameIgnoringId(message, a, b) {
    this.sameIgnoringKeys(message, ['id'], a, b)
})

/*
 * TAP format allows comments to be added anywhere, and by adding a comment inside a subtest before we
 * call the test function, we can force node-tap to output subtests in a more reasonably-nested order
 *
 * For instance, in this example, without the extra comment, node-tap would generate this output
 * (with this ordering and indentation). Here the "severity" lines would be errors thrown by Firebase:
 *
 *    # Subtest: Given that Jeff tries to create a new organization O
 *    {"severity":"INFO","message":"Adding /organizations/...
 *    {"severity":"INFO","message":"Adding user 3e4637e1-0...
 *    {"severity":"INFO","message":"Adding organizations/8...
 *    {"severity":"INFO","message":"Removing /organization...
 *      # Subtest: Success
 *        # Subtest: When Jeff creates organization O
 *          ok 1 - Then A should have permissions for O
 *          ok 2 - Then O should exist and have correct contents
 *          ok 3 - And A should have Admin organization role
 *
 * By adding this "force tap output" comment, we can force node-tap to output the severity lines in the "proper" order:
 *
 *    # Subtest: Given that Jeff tries to create a new organization O
 *       # Subtest: Success
 *         # Subtest: When Jeff creates organization O
 *           # force tap output
 *    {"severity":"INFO","message":"Adding /organizations/...
 *    {"severity":"INFO","message":"Adding user 3e4637e1-...
 *    {"severity":"INFO","message":"Adding organizations/...
 *    {"severity":"INFO","message":"Removing /organizatio...
 *           ok 1 - Then A should have permissions for O
 *           ok 2 - Then O should exist and have correct contents
 *           ok 3 - And A should have Admin organization role
 *
 * Later, we can reformat the severity lines to indent those as well
 */
const runOne = (testFunction, t) => {
    const f = () => {
        t.comment('force tap output')
        return testFunction(t)
    }

    const result = f()
    return Promise.resolve(result)
}

/*
 * Run tap tests using a hierarchical object where each key is the name of a test and each value is EITHER:
 *
 * - a tap test
 * - another such hierarchical object
 *
 * As it happens, if you return a Promise from a Tap test (or consequently if it's async),
 * then test.end() will be called automatically when the promise resolves (or fail if the Promise rejects).
 *
 * @sig describeTests :: (Object, TapTest) -> Promise [TapTest]
 */
const describeTests = (descriptor, t = tap) => {
    /*
     * Process a key/value where the key is the description and the value could be a test or
     * a recursive object containing more key/value
     */
    const processTest = x => {
        const [description, childTestsOrFunction] = x
        t.test(description, t1 =>
            typeof childTestsOrFunction === 'function'
                ? runOne(childTestsOrFunction, t1) // run an actual test
                : describeTests(childTestsOrFunction, t1),
        ) // no: recurse!
    }

    return Promise.all(Object.entries(descriptor).map(processTest))
}

tap.describeTests = describeTests

tap.stringify = o =>
    JSON.stringify(o)
        .replace(/"([^"]*)":/g, '$1: ')
        .replace(/,/g, ', ')

export default tap
