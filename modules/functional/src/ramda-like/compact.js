import isNil from './isNil.js'

const notNil = x => !isNil(x)

/*
 * Remove all 'nil' values from a
 * @sig compact :: [A] -> [A]
 */
const compact = a => a.filter(notNil)

export default compact
