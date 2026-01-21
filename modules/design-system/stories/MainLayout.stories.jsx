// ABOUTME: Storybook stories for MainLayout component
// ABOUTME: Demonstrates the application shell layout with sidebar, topbar, and main content area

import { Card, Flex, Text } from '@radix-ui/themes'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { MainLayout } from '../src/components/MainLayout.jsx'

export default { title: 'MainLayout', component: MainLayout, parameters: { layout: 'fullscreen' } }

const DefaultStory = () => (
    <BrowserRouter>
        <MainLayout title="Application Title" subtitle="Subtitle text">
            <Card m="4">
                <Text>Main content area</Text>
            </Card>
        </MainLayout>
    </BrowserRouter>
)

const WithActionsStory = () => (
    <BrowserRouter>
        <MainLayout
            title="Custom Navigation"
            subtitle="With action buttons"
            actions={[{ label: 'Alpha' }, { label: 'Beta' }, { label: 'Gamma' }]}
        >
            <Flex direction="column" gap="2" p="4">
                <Text>TopBar with action buttons configured via props</Text>
            </Flex>
        </MainLayout>
    </BrowserRouter>
)

export const Default = () => <DefaultStory />
export const WithActions = () => <WithActionsStory />
