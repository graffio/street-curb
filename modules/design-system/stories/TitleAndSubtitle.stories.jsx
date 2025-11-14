import React from 'react'
import { TitleAndSubtitle } from '../src/components/TitleAndSubtitle.jsx'

export default {
    title: 'TitleAndSubtitle',
    component: TitleAndSubtitle,
    parameters: {
        docs: {
            description: {
                component: 'Displays a title with optional subtitle. Supports size variants and gap control.',
            },
        },
    },
    argTypes: {
        title: { control: 'text', description: 'Title text' },
        subtitle: { control: 'text', description: 'Optional subtitle text' },
        gap: {
            control: { type: 'select' },
            options: ['tight', 'normal', 'loose'],
            description: 'Spacing between title and subtitle',
        },
        titleSize: { control: { type: 'select' }, options: ['md', 'lg', 'xl'], description: 'Title font size' },
        subtitleSize: { control: { type: 'select' }, options: ['xs', 'sm', 'md'], description: 'Subtitle font size' },
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

        const DemoItem = ({ label, ...props }) => (
            <div>
                <h4 style={itemHeaderStyle}>{label}</h4>
                <div style={demoBoxStyle}>
                    <TitleAndSubtitle {...props} />
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
                        label: 'Dashboard Header',
                        gap: 'tight',
                        titleSize: 'xl',
                        title: 'Financial Dashboard',
                        subtitle: 'Q4 2024 Summary',
                    },
                    { label: 'Card Title', titleSize: 'md', title: 'Revenue Growth', subtitle: 'Last 12 months' },
                    {
                        label: 'Section Header',
                        gap: 'loose',
                        titleSize: 'lg',
                        subtitleSize: 'sm',
                        title: 'Investment Portfolio',
                        subtitle: 'Updated 2 minutes ago',
                    },
                ],
            },
            {
                title: 'Size Variations',
                items: [
                    {
                        label: 'Small',
                        titleSize: 'md',
                        subtitleSize: 'xs',
                        title: 'Medium Title',
                        subtitle: 'Extra small subtitle',
                    },
                    {
                        label: 'Default',
                        titleSize: 'lg',
                        subtitleSize: 'sm',
                        title: 'Large Title',
                        subtitle: 'sm subtitle',
                    },
                    {
                        label: 'Large',
                        titleSize: 'xl',
                        subtitleSize: 'md',
                        title: 'Title: xl / subtitle xl',
                        subtitle: 'md subtitle',
                    },
                ],
            },
            {
                title: 'Gap Variations',
                items: [
                    {
                        label: 'Tight Gap',
                        gap: 'tight',
                        title: 'Title with tight gap',
                        subtitle: 'Subtitle very close to title',
                    },
                    {
                        label: 'Normal Gap',
                        gap: 'normal',
                        title: 'Title with normal gap',
                        subtitle: 'Subtitle with standard spacing',
                    },
                    {
                        label: 'Loose Gap',
                        gap: 'loose',
                        title: 'Title with loose gap',
                        subtitle: 'Subtitle with more spacing',
                    },
                ],
            },
            {
                title: 'Edge Cases',
                items: [
                    { label: 'Empty Content', title: '', subtitle: '' },
                    { label: 'Title Only', title: 'Financial Dashboard' },
                    {
                        label: 'Very Long Title',
                        title: 'This is a very long title that might wrap to multiple lines in narrow containers',
                        subtitle: 'Short subtitle',
                    },
                    {
                        label: 'Very Long Subtitle',
                        title: 'Short Title',
                        subtitle: 'This is a very long subtitle that contains lots of descriptive text that might wrap',
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
