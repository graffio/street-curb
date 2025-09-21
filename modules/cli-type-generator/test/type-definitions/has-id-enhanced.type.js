// Enhanced Tagged type definition for HasId with imports and functions
import StringTypes from './string-types.js'

export const HasIdEnhanced = { name: 'HasIdEnhanced', kind: 'tagged', fields: { id: StringTypes.Id } }

// Additional functions attached to the type
HasIdEnhanced.createRandom = () => {
    // Generate a proper UUID v4 format for testing
    const hex = () => Math.floor(Math.random() * 16).toString(16)
    const segment = length => Array.from({ length }, hex).join('')

    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // where y is one of [8, 9, a, b]
    const uuid = `${segment(8)}-${segment(4)}-4${segment(3)}-${['8', '9', 'a', 'b'][Math.floor(Math.random() * 4)]}${segment(3)}-${segment(12)}`
    return HasIdEnhanced(uuid)
}

HasIdEnhanced.isValidId = id => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return typeof id === 'string' && uuidRegex.test(id)
}

HasIdEnhanced.fromObject = obj => {
    if (!obj || typeof obj !== 'object' || !obj.id) throw new Error('Object must have an id property')
    return HasIdEnhanced(obj.id)
}
