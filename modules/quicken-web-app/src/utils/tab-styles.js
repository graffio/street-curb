// ABOUTME: Visual layout utilities for tab groups — colors, styles, and width clamping
// ABOUTME: Provides view-type color mappings and layout clamping for tab groups

const VIEW_COLORS = {
    Register: { focused: 'var(--blue-6)', active: 'var(--blue-4)', inactive: 'var(--blue-2)' },
    Report: { focused: 'var(--purple-6)', active: 'var(--purple-4)', inactive: 'var(--purple-3)' },
    Reconciliation: { focused: 'var(--green-6)', active: 'var(--green-4)', inactive: 'var(--green-2)' },
}

const T = {
    // Gets the accent color for a view based on type and active state
    // @sig toViewColor :: (View, Boolean) -> String
    toViewColor: (view, isActiveGroup) => {
        if (!view) return 'var(--accent-8)'
        const colors = VIEW_COLORS[view['@@tagName']]
        if (!colors) throw new Error(`Unknown view type: ${view['@@tagName']}`)
        return isActiveGroup ? colors.focused : colors.active
    },

    // Computes tab styling based on view type and state
    // @sig toTabStyle :: (String, Boolean, Boolean, Boolean) -> Object
    toTabStyle: (tagName, active, isDragging, activeGroup) => {
        const entry = VIEW_COLORS[tagName]
        if (!entry) throw new Error(`Unknown view type for tab style: ${tagName}`)
        const { focused, active: activeColor, inactive } = entry
        const bg = active && activeGroup ? focused : active ? activeColor : inactive
        return {
            padding: '6px 12px',
            marginRight: 'var(--space-1)',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: isDragging ? 0.5 : 1,
            backgroundColor: bg,
            borderRadius: 'var(--radius-3) var(--radius-3) 0 0',
            border: '1px solid var(--gray-5)',
            borderBottom: 'none',
            width: '160px',
        }
    },

    // Clamps widths to ensure neither group falls below minimum
    // @sig toClampedWidths :: (Number, Number, Number, Number) -> { left: Number, right: Number }
    toClampedWidths: (leftWidth, rightWidth, totalWidth, minWidth) => {
        if (leftWidth < minWidth) return { left: minWidth, right: totalWidth - minWidth }
        if (rightWidth < minWidth) return { left: totalWidth - minWidth, right: minWidth }
        return { left: leftWidth, right: rightWidth }
    },
}

const TabStyles = T

export { TabStyles }
