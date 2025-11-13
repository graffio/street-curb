import { PRECISION_CONFIG } from '../constants.js'

/**
 * @sig formatLength :: (Number, Number?) -> String
 * Formats a length value with consistent decimal precision
 */
const formatLength = (length, decimals = PRECISION_CONFIG.displayDecimals) => {
    if (typeof length !== 'number' || isNaN(length)) return '0 ft'
    return `${length.toFixed(decimals)} ft`
}

/**
 * @sig roundToPrecision :: (Number, Number?) -> Number
 * Rounds a number to the specified decimal precision
 */
const roundToPrecision = (value, decimals = PRECISION_CONFIG.storageDecimals) => {
    if (typeof value !== 'number' || isNaN(value)) return 0
    const factor = Math.pow(10, decimals)
    return Math.round(value * factor) / factor
}

export { formatLength, roundToPrecision }
