// ABOUTME: Map interface component with blockface editing
// ABOUTME: Full map UI with sliding editor panel for segment management

import { Box, Button, Checkbox, Flex, Heading } from '@graffio/design-system'
import { LookupTable } from '@graffio/functional'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/index.js'
import * as S from '../store/selectors.js'
import { Action, Blockface, FieldTypes, Segment } from '../types/index.js'
import { hashFeatureGeoemetry } from '../utils/geometry.js'
import CurbTable from './CurbTable/index.js'
import MapboxMap from './MapboxMap.jsx'
import SegmentedCurbEditor from './SegmentedCurbEditor/index.js'

const accessToken = 'pk.eyJ1IjoiZ3JhZmZpbyIsImEiOiJjbWRkZ3lkNjkwNG9xMmpuYmt4bHd2YTVvIn0.lzlmjq8mnXOSKB18lKLBpg'

const ShowCurbTableCheckbox = props => (
    <Box mb="3" p="3" style={{ backgroundColor: 'var(--gray-2)', borderRadius: 'var(--radius-2)' }}>
        <Flex asChild gap="2">
            <label style={{ cursor: 'pointer' }}>
                <Checkbox checked={props.checked} onCheckedChange={props.onCheckedChange} />
                Show Table View (for field data collection)
            </label>
        </Flex>
    </Box>
)

const EditorPanelHeader = props => (
    <Flex justify="between" align="center" mb="3" pb="3" style={{ borderBottom: '1px solid var(--gray-6)' }}>
        <Heading size="4">Edit Blockface</Heading>
        <Button variant="ghost" size="3" onClick={props.onClick}>
            ×
        </Button>
    </Flex>
)

/**
 * Sliding editor panel for blockface editing
 * @sig EditorPanel :: ({ Boolean, Number, Handler }) -> ReactElement
 */
const EditorPanel = ({ onClose }) => {
    const [showCurbTable, setShowCurbTable] = useState(false)

    const panelStyle = { position: 'absolute', right: 0, zIndex: 10, pointerEvents: 'auto' }
    const contentsStyle = { backgroundColor: 'var(--color-background)', borderLeft: '1px solid var(--gray-6)' }

    return (
        <Box width="450px" height="100vh" style={panelStyle}>
            <Flex direction="column" p="4" height="100%" style={contentsStyle}>
                <EditorPanelHeader onClick={onClose} />
                <ShowCurbTableCheckbox checked={showCurbTable} onCheckedChange={setShowCurbTable} />
                <Box style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                    {showCurbTable ? <CurbTable /> : <SegmentedCurbEditor />}
                </Box>
            </Flex>
        </Box>
    )
}

const cityBlockfaceId = feature => {
    const { id, properties = {} } = feature

    const { id: propId, cnn_id: CNN, COMPKEY, PHYSICALID, SEGMENTID, STREETID } = properties

    // Try city-specific ID fields
    // prettier-ignore
    // eslint-disable-next-line no-lone-blocks
    {
        if (id)         return feature.id   // id from feature
        if (propId)     return propId       // id from feature.properties
        if (CNN)        return CNN          // san-francisco
        if (COMPKEY)    return COMPKEY      // seattle
        if (PHYSICALID) return PHYSICALID   // new-york
        if (SEGMENTID)  return SEGMENTID    // portland
        if (STREETID)   return STREETID     // los-angeles
    }

    // Fallback: hash geometry coordinates
    return `geohash-${hashFeatureGeoemetry(feature)}`
}

/*
 * Typical Feature:
 *     blockface_: "1RY"
 *     cnn_id    : "6812000"
 *     globalid  : "{FE4AB464-7304-4299-AE15-85CC09063A14}"
 *     name      : "464001"
 *     sfpark_id : "464001"
 *     shape_leng: "0.00095727"
 *     street_nam: "NULL"
 */
const CurbMapEditorPanel = () => {
    const handleEditorClose = () => setIsEditorVisible(false)
    const handleBlockfaceSelected = _blockfaceData => {
        setSelectedBlockface(_blockfaceData)
        setIsEditorVisible(true)

        const { feature } = _blockfaceData // { feature: GeoJSONFeature, length: Number }
        const { geometry, properties = {} } = feature
        const { street_nam: streetName = 'unknown', cnn_id: cnn } = properties

        const blockface = Blockface.from({
            id: FieldTypes.newBlockfaceId(),
            sourceId: cityBlockfaceId(feature),
            geometry,
            streetName,
            segments: LookupTable([], Segment, 'id'),
            cnn,
            organizationId: organization.id,
            projectId: organization.defaultProjectId,
        })

        post(Action.SelectBlockface(blockface))
    }

    const blockface = useSelector(S.currentBlockface)
    const organization = useSelector(S.currentOrganization)
    const segments = blockface?.segments || []

    const [selectedBlockface, setSelectedBlockface] = useState(null)
    const [isEditorVisible, setIsEditorVisible] = useState(false)

    return (
        <Box width="100%" height="100%" style={{ position: 'relative', overflow: 'hidden' }}>
            <MapboxMap
                accessToken={accessToken}
                onBlockfaceSelect={handleBlockfaceSelected}
                selectedBlockface={selectedBlockface}
                currentSegments={segments}
            />

            {isEditorVisible && <EditorPanel onClose={handleEditorClose} />}
        </Box>
    )
}

export { CurbMapEditorPanel }
