/*
 * Deep-clone an object
 * @sig clone :: {k:v} -> {k:v}
 *
 */
const clone = o => {
    // not a Date, Array or Object
    if (o === null || typeof o !== 'object') return o

    // Date
    if (o instanceof Date) return new Date(o.getTime())

    // Array
    if (Array.isArray(o)) {
        const copy = []
        for (let i = 0; i < o.length; i++) copy[i] = clone(o[i])
        return copy
    }

    // Object
    if (o instanceof Object) {
        const copy = {}
        for (const attr in o) 
            if (Object.prototype.hasOwnProperty.call(o, attr)) copy[attr] = clone(o[attr])
        
        return copy
    }
}

export default clone
