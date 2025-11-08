import { VirtualScroller } from '../src/components/VirtualScroller/VirtualScroller.jsx'

const defaultRenderRow = i => `Row ${i} - Content with details and information`

const coloredRenderRow = i => {
    const colors = ['#f3f4f6', '#ddd6fe', '#fef3c7', '#fecaca', '#d1fae5']
    const color = colors[i % colors.length]
    return (
        <div style={{ backgroundColor: color, padding: '16px', border: '1px solid #e5e7eb' }}>
            Row {i} - Scrolling performance demo with colored backgrounds
        </div>
    )
}

const Default = args => <VirtualScroller {...args} />

const WithSnapping = args => <VirtualScroller {...args} enableSnap />

const ColoredRows = args => <VirtualScroller {...args} renderRow={coloredRenderRow} />

export default {
    title: 'VirtualScroller',
    component: VirtualScroller,
    args: { rowCount: 10000, rowHeight: 60, height: 600, renderRow: defaultRenderRow },
    argTypes: { enableSnap: { control: 'boolean' } },
}

export { Default, WithSnapping, ColoredRows }
