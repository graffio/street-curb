import React from 'react'
import { container, subtitle, title } from './TitleAndSubtitle.css.js'

/**
 * Compound TitleAndSubtitle component with variants for sizes and gaps
 * @sig TitleAndSubtitle :: ({ gap: String?, children: ReactNode }) -> ReactElement
 */
const TitleAndSubtitle = ({ gap = 'normal', children }) => <div className={container({ gap })}>{children}</div>

/**
 * Title subcomponent
 * @sig Title :: ({ size: String?, children: ReactNode }) -> ReactElement
 */
TitleAndSubtitle.Title = ({ size = 'lg', children }) => <div className={title({ size })}>{children}</div>

/**
 * Subtitle subcomponent
 * @sig Subtitle :: ({ size: String?, children: ReactNode }) -> ReactElement
 */
TitleAndSubtitle.Subtitle = ({ size = 'xs', children }) => <div className={subtitle({ size })}>{children}</div>

export { TitleAndSubtitle }
