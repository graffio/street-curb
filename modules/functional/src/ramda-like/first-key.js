/*
 * Return the first key of o. It should probably be the ONLY key of o because the order of keys in not defined in JS
 * @sig firstKey :: {k:v} -> String
 */
const firstKey = o => Object.keys(o)[0]

export default firstKey
