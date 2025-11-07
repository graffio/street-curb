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
 * Compound TitleAndSubtitle component with variants for sizes and gaps
 * @sig TitleAndSubtitle :: ({ gap: String?, children: ReactNode }) -> ReactElement
 */
const TitleAndSubtitle = ({ gap = 'normal', children }) => {
    const containerStyle = {
        display: 'grid',
        gridTemplateRows: 'auto auto',
        alignContent: 'center',
        gap: getGapValue(gap),
    }

    return <div style={containerStyle}>{children}</div>
}

/**
 * Title subcomponent
 * @sig Title :: ({ size: String?, children: ReactNode }) -> ReactElement
 */
TitleAndSubtitle.Title = ({ size = 'lg', children }) => {
    const titleStyle = {
        fontWeight: '700',
        color: 'var(--gray-12)',
        lineHeight: 1,
        margin: 0,
        fontSize: getTitleFontSize(size),
    }

    return <div style={titleStyle}>{children}</div>
}

/**
 * Subtitle subcomponent
 * @sig Subtitle :: ({ size: String?, children: ReactNode }) -> ReactElement
 */
TitleAndSubtitle.Subtitle = ({ size = 'xs', children }) => {
    const subtitleStyle = { color: 'var(--gray-12)', lineHeight: 1, margin: 0, fontSize: getSubtitleFontSize(size) }

    return <div style={subtitleStyle}>{children}</div>
}

export { TitleAndSubtitle }
