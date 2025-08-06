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
 * @sig COLORS :: { [String]: String }
 * Color mapping for different segment types
 */
const COLORS = {
    Parking: '#a6cee3',
    'Curb Cut': '#1f78b4',
    Loading: '#b2df8a',
    'No Parking': '#33a02c',
    'Bus Stop': '#fb9a99',
    Taxi: '#e31a1c',
    Disabled: '#fdbf6f',
}

export { COLORS, PRECISION_CONFIG }
