import { createChannel } from './channel.js'

/**
 * Layout communication channel for managing application layout state
 * @sig layoutChannel :: Channel
 */
const layoutChannel = createChannel({ title: '', subtitle: '', sidebarItems: [], topBarActions: null, breadcrumbs: [] })

export { layoutChannel }
