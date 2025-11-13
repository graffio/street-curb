import assocPath from './assoc-path.js'
import equals from './equals.js'
import path from './path.js'

// assocPath only if the new value is different (that is: !equals) from the existing value
const assocPathIfDifferent = (_path, value, o) => {
    const old = path(_path)(o)
    return equals(old, value) ? o : assocPath(_path, value, o)
}

export default assocPathIfDifferent
