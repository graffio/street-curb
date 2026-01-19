// ABOUTME: Bottom drawer showing available keyboard shortcuts
// ABOUTME: Groups keybindings by source context with formatted key symbols

import { Box, Button, Flex, Heading, ScrollArea, Text } from '@radix-ui/themes'
import { KeymapModule } from '@graffio/keymap'

const { formatKeys } = KeymapModule

const T = {
    // Accumulates an intent into the appropriate source group
    // @sig accumulateBySource :: ({ [source]: [Intent] }, Intent) -> { [source]: [Intent] }
    accumulateBySource: (groups, intent) => {
        const source = intent.from || 'Global'
        if (!groups[source]) groups[source] = []
        groups[source].push(intent)
        return groups
    },

    // Groups intents by their source keymap
    // @sig groupBySource :: [Intent] -> { [source]: [Intent] }
    groupBySource: intents => intents.reduce(T.accumulateBySource, {}),

    // Sorts group entries alphabetically by name
    // @sig toSortedEntries :: { [String]: [Intent] } -> [[String, [Intent]]]
    toSortedEntries: groups => Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)),
}

// Renders a single keybinding row
// @sig KeybindingRow :: { keys, description } -> ReactElement
const KeybindingRow = ({ keys, description }) => (
    <Flex gap="3" py="1">
        <Text size="2" style={{ fontFamily: 'monospace', minWidth: '80px', color: 'var(--gray-11)' }}>
            {formatKeys(keys)}
        </Text>
        <Text size="2">{description}</Text>
    </Flex>
)

// Renders intent as keybinding row
// @sig IntentRow :: Intent -> ReactElement
const IntentRow = intent => {
    const { description, keys } = intent
    return <KeybindingRow key={description} keys={keys} description={description} />
}

// Renders a group of keybindings with header
// @sig KeybindingGroup :: { name, intents } -> ReactElement
const KeybindingGroup = ({ name, intents }) => (
    <Box style={{ minWidth: '200px', flex: '1 1 200px' }}>
        <Heading size="2" mb="2" style={{ color: 'var(--gray-11)' }}>
            {name}
        </Heading>
        {intents.map(IntentRow)}
    </Box>
)

// Bottom drawer showing keyboard shortcuts grouped by source
// @sig KeymapDrawer :: { open, onOpenChange, intents, height? } -> ReactElement | null
const KeymapDrawer = ({ open, onOpenChange, intents, height = 290 }) => {
    if (!open) return null

    const groups = T.groupBySource(intents)

    return (
        <Box
            style={{
                height: `${height}px`,
                flexShrink: 0,
                borderTop: '1px solid var(--gray-6)',
                backgroundColor: 'var(--gray-2)',
            }}
        >
            <Flex justify="between" align="center" px="3" py="2" style={{ borderBottom: '1px solid var(--gray-4)' }}>
                <Text size="2" weight="medium">
                    Keyboard Shortcuts
                </Text>
                <Button variant="ghost" size="1" onClick={() => onOpenChange(false)}>
                    ✕
                </Button>
            </Flex>
            <ScrollArea style={{ height: `${height - 40}px` }}>
                <Flex gap="5" p="3" wrap="wrap">
                    {T.toSortedEntries(groups).map(([name, groupIntents]) => (
                        <KeybindingGroup key={name} name={name} intents={groupIntents} />
                    ))}
                </Flex>
            </ScrollArea>
        </Box>
    )
}

export { KeymapDrawer }
