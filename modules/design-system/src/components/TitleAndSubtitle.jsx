import React from 'react'

/**
 * Gets gap value based on variant
 * @sig getGapValue :: String -> String
 */
const getGapValue = gap => {
    const gapMap = { tight: '1px', normal: '2px', loose: '4px' }
    return gapMap[gap] || gapMap.normal
}

/**
 * Gets title font size based on variant
 * @sig getTitleFontSize :: String -> String
 */
const getTitleFontSize = size => {
    const sizeMap = { md: 'var(--font-size-3)', lg: 'var(--font-size-4)', xl: 'var(--font-size-5)' }
    return sizeMap[size] || sizeMap.lg
}

/**
 * Gets subtitle font size based on variant
 * @sig getSubtitleFontSize :: String -> String
 */
const getSubtitleFontSize = size => {
    const sizeMap = { xs: 'var(--font-size-1)', sm: 'var(--font-size-2)', md: 'var(--font-size-3)' }
    return sizeMap[size] || sizeMap.xs
}

/**
 * TitleAndSubtitle component displays title with optional subtitle
 * @sig TitleAndSubtitle :: ({ title: String, subtitle: String?, gap: String?, titleSize: String?, subtitleSize: String? }) -> ReactElement
 */
const TitleAndSubtitle = ({ title, subtitle, gap = 'normal', titleSize = 'lg', subtitleSize = 'xs' }) => {
    const titleFontSize = getTitleFontSize(titleSize)
    const subtitleFontSize = getSubtitleFontSize(subtitleSize)

    const gridTemplateRows = subtitle ? 'auto auto' : 'auto'
    const containerStyle = { display: 'grid', gridTemplateRows, alignContent: 'center', gap: getGapValue(gap) }
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
