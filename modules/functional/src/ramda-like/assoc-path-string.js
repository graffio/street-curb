import assocPath from './assoc-path.js'

/**
 * Identical to assocPath, but path is a string with elements separated by '.'
 *
 *      R.assocPathString('a.b.c'], 42, {a: {b: {c: 0}}}); //=> {a: {b: {c: 42}}}
 *
 *      // Any missing or non-object keys in path will be overridden
 *      R.assocPathString(['a.b.c'], 42, {a: 5}); //=> {a: {b: {c: 42}}}
 */
const assocPathString = (path, val, obj) => assocPath(path.split('.'), val, obj)

export default assocPathString
