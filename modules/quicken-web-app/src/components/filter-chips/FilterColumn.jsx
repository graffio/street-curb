// ABOUTME: Shared filter column layout component for chip + detail lines
// ABOUTME: Used by all chip column wrappers to render chip above detail text

const columnStyle = { display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }
const detailTextStyle = {
    fontSize: 'var(--font-size-1)',
    color: 'var(--gray-11)',
    lineHeight: 1.3,
    paddingLeft: 'var(--space-2)',
}

// A filter column with chip and detail lines below
// @sig FilterColumn :: { chip: ReactElement, details: [String] } -> ReactElement
const FilterColumn = ({ chip, details }) => (
    <div style={columnStyle}>
        {chip}
        {details.map((line, i) => (
            <span key={i} style={detailTextStyle}>
                {line}
            </span>
        ))}
    </div>
)

export { FilterColumn }
