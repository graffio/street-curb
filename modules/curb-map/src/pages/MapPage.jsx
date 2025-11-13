// ABOUTME: Map route page
// ABOUTME: Sets layout metadata and renders MapComponent

import { layoutChannel } from '@graffio/design-system'
import { useEffect } from 'react'
import { CurbMapEditorPanel } from '../components/CurbMapEditorPanel.jsx'

const MapPage = () => {
    useEffect(() => {
        layoutChannel.setState({ title: 'Curb Map' })
    }, [])

    return <CurbMapEditorPanel />
}

export default MapPage
