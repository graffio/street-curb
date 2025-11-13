/**
 * Performs left-to-right function composition. The leftmost function may have
 * any arity; the remaining functions must be unary.
 *
 * In some libraries this function is named `sequence`.
 *
 * **Note:** The result of pipe is not automatically curried.
 *
 * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> ((a, b, ..., n) -> z)
 * @symb pipe(f, g, h)(a, b) = h(g(f(a, b)))
 * @param {...Function} functions
 * @return {Function}
 * @example
 *
 *      conxt f = R.pipe(Math.pow, R.negate, R.inc);
 *      f(3, 4); // -(3^4) + 1
 *
 * Notes:
 *
 * This version differs from the Ramda version:
 *
 * - no currying at all
 * - this version simply iterates over each function in turn (using a *for loop*!);
 *   the Ramda version is defined recursively so that each successive function is pushed down into
 *   a single function using closures that works as if you had literally called h(g(f(a,b)))l
 */
const pipe =
    (...functions) =>
    (...args) => {
        let nextFunctionInPipe = functions[0]
        let result = nextFunctionInPipe(...args)

        // iterate over the functions using the result of one as the input to the next
        for (let i = 1; i < functions.length; i++) {
            nextFunctionInPipe = functions[i]
            result = nextFunctionInPipe(result)
        }

        return result
    }

export default pipe
