// ABOUTME: Sidebar reports list that opens report tabs on click
// ABOUTME: Dispatches OpenView actions for report views

import { KeymapModule } from '@graffio/keymap'
import { Box, Button, Flex, Heading, Text } from '@radix-ui/themes'
import { post } from '../commands/post.js'
import { PickerConfig } from '../picker-config.js'
import { Action } from '../types/action.js'

const { ActionRegistry } = KeymapModule

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Registers report:picker action when sidebar mounts — global scope (undefined viewId)
    // @sig registerActions :: Element? -> void
    registerActions: element => {
        reportsCleanup?.()
        reportsCleanup = undefined
        if (!element) return
        reportsCleanup = ActionRegistry.register(undefined, [
            {
                id: 'report:picker',
                description: 'Open report picker',
                execute: () => post(Action.SetPickerOpen('reports')),
            },
        ])
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// COMPLEXITY: require-action-registry — keyboard equivalent is report:picker via QuickPicker
// Opens a report view when clicked
// @sig ReportButton :: { item: Object } -> ReactElement
const ReportButton = ({ item }) => (
    <Button variant="ghost" onClick={item.execute} style={REPORT_BUTTON_STYLE}>
        <Flex justify="between" width="100%">
            <Text size="2">{item.label}</Text>
        </Flex>
    </Button>
)

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const REPORT_BUTTON_STYLE = { justifyContent: 'flex-start', width: '100%' }

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

let reportsCleanup

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Sidebar section listing available reports
// @sig ReportsList :: () -> ReactElement
const ReportsList = () => (
    <Box ref={E.registerActions}>
        <Heading as="h3" size="3" m="3" style={{ fontWeight: 'lighter' }}>
            Reports
        </Heading>
        <Flex direction="column" gap="1" mx="3">
            {PickerConfig.reports.items.map(item => (
                <ReportButton key={item.id} item={item} />
            ))}
        </Flex>
    </Box>
)

export { ReportsList }
