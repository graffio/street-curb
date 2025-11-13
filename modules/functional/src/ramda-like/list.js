/*
 * @sig map :: (a -> b, [a]) -> b
 */
const map = (fn, functor) => functor.map(fn)

/**
 * Return every element of array for which predicate returns something truthy
 * @sig filter :: (Predicate, [a]) -> [a]
 *  Predicate = a -> Boolean
 */
const filter = (f, a) => a.filter(f)

/**
 * Return every element of array for which predicate returns something falsy
 * @sig reject :: (Predicate, [a]) -> [a]
 *  Predicate = a -> Boolean
 */
const reject = (f, a) => a.filter(a => !f(a))

/**
 * @sig reduce :: (Reducer, [a]) -> b
 *  Reducer = (b, a) -> b
 */
const reduce = (reducer, initial, array) => array.reduce(reducer, initial)

/*
 * Return the last element of a
 * @sig last :: [a] -> a|undefined
 */
const last = a => a[a.length - 1]

/*
 * Return the head of a
 * @sig head :: [a] -> a
 */
const head = a => a[0]

/*
 * Return the tail of a
 * @sig tail :: [a] -> [a]
 */
const tail = a => a.slice(1)

/*
 * Append a to array
 * @sig append :: (a, [a]) -> [a]
 */
const append = (a, array) => array.concat([a])

/**
 * Returns the elements of the given list or string (or object with a `slice`
 * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
 *
 * @func
 * @memberOf R
 * @since v0.1.4
 * @category List
 * @sig Number -> Number -> [a] -> [a]
 * @sig Number -> Number -> String -> String
 * @param {Number} fromIndex The start index (inclusive).
 * @param {Number} toIndex The end index (exclusive).
 * @param {*} list
 * @return {*}
 * @example
 *
 *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
 *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
 *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
 *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
 *      R.slice(0, 3, 'ramda');                     //=> 'ram'
 */
const slice = (fromIndex, toIndex, list) => list.slice(fromIndex, toIndex)

/**
 * Returns the first element of the list which matches the predicate, or
 * `undefined` if no element matches.
 *
 * Dispatches to the `find` method of the second argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> a | undefined
 * @param {Function} predicate The predicate function used to determine if the element is the
 *        desired one.
 * @param {Array} list The array to consider.
 * @return {Object} The element found, or `undefined`.
 * @see R.transduce
 * @example
 *
 *      const xs = [{a: 1}, {a: 2}, {a: 3}];
 *      R.find(R.propEq('a', 2))(xs); //=> {a: 2}
 *      R.find(R.propEq('a', 4))(xs); //=> undefined
 */
const find = (predicate, list) => list.find(predicate)

export { append, head, last, map, filter, reject, find, reduce, slice, tail }
