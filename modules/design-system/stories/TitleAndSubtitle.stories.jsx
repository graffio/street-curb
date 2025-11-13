import React from 'react'
import { TitleAndSubtitle } from '../src/components/TitleAndSubtitle.jsx'

export default {
    title: 'TitleAndSubtitle',
    component: TitleAndSubtitle,
    parameters: {
        docs: {
            description: {
                component:
                    'A compound component for displaying titles with optional subtitles. Supports size variants and gap control.',
            },
        },
    },
    argTypes: {
        gap: {
            control: { type: 'select' },
            options: ['tight', 'normal', 'loose'],
            description: 'Spacing between title and subtitle',
        },
    },
}

// Comprehensive showcase
export const AllVariations = {
    render: () => {
        const sectionHeaderStyle = {
            marginBottom: '16px',
            borderBottom: '1px solid var(--accent-9)',
            paddingBottom: '8px',
            color: 'var(--accent-11)',
        }

        const itemHeaderStyle = { color: 'var(--accent-11)', marginBottom: '8px' }

        const demoBoxStyle = {
            backgroundColor: 'var(--gray-3)',
            padding: '16px',
            minHeight: '30px',
            display: 'flex',
            alignItems: 'center',
        }

        const DemoItem = ({ title, titleProps = {}, subtitleProps = {}, containerProps = {}, children }) => (
            <div>
                <h4 style={itemHeaderStyle}>{title}</h4>
                <div style={demoBoxStyle}>
                    <TitleAndSubtitle {...containerProps}>
                        <TitleAndSubtitle.Title {...titleProps}>{children?.title}</TitleAndSubtitle.Title>
                        {children?.subtitle && (
                            <TitleAndSubtitle.Subtitle {...subtitleProps}>
                                {children.subtitle}
                            </TitleAndSubtitle.Subtitle>
                        )}
                    </TitleAndSubtitle>
                </div>
            </div>
        )

        const Section = ({ title, items }) => (
            <div>
                <h3 style={sectionHeaderStyle}>{title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {items.map((item, index) => (
                        <DemoItem key={index} {...item} />
                    ))}
                </div>
            </div>
        )

        const sections = [
            {
                title: 'Usage Examples',
                items: [
                    {
                        title: 'Dashboard Header',
                        containerProps: { gap: 'tight' },
                        titleProps: { size: 'xl' },
                        children: { title: 'Financial Dashboard', subtitle: 'Q4 2024 Summary' },
                    },
                    {
                        title: 'Card Title',
                        titleProps: { size: 'md' },
                        children: { title: 'Revenue Growth', subtitle: 'Last 12 months' },
                    },
                    {
                        title: 'Section Header',
                        containerProps: { gap: 'loose' },
                        titleProps: { size: 'lg' },
                        subtitleProps: { size: 'sm' },
                        children: { title: 'Investment Portfolio', subtitle: 'Updated 2 minutes ago' },
                    },
                ],
            },
            {
                title: 'Size Variations',
                items: [
                    {
                        title: 'Small',
                        titleProps: { size: 'md' },
                        subtitleProps: { size: 'xs' },
                        children: { title: 'Medium Title', subtitle: 'Extra small subtitle' },
                    },
                    {
                        title: 'Default',
                        titleProps: { size: 'lg' },
                        subtitleProps: { size: 'xs' },
                        children: { title: 'Large Title', subtitle: 'Extra small subtitle' },
                    },
                    {
                        title: 'Large',
                        titleProps: { size: 'xl' },
                        subtitleProps: { size: 'sm' },
                        children: { title: 'Extra Large Title', subtitle: 'Small subtitle' },
                    },
                ],
            },
            {
                title: 'Gap Variations',
                items: [
                    {
                        title: 'Tight Gap',
                        containerProps: { gap: 'tight' },
                        children: { title: 'Title with tight gap', subtitle: 'Subtitle very close to title' },
                    },
                    {
                        title: 'Normal Gap',
                        containerProps: { gap: 'normal' },
                        children: { title: 'Title with normal gap', subtitle: 'Subtitle with standard spacing' },
                    },
                    {
                        title: 'Loose Gap',
                        containerProps: { gap: 'loose' },
                        children: { title: 'Title with loose gap', subtitle: 'Subtitle with more spacing' },
                    },
                ],
            },
            {
                title: 'Edge Cases',
                items: [
                    { title: 'Empty Content', children: { title: '', subtitle: '' } },
                    { title: 'Title Only', children: { title: 'Financial Dashboard' } },
                    {
                        title: 'Very Long Title',
                        children: {
                            title: 'This is a very long title that might wrap to multiple lines in narrow containers',
                            subtitle: 'Short subtitle',
                        },
                    },
                    {
                        title: 'Very Long Subtitle',
                        children: {
                            title: 'Short Title',
                            subtitle:
                                'This is a very long subtitle that contains lots of descriptive text that might wrap',
                        },
                    },
                ],
            },
        ]

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
                {sections.map((section, index) => (
                    <Section key={index} {...section} />
                ))}
            </div>
        )
    },
    parameters: { controls: { disable: true } },
}
