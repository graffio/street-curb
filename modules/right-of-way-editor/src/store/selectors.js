/**
 * Single selector that returns the current blockface
 * Components can then use Blockface domain methods directly
 * @sig currentBlockface :: State -> Blockface?
 */
const currentBlockface = state => state.blockfaces?.[state.currentBlockfaceId] || null

export { currentBlockface }
