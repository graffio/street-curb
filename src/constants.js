/**
 * @sig STREET_LENGTH :: Number
 * Total length of the street in feet for calculations
 */
const STREET_LENGTH = 240

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
    { id: 's6', type: 'Loading', length: 80 },
]

/**
 * @sig COLORS :: { [String]: String }
 * Color mapping for different segment types
 */
const COLORS = { Parking: '#2a9d8f', 'Curb Cut': '#e76f51', Loading: '#264653' }

export { STREET_LENGTH, initialSegments, COLORS }
