/* global mapboxgl */
import { useEffect, useRef } from 'react'

/**
 * MapboxMap - Interactive map component displaying San Francisco blockfaces
 *
 * Renders a full-screen Mapbox GL JS map centered on San Francisco with:
 * - Interactive pan/zoom controls
 * - SF Blockfaces dataset as clickable green lines
 * - Click-to-highlight functionality in red
 * - Position logging on map interaction
 */

/**
 * Creates map configuration object
 * @sig createMapConfig :: (HTMLElement, String) -> MapConfig
 * MapConfig = { container: HTMLElement, style: String, center: [Number], zoom: Number, ... }
 */
const createMapConfig = (container, accessToken) => ({
    container,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-122.4194, 37.7749],
    zoom: 13,
    accessToken,
    collectResourceTiming: false,
})

/**
 * Creates blockface data source configuration
 * @sig createBlockfaceSource :: () -> SourceConfig
 * SourceConfig = { type: String, data: String }
 */
const createBlockfaceSource = () => ({
    type: 'geojson',
    data: 'https://data.sfgov.org/resource/pep9-66vw.geojson?$limit=50000',
})

/**
 * Creates blockface layer configuration
 * @sig createBlockfaceLayer :: () -> LayerConfig
 * LayerConfig = { id: String, type: String, source: String, layout: Object, paint: Object }
 */
const createBlockfaceLayer = () => ({
    id: 'sf-blockfaces',
    type: 'line',
    source: 'sf-blockfaces-source',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': 'gray', 'line-width': 3, 'line-opacity': 0.7 },
})

/**
 * Creates highlighted blockface source configuration
 * @sig createHighlightSource :: Feature -> SourceConfig
 * Feature = { type: String, geometry: Object, properties: Object }
 */
const createHighlightSource = feature => ({
    type: 'geojson',
    data: { type: 'Feature', geometry: feature.geometry, properties: feature.properties },
})

/**
 * Creates highlighted blockface layer configuration
 * @sig createHighlightLayer :: () -> LayerConfig
 */
const createHighlightLayer = () => ({
    id: 'highlighted-blockface',
    type: 'line',
    source: 'highlighted-blockface-source',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#ff0000', 'line-width': 6, 'line-opacity': 0.8 },
})

/**
 * Sets up cursor hover effects for blockface layer
 * @sig setupCursorEffects :: Map -> Void
 */
const setupCursorEffects = map => {
    const showCrosshair = () => {
        map.getCanvas().style.cursor = 'crosshair'
    }

    const hideCrosshair = () => {
        map.getCanvas().style.cursor = ''
    }

    map.on('mouseenter', 'sf-blockfaces', showCrosshair)
    map.on('mouseleave', 'sf-blockfaces', hideCrosshair)
}

/**
 * Removes existing highlight layers and sources
 * @sig removeExistingHighlight :: Map -> Void
 */
const removeExistingHighlight = map => {
    if (map.getLayer('highlighted-blockface')) map.removeLayer('highlighted-blockface')
    if (map.getSource('highlighted-blockface-source')) map.removeSource('highlighted-blockface-source')
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
 * Logs blockface feature information
 * @sig logBlockfaceInfo :: Feature -> Void
 */
const logBlockfaceInfo = feature => {
    console.log('Blockface feature clicked:', feature)
    console.log('Blockface GeoJSON:', { type: 'Feature', geometry: feature.geometry, properties: feature.properties })

    const props = feature.properties
    console.log('Blockface properties - Street:', props.street, 'Block:', props.block, 'Side:', props.side)
}

/**
 * Handles map click events to detect and highlight blockfaces
 * @sig handleMapClick :: (Map, Event) -> Void
 */
const handleMapClick = (map, e) => {
    if (!map) return

    const features = map.queryRenderedFeatures(e.point, { layers: ['sf-blockfaces'] })

    if (features.length === 0) {
        console.log('No blockface features found at click point')
        return
    }

    const blockfaceFeature = features[0]
    logBlockfaceInfo(blockfaceFeature)
    highlightBlockface(map, blockfaceFeature)
}

/**
 * Sets up blockface layer when source data loads
 * @sig setupBlockfaceLayer :: (Map, Event) -> Void
 */
const setupBlockfaceLayer = (map, e) => {
    if (e.sourceId !== 'sf-blockfaces-source' || !e.isSourceLoaded) return
    if (map.getLayer('sf-blockfaces')) return

    const source = map.getSource('sf-blockfaces-source')
    if (source._data && source._data.features) {
        console.log(`SF Blockfaces loaded: ${source._data.features.length} features`)
    }

    map.addLayer(createBlockfaceLayer())
    setupCursorEffects(map)
    console.log('SF Blockfaces layer added on top with hover effects')
}

/**
 * Handles map load event - sets up data sources and event listeners
 * @sig handleMapLoad :: Map -> Void
 */
const handleMapLoad = map => {
    console.log('Mapbox map loaded and ready')
    console.log('Map is interactive:', map.dragPan.isEnabled())

    map.addSource('sf-blockfaces-source', createBlockfaceSource())

    const handleSourceData = e => setupBlockfaceLayer(map, e)
    const handleClick = e => handleMapClick(map, e)

    map.on('sourcedata', handleSourceData)
    map.on('click', handleClick)
}

/**
 * Interactive Mapbox map component for San Francisco blockfaces
 * @sig MapboxMap :: { accessToken: String } -> ReactElement
 */
const MapboxMap = ({ accessToken = 'your-mapbox-token-here' }) => {
    const mapContainer = useRef(null)
    const map = useRef(null)

    useEffect(() => {
        if (map.current) return

        map.current = new mapboxgl.Map(createMapConfig(mapContainer.current, accessToken))

        const handleLoad = () => handleMapLoad(map.current)
        map.current.on('load', handleLoad)

        return () => {
            if (map.current) map.current.remove()
        }
    }, [accessToken])

    return (
        <div
            ref={mapContainer}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 1 }}
        />
    )
}

export default MapboxMap
