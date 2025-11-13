/*
 * Append o to array a, but only if o is not already IN a
 * @sig appendIfMissing :: (A, [*]) -> [*]
 */
const appendIfMissing = (o, a) => (a.includes(o) ? a : a.concat(o))

export default appendIfMissing
