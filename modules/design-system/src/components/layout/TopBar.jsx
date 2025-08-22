import { layoutChannel, useChannel } from '../../channels/index.js'
import { TitleAndSubtitle } from '../TitleAndSubtitle/TitleAndSubtitle.jsx'

/**
 * TopBar component provides the application header
 *
 * @sig TopBar :: () -> ReactElement
 */
const TopBar = () => {
    const [{ title, subtitle, topBarActions }] = useChannel(layoutChannel, ['title', 'subtitle', 'topBarActions'])

    const containerStyle = {
        height: '100%',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--gray-6)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-4)',
    }

    const rightSectionStyle = { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }

    return (
        <div style={containerStyle}>
            <TitleAndSubtitle gap="tight">
                <TitleAndSubtitle.Title size="lg">{title || 'Finance Dashboard'}</TitleAndSubtitle.Title>
                {subtitle && <TitleAndSubtitle.Subtitle size="xs">{subtitle}</TitleAndSubtitle.Subtitle>}
            </TitleAndSubtitle>
            <div style={rightSectionStyle}>
                {topBarActions}
                {/* Default user menu, notifications, etc. */}
            </div>
        </div>
    )
}

export { TopBar }
