/*
 * fieldType
 *
 * Define the type of a field in a Tagged constructor.
 *
 *  'String'    <=> { baseType: 'String' }
 *  'String?'   <=> { baseType: 'String', optional: true }
 *  '/abc/'     <=> { baseType: 'String', regex: /abc/ }
 *  '[String]'  <=> { baseType: 'String', arrayDepth: 1 }
 *  'Coord'     <=> { baseType: 'Tagged', taggedType: 'Coord' }
 *
 * Required:
 *
 *   baseType   : String = String|Number|Boolean|Object|Any|Tagged
 *
 * Optional
 *   taggedType : String    name of the Tagged Type expected for this field, eg.: 'Coord'
 *   optional   : Boolean   is the field required?
 *   regex      : RegExp    is there a regex this String field must conform to?
 *   arrayDepth : Number    is this an array of the base type?
 *
 * TODO:
 *   minLength    : Number  minimum length of associated String
 *   maxLength    : Number  maximum length of associated String
 *   minValue     : Number  minimum value of associated Number
 *   maxValue     : Number  maximum value of associated Number
 *
 */

const wrapOptional = (s, optional) => (optional ? s + '?' : s)

const stringMultiply = (s, n) => {
    let result = ''
    for (let i = 0; i < n; i++) result += s
    return result
}

const wrapArray = (s, arrayDepth = 0) => {
    const prefix = stringMultiply('[', arrayDepth)
    const suffix = stringMultiply(']', arrayDepth)

    return prefix + s + suffix
}

const stringToString = ({ optional, regex, arrayDepth }) => {
    let root = regex ? regex.toString() : 'String'
    root = wrapArray(root, arrayDepth)
    return wrapOptional(root, optional)
}

const numberToString = ({ optional, arrayDepth }) => {
    let root = 'Number'
    root = wrapArray(root, arrayDepth)
    return wrapOptional(root, optional)
}

const booleanToString = ({ optional, arrayDepth }) => {
    let root = 'Boolean'
    root = wrapArray(root, arrayDepth)
    return wrapOptional(root, optional)
}

const objectToString = ({ optional, arrayDepth }) => {
    let root = 'Object'
    root = wrapArray(root, arrayDepth)
    return wrapOptional(root, optional)
}

const anyToString = ({ optional, arrayDepth }) => {
    let root = 'Any'
    root = wrapArray(root, arrayDepth)
    return wrapOptional(root, optional)
}

const taggedToString = ({ taggedType, optional, arrayDepth }) => {
    taggedType = wrapArray(taggedType, arrayDepth)
    return wrapOptional(taggedType, optional)
}

const toString = fieldType => {
    const { baseType } = fieldType

    switch (baseType) {
        case 'String':
            return stringToString(fieldType)
        case 'Number':
            return numberToString(fieldType)
        case 'Boolean':
            return booleanToString(fieldType)
        case 'Object':
            return objectToString(fieldType)
        case 'Any':
            return anyToString(fieldType)
        case 'Tagged':
            return taggedToString(fieldType)
        default:
            throw new Error(`Don't understand type ${baseType}`)
    }
}

/*
 * If the last letter is '?' it's optional: strip off the '?' and return the result
 * @sig optional :: String -> [String, Boolean]
 */
const checkOptional = s => (s[s.length - 1] === '?' ? [s.slice(0, -1), true] : [s, false])

const checkRegex = s => {
    // decompose s into expression and flags
    const match = s.match(/\/(.*)\/([dgimsuy]*)/)

    // but it probably isn't a regex in the first place
    if (!match) return false

    const [, expression, flags] = match
    return RegExp(expression, flags)
}

const checkArray = s => {
    let arrayDepth = 0

    while (s.match(/^\[.*]$/)) {
        arrayDepth++
        s = s.slice(1).slice(0, -1)
    }

    return [s, arrayDepth]
}

const _fromString = s => {
    let arrayDepth, optional
    ;[s, optional] = checkOptional(s)
    ;[s, arrayDepth] = checkArray(s)
    const regex = checkRegex(s)
    return { baseType: 'String', optional, arrayDepth, regex }
}

const _fromNumber = s => {
    let arrayDepth, optional
    ;[s, optional] = checkOptional(s)
    ;[s, arrayDepth] = checkArray(s)
    return { baseType: 'Number', optional, arrayDepth, regex: false }
}

const _fromBoolean = s => {
    let arrayDepth, optional
    ;[s, optional] = checkOptional(s)
    ;[s, arrayDepth] = checkArray(s)
    return { baseType: 'Boolean', optional, arrayDepth, regex: false }
}

const _fromObject = s => {
    let arrayDepth, optional
    ;[s, optional] = checkOptional(s)
    ;[s, arrayDepth] = checkArray(s)
    return { baseType: 'Object', optional, arrayDepth, regex: false }
}

const _fromAny = s => {
    let arrayDepth, optional
    ;[s, optional] = checkOptional(s)
    ;[s, arrayDepth] = checkArray(s)
    return { baseType: 'Any', optional, arrayDepth, regex: false }
}

const _fromTagged = s => {
    let arrayDepth, optional
    ;[s, optional] = checkOptional(s)
    ;[s, arrayDepth] = checkArray(s)
    return { baseType: 'Tagged', taggedType: s, optional, arrayDepth, regex: false }
}

const fromString = s => {
    s = s.toString()

    // if (s.match(/\[/)) return _fromArray(s)

    if (s.match(/String/)) return _fromString(s)
    if (s.match(/[/]/)) return _fromString(s)

    if (s.match(/Number/)) return _fromNumber(s)
    if (s.match(/Boolean/)) return _fromBoolean(s)
    if (s.match(/Object/)) return _fromObject(s)
    if (s.match(/Any/)) return _fromAny(s)

    return _fromTagged(s)
}

const assoc = (k, v, o) => Object.assign({}, o, { [k]: v })

const fieldsToString = fields => {
    const fieldToString = (acc, [name, value]) => assoc(name, toString(value), acc)
    return Object.entries(fields).reduce(fieldToString, {})
}

export default { toString, fromString, fieldsToString }
