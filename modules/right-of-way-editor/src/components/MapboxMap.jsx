/* global mapboxgl */
import along from '@turf/along'
import length from '@turf/length'
import lineSlice from '@turf/line-slice'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { COLORS } from '../constants.js'
import { selectSegments } from '../store/selectors.js'

/**
 * MapboxMap - Interactive map component displaying San Francisco blockfaces
 *
 * Renders a full-screen Mapbox GL JS map centered on San Francisco with:
 * - Interactive pan/zoom controls
 * - SF Blockfaces dataset as clickable gray lines
 * - Dynamic highlighting system for selected blockfaces
 * - Real-time segmented curb visualization
 *
 * The map integrates with SegmentedCurbEditor to provide synchronized
 * visual feedback as users edit curb configurations.
 */

/**
 * Gets unique blockface identifier from feature properties and geometry
 * @sig getBlockfaceId :: Feature -> String
 */
const getBlockfaceId = feature => {
    const props = feature.properties
    const coords = feature.geometry.coordinates
    const firstCoord = coords[0]
    const lastCoord = coords[coords.length - 1]
    const coordHash = `${firstCoord[0].toFixed(6)},${firstCoord[1].toFixed(6)}-${lastCoord[0].toFixed(6)},${lastCoord[1].toFixed(6)}`
    return `${JSON.stringify(props)}/${coordHash}`
}

/**
 * Gets segment color based on type (matching SegmentedCurbEditor colors)
 * @sig getSegmentColor :: String -> String
 */
const getSegmentColor = type => COLORS[type] || '#999999'

/**
 * Normalizes a Point feature to remove elevation data
 * @sig normalizePoint :: Feature<Point> -> Feature<Point>
 */
const normalizePoint = pointFeature => {
    if (!pointFeature?.geometry?.coordinates) return null

    const coords = pointFeature.geometry.coordinates
    return {
        ...pointFeature,
        geometry: { ...pointFeature.geometry, coordinates: coords.length > 2 ? [coords[0], coords[1]] : coords },
    }
}

/**
 * Creates start point for segment with boundary handling
 * @sig createStartPoint :: (Feature, Number, Number) -> Feature<Point>
 */
const createStartPoint = (blockfaceFeature, startDistanceKm, epsilon) => {
    if (startDistanceKm <= epsilon)
        return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: blockfaceFeature.geometry.coordinates[0] },
            properties: {},
        }
    return along(blockfaceFeature, startDistanceKm, { units: 'kilometers' })
}

/**
 * Creates end point for segment with boundary handling
 * @sig createEndPoint :: (Feature, Number, Number, Number) -> Feature<Point>
 */
const createEndPoint = (blockfaceFeature, endDistanceKm, totalGeographicLengthKm, epsilon) => {
    if (endDistanceKm >= totalGeographicLengthKm - epsilon) {
        const coords = blockfaceFeature.geometry.coordinates
        return { type: 'Feature', geometry: { type: 'Point', coordinates: coords[coords.length - 1] }, properties: {} }
    }
    return along(blockfaceFeature, endDistanceKm, { units: 'kilometers' })
}

/**
 * Creates single segment feature from blockface and segment data
 * @sig createSegmentFeature :: (Feature, Segment, Number, Number, Number, Number) -> Feature
 */
const createSegmentFeature = (
    blockfaceFeature,
    segment,
    startDistanceKm,
    endDistanceKm,
    totalGeographicLengthKm,
    epsilon,
) => {
    const handleError = error => {
        console.error('Error creating segment:', error, { startDistanceKm, endDistanceKm, totalGeographicLengthKm })
        return {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [] },
            properties: { color: getSegmentColor(segment.type), type: segment.type, length: segment.length },
        }
    }

    try {
        const rawStartPoint = createStartPoint(blockfaceFeature, startDistanceKm, epsilon)
        const rawEndPoint = createEndPoint(blockfaceFeature, endDistanceKm, totalGeographicLengthKm, epsilon)

        const startPoint = normalizePoint(rawStartPoint)
        const endPoint = normalizePoint(rawEndPoint)

        if (!startPoint || !endPoint)
            throw new Error(`Point normalization failed: startPoint=${!!startPoint}, endPoint=${!!endPoint}`)

        const segmentGeometry = lineSlice(startPoint, endPoint, blockfaceFeature)

        return {
            type: 'Feature',
            geometry: segmentGeometry.geometry,
            properties: { color: getSegmentColor(segment.type), type: segment.type, length: segment.length },
        }
    } catch (error) {
        return handleError(error)
    }
}

/**
 * Creates segmented highlight data from blockface feature and segments using proper distance-based slicing
 * @sig createSegmentedHighlight :: (Feature, [Segment], Number) -> GeoJSONFeatureCollection
 */
const createSegmentedHighlight = (blockfaceFeature, segments, blockfaceLengthFeet) => {
    if (!blockfaceFeature?.geometry || blockfaceFeature.geometry.type !== 'LineString' || !segments?.length)
        return { type: 'FeatureCollection', features: [] }

    const totalGeographicLengthKm = length(blockfaceFeature)
    const epsilon = 0.000001
    let currentDistanceFeet = 0

    const features = segments.map(segment => {
        const startRatio = currentDistanceFeet / blockfaceLengthFeet
        const endRatio = (currentDistanceFeet + segment.length) / blockfaceLengthFeet

        const startDistanceKm = startRatio * totalGeographicLengthKm
        const endDistanceKm = endRatio * totalGeographicLengthKm

        currentDistanceFeet += segment.length

        return createSegmentFeature(
            blockfaceFeature,
            segment,
            startDistanceKm,
            endDistanceKm,
            totalGeographicLengthKm,
            epsilon,
        )
    })

    return { type: 'FeatureCollection', features: features.filter(f => f.geometry.coordinates.length >= 2) }
}

/**
 * Creates SF Blockfaces data source configuration
 * @sig createBlockfaceSource :: () -> SourceConfig
 */
const createBlockfaceSource = () => ({
    type: 'geojson',
    data: 'https://data.sfgov.org/resource/pep9-66vw.geojson?$limit=50000',
})

/**
 * Creates SF Blockfaces layer configuration
 * @sig createBlockfaceLayer :: () -> LayerConfig
 */
const createBlockfaceLayer = () => ({
    id: 'sf-blockfaces',
    type: 'line',
    source: 'sf-blockfaces-source',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#888888', 'line-width': 4, 'line-opacity': 0.8 },
})

/**
 * Creates highlight source configuration
 * @sig createHighlightSource :: Feature -> SourceConfig
 */
const createHighlightSource = feature => ({
    type: 'geojson',
    data: { type: 'Feature', geometry: feature.geometry, properties: feature.properties },
})

/**
 * Creates highlight layer configuration
 * @sig createHighlightLayer :: () -> LayerConfig
 */
const createHighlightLayer = () => ({
    id: 'highlighted-blockface',
    type: 'line',
    source: 'highlighted-blockface-source',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#ff0000', 'line-width': 4, 'line-opacity': 0.8 },
})

/**
 * Removes existing highlight layers and sources
 * @sig removeExistingHighlight :: Map -> Void
 */
const removeExistingHighlight = map => {
    try {
        if (map.getLayer('highlighted-blockface')) map.removeLayer('highlighted-blockface')
        if (map.getSource('highlighted-blockface-source')) map.removeSource('highlighted-blockface-source')
    } catch (error) {
        // Silently ignore cleanup errors
    }
}

/**
 * Adds highlight layer for selected blockface
 * @sig addHighlightLayer :: (Map, Feature) -> Void
 */
const addHighlightLayer = (map, feature) => {
    map.addSource('highlighted-blockface-source', createHighlightSource(feature))
    map.addLayer(createHighlightLayer())
}

/**
 * Highlights a blockface feature in red
 * @sig highlightBlockface :: (Map, Feature) -> Void
 */
const highlightBlockface = (map, feature) => {
    if (!map) return
    removeExistingHighlight(map)
    addHighlightLayer(map, feature)
}

/**
 * Calculates blockface length in feet using turf.js
 * @sig calculateBlockfaceLength :: Feature -> Number
 */
const calculateBlockfaceLength = feature => {
    const lengthInKm = length(feature)
    return Math.round(lengthInKm * 3280.84)
}

/**
 * Sets up cursor effects for blockface layer
 * @sig setupCursorEffects :: Map -> Void
 */
const setupCursorEffects = map => {
    map.on('mouseenter', 'sf-blockfaces', () => (map.getCanvas().style.cursor = 'crosshair'))
    map.on('mouseleave', 'sf-blockfaces', () => (map.getCanvas().style.cursor = ''))
}

/**
 * Handles blockface click events
 * @sig handleClick :: (Map, Function) -> (MapMouseEvent) -> Void
 */
const handleClick = (map, onBlockfaceSelectRef) => e => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['sf-blockfaces'] })
    if (features.length === 0) return

    const feature = features[0]
    const blockfaceId = getBlockfaceId(feature)
    const blockfaceLength = calculateBlockfaceLength(feature)

    if (onBlockfaceSelectRef.current)
        onBlockfaceSelectRef.current({ id: blockfaceId, feature, length: blockfaceLength })
}

/**
 * Handles source data events for SF blockfaces layer
 * @sig handleSourceData :: (Map, Function) -> (MapSourceDataEvent) -> Void
 */
const handleSourceData = (map, onBlockfaceSelectRef) => e => {
    if (e.sourceId !== 'sf-blockfaces-source' || !e.isSourceLoaded) return
    if (map.getLayer('sf-blockfaces')) return

    map.addLayer(createBlockfaceLayer())
    setupCursorEffects(map)
    map.on('click', 'sf-blockfaces', handleClick(map, onBlockfaceSelectRef))
}

/**
 * Initializes map with SF blockfaces data and event handlers
 * @sig handleMapLoad :: (Map, Function) -> Void
 */
const handleMapLoad = (map, onBlockfaceSelectRef) => {
    map.addSource('sf-blockfaces-source', createBlockfaceSource())
    map.on('sourcedata', handleSourceData(map, onBlockfaceSelectRef))
}

/**
 * Initializes segmented highlight layer
 * @sig initializeSegmentedHighlight :: Map -> Void
 */
const initializeSegmentedHighlight = map => {
    if (map.getSource('segmented-highlight-source')) return

    map.addSource('segmented-highlight-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })

    map.addLayer({
        id: 'segmented-highlight',
        type: 'line',
        source: 'segmented-highlight-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': ['get', 'color'], 'line-width': 10, 'line-opacity': 0.9 },
    })
}

/**
 * Updates segmented highlight with new data
 * @sig updateSegmentedHighlight :: (Map, Feature, [Segment], Number) -> Void
 */
const updateSegmentedHighlight = (map, blockfaceFeature, currentSegments, blockfaceLength) => {
    const source = map.getSource('segmented-highlight-source')
    if (!source) return

    if (blockfaceFeature && currentSegments?.length) {
        const segmentedData = createSegmentedHighlight(blockfaceFeature, currentSegments, blockfaceLength || 240)
        source.setData(segmentedData)
        removeExistingHighlight(map)
        return
    }

    if (blockfaceFeature) {
        source.setData({ type: 'FeatureCollection', features: [] })
        highlightBlockface(map, blockfaceFeature)
        return
    }

    source.setData({ type: 'FeatureCollection', features: [] })
    removeExistingHighlight(map)
}

/**
 * MapboxMap component - renders interactive map with blockface highlighting
 * @sig MapboxMap :: { accessToken: String, onBlockfaceSelect?: Function, selectedBlockface?: Object } -> ReactElement
 */
const MapboxMap = ({ accessToken = 'your-mapbox-token-here', onBlockfaceSelect, selectedBlockface }) => {
    const currentSegments = useSelector(selectSegments)

    const mapContainer = useRef(null)
    const map = useRef(null)
    const onBlockfaceSelectRef = useRef(onBlockfaceSelect)

    onBlockfaceSelectRef.current = onBlockfaceSelect

    useEffect(() => {
        if (map.current) return

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-122.4194, 37.7749],
            zoom: 16,
            accessToken,
            collectResourceTiming: false,
        })

        map.current.on('load', () => handleMapLoad(map.current, onBlockfaceSelectRef))
    }, [accessToken])

    useEffect(() => {
        if (!map.current?.isStyleLoaded()) return
        initializeSegmentedHighlight(map.current)
    }, [map.current])

    useEffect(() => {
        if (!map.current?.isStyleLoaded()) return
        updateSegmentedHighlight(map.current, selectedBlockface?.feature, currentSegments, selectedBlockface?.length)
    }, [selectedBlockface?.feature, selectedBlockface?.id, currentSegments])

    return (
        <div
            ref={mapContainer}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
        />
    )
}

export default MapboxMap
