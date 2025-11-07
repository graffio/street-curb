/*
 * MainLayout2.stories.jsx - Storybook stories for MainLayout component
 *
 * Demonstrates the application shell layout with sidebar, topbar, and main content area.
 * Layout uses layoutChannel for coordinating state between TopBar and Sidebar components.
 */

import { Card, Flex, Text } from '@radix-ui/themes'
import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { layoutChannel } from '../../channels/index.js'
import { MainTheme } from '../../themes/theme.jsx'
import { MainLayout } from './MainLayout.jsx'

export default {
    title: 'Layout/MainLayout',
    component: MainLayout,
    decorators: [
        Story => (
            <MainTheme>
                <BrowserRouter>
                    <Story />
                </BrowserRouter>
            </MainTheme>
        ),
    ],
    parameters: {
        docs: {
            description: {
                component:
                    'Full-screen application shell with topbar, sidebar, and main content area. Uses CSS Grid with design tokens (240px sidebar, 60px topbar) and layoutChannel for coordination.',
            },
        },
        layout: 'fullscreen',
    },
}

export const Default = () => {
    useEffect(() => {
        layoutChannel.setState({ title: 'Application Title', subtitle: 'Subtitle text' })
    }, [])

    return (
        <MainLayout>
            <Card m="4">
                <Text>Main content area</Text>
            </Card>
        </MainLayout>
    )
}

export const WithCustomNavigation = () => {
    useEffect(() => {
        layoutChannel.setState({
            title: 'Custom Navigation',
            subtitle: 'Via layoutChannel',
            topBarActions: [{ label: 'Alpha' }, { label: 'Alpha' }, { label: 'Alpha' }],
            sidebarItems: [
                { title: 'Section 1', items: [{ href: '/page1', label: 'Page 1', active: true }] },
                {
                    title: 'Section 2',
                    items: [
                        { href: '/page2', label: 'Page 2', active: false },
                        { href: '/page3', label: 'Page 3', active: false },
                    ],
                },
            ],
        })
    }, [])

    return (
        <MainLayout>
            <Flex direction="column" gap="2" p="4">
                <Text>Custom sidebar navigation and topbar action configured via layoutChannel</Text>
            </Flex>
        </MainLayout>
    )
}
