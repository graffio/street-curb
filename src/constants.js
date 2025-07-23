/**
 * @sig STREET_LENGTH :: Number
 * Total length of the street in feet for calculations
 */
const STREET_LENGTH = 240

/**
 * @sig PRECISION_CONFIG :: { displayDecimals: Number, storageDecimals: Number }
 * Configuration for decimal precision in length displays and storage
 *
 * To change precision globally:
 * - displayDecimals: Number of decimal places to show in UI (e.g., 1 for "23.4 ft", 0 for "23 ft")
 * - storageDecimals: Number of decimal places to store in Redux (e.g., 1 for 23.4, 2 for 23.38)
 *
 * Examples:
 * - { displayDecimals: 0, storageDecimals: 0 } -> "23 ft" (whole feet only)
 * - { displayDecimals: 1, storageDecimals: 1 } -> "23.4 ft" (current default)
 * - { displayDecimals: 2, storageDecimals: 2 } -> "23.38 ft" (high precision)
 */
const PRECISION_CONFIG = {
    displayDecimals: 1, // Show 1 decimal place in UI
    storageDecimals: 1, // Store 1 decimal place in Redux
}

/**
 * @sig formatLength :: (Number, Number?) -> String
 * Formats a length value with consistent decimal precision
 * @param length - The length value to format
 * @param decimals - Optional override for decimal places (defaults to PRECISION_CONFIG.displayDecimals)
 * @returns Formatted string like "23.4 ft"
 */
const formatLength = (length, decimals = PRECISION_CONFIG.displayDecimals) => {
    if (typeof length !== 'number' || isNaN(length)) return '0 ft'
    return `${length.toFixed(decimals)} ft`
}

/**
 * @sig roundToPrecision :: (Number, Number?) -> Number
 * Rounds a number to the specified decimal precision
 * @param value - The value to round
 * @param decimals - Optional override for decimal places (defaults to PRECISION_CONFIG.storageDecimals)
 * @returns Rounded number
 */
const roundToPrecision = (value, decimals = PRECISION_CONFIG.storageDecimals) => {
    if (typeof value !== 'number' || isNaN(value)) return 0
    const factor = Math.pow(10, decimals)
    return Math.round(value * factor) / factor
}

/**
 * @sig initialSegments :: [Segment]
 * Segment = { id: String, type: String, length: Number }
 * Initial configuration of curb segments
 */
const initialSegments = [
    { id: 's1', type: 'Curb Cut', length: 20 },
    { id: 's2', type: 'Parking', length: 40 },
    { id: 's3', type: 'Curb Cut', length: 10 },
    { id: 's4', type: 'Loading', length: 30 },
    { id: 's5', type: 'Parking', length: 60 },
    { id: 's6', type: 'Unknown', length: 80 },
]

/**
 * @sig COLORS :: { [String]: String }
 * Color mapping for different segment types
 */
const COLORS = { Parking: '#2a9d8f', 'Curb Cut': '#e76f51', Loading: '#264653', Unknown: 'gray' }

export { STREET_LENGTH, initialSegments, COLORS, PRECISION_CONFIG, formatLength, roundToPrecision }
