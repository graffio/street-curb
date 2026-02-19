// ABOUTME: Title and subtitle display component with configurable sizing and gap
// ABOUTME: Used in MainLayout topbar for page title rendering

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Resolves gap variant to CSS value
    // @sig toGapValue :: String -> String
    toGapValue: gap => ({ tight: '1px', normal: '2px', loose: '4px' })[gap] || '2px',

    // Resolves title size variant to CSS font-size
    // @sig toTitleFontSize :: String -> String
    toTitleFontSize: size =>
        ({ md: 'var(--font-size-3)', lg: 'var(--font-size-4)', xl: 'var(--font-size-5)' })[size] ||
        'var(--font-size-4)',

    // Resolves subtitle size variant to CSS font-size
    // @sig toSubtitleFontSize :: String -> String
    toSubtitleFontSize: size =>
        ({ xs: 'var(--font-size-1)', sm: 'var(--font-size-2)', md: 'var(--font-size-3)' })[size] ||
        'var(--font-size-1)',
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Displays a title with optional subtitle
// @sig TitleAndSubtitle :: Props -> ReactElement
const TitleAndSubtitle = ({ title, subtitle, gap = 'normal', titleSize = 'lg', subtitleSize = 'xs' }) => {
    const titleFontSize = T.toTitleFontSize(titleSize)
    const subtitleFontSize = T.toSubtitleFontSize(subtitleSize)

    const gridTemplateRows = subtitle ? 'auto auto' : 'auto'
    const containerStyle = { display: 'grid', gridTemplateRows, alignContent: 'center', gap: T.toGapValue(gap) }
    const titleStyle = { fontWeight: '700', color: 'var(--gray-12)', lineHeight: 1, margin: 0, fontSize: titleFontSize }
    const subtitleStyle = { color: 'var(--gray-12)', lineHeight: 1, margin: 0, fontSize: subtitleFontSize }

    return (
        <div style={containerStyle}>
            <div style={titleStyle}>{title}</div>
            {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
        </div>
    )
}

export { TitleAndSubtitle }
