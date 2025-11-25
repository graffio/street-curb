/**
 * Retrieve the value at a given path. Partially applied.
 * Path can be either an array of strings, or a single string delimited by '.' characters
 *
 * With 2 parameters, then apply the path immediately to the 2nd one
 * If only 1 parameter is passed, return a (partial) function that will later extract a value using the path
 *
 * @example
 *
 *      R.path(['a', 'b'],     {a: {b: 2}})           =>   2
 *      R.path(['a', 'b'],     {c: {b: 2}})           =>   undefined
 *      R.path(['a', 'b', 0],  {a: {b: [1, 2, 3]}})   =>   1
 *      R.path(['a', 'b', -2], {a: {b: [1, 2, 3]}})   =>   2
 *
 *      R.path(['a.b'],        {a: {b: 2}})           =>   2
 *      R.path(['a.b'],        {c: {b: 2}})           =>   undefined
 *
 * As a partial:
 *
 *      R.path(['a.b'])   =>  ({a: {b: 2}})           => 2
 *
 */
const path = (path, o) => {
    const valueAtPath = o => {
        if (path.length === 0) return o // special case; just return the whole thing

        let result = o
        let descendants = fields

        while (descendants.length) {
            result = result[descendants[0]]
            descendants = descendants.slice(1)
        }

        return result
    }

    const fields = typeof path === 'string' ? path.split('.') : path
    return o ? valueAtPath(o) : valueAtPath
}

export default path
