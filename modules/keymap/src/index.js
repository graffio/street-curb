// ABOUTME: Public API for @graffio/keymap
// ABOUTME: Exports types (Intent, Keymap) and normalizeKey utility

import { Intent } from './types/intent.js'
import { Keymap } from './types/keymap.js'
import { normalizeKey } from './keymap.js'

const KeymapModule = { Intent, Keymap, normalizeKey }

export { KeymapModule }
