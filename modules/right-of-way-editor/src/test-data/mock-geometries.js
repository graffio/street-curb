/**
 * Mock GeoJSON geometries for testing and stories
 * These represent real street segments with realistic lengths
 */

/**
 * Short city block - approximately 200 feet
 * Represents a typical short downtown block
 */
export const SHORT_BLOCK_GEOMETRY = {
    type: 'LineString',
    coordinates: [
        [-122.4194, 37.7749], // Start point (SF coordinates)
        [-122.4186, 37.7749], // End point (~200 feet east)
    ],
}

/**
 * Medium city block - approximately 400 feet
 * Represents a typical residential block
 */
export const MEDIUM_BLOCK_GEOMETRY = {
    type: 'LineString',
    coordinates: [
        [-122.4194, 37.7749], // Start point
        [-122.4176, 37.7749], // End point (~400 feet east)
    ],
}

/**
 * Long city block - approximately 600 feet
 * Represents a longer commercial block
 */
export const LONG_BLOCK_GEOMETRY = {
    type: 'LineString',
    coordinates: [
        [-122.4194, 37.7749], // Start point
        [-122.4156, 37.7749], // End point (~600 feet east)
    ],
}

/**
 * Default geometry for most stories - medium block
 */
export const DEFAULT_STORY_GEOMETRY = MEDIUM_BLOCK_GEOMETRY
