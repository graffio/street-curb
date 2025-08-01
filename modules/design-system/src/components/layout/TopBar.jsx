import { layoutChannel, useChannel } from '../../channels/index.js'
import { TitleAndSubtitle } from '../TitleAndSubtitle/TitleAndSubtitle.jsx'
import { container, rightSection } from './TopBar.css.js'

/**
 * TopBar component provides the application header
 *
 * @sig TopBar :: () -> ReactElement
 */
const TopBar = () => {
    const [{ title, subtitle, topBarActions }] = useChannel(layoutChannel, ['title', 'subtitle', 'topBarActions'])

    return (
        <div className={container}>
            <TitleAndSubtitle gap="tight">
                <TitleAndSubtitle.Title size="lg">{title || 'Finance Dashboard'}</TitleAndSubtitle.Title>
                {subtitle && <TitleAndSubtitle.Subtitle size="xs">{subtitle}</TitleAndSubtitle.Subtitle>}
            </TitleAndSubtitle>
            <div className={rightSection}>
                {topBarActions}
                {/* Default user menu, notifications, etc. */}
            </div>
        </div>
    )
}

export { TopBar }
