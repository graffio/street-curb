import range from './range.js'

// Apply fn to seed N times, returning final value
// @sig iterate :: (Number, (a -> a), a) -> a
const iterate = (n, fn, seed) => range(0, n).reduce((acc, _) => fn(acc), seed)

export default iterate
