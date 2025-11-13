/*
 * Convert each element e of a into an object entry with e as the value and FindIdFunction(e) as the key
 * @sig arrayToLookupTable :: (FindIdFunction, [a]) -> { k: a }
 * FindIdFunction = a -> Id
 * Id = String
 */
const arrayToLookupTable = (findIdKeyOrFunction, a) => {
    // string parameter: convert to function that pulls that key from the object
    const findId = typeof findIdKeyOrFunction === 'function' ? findIdKeyOrFunction : o => o[findIdKeyOrFunction]

    const result = {}
    a.forEach(o => (result[findId(o)] = o))
    return result
}

export default arrayToLookupTable
