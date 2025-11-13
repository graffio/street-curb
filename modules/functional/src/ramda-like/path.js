/**
 * Retrieve the value at a given path. Partially applied.
 * Path can be either an array of strings, or a single string delimited by '.' characters
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
 */
const path = path => {
    const fields = typeof path === 'string' ? path.split('.') : path

    return o => {
        if (path.length === 0) return o // special case; just return the whole thing

        let result = o
        let descendents = fields

        while (descendents.length) {
            result = result[descendents[0]]
            descendents = descendents.slice(1)
        }

        return result
    }
}

export default path
