// ABOUTME: Dialog for reopening last file or opening a new one
// ABOUTME: Shown on app startup when a previous file handle exists

import { KeymapModule } from '@graffio/keymap'
import { Button, Flex, Text } from '@radix-ui/themes'
import { KeymapConfig } from '../keymap-config.js'
import { Dialog } from './Dialog.jsx'

const { ActionRegistry } = KeymapModule

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const handleContentKey = KeymapConfig.createContentKeyHandler(() => undefined)

const CONTENT_PROPS = { onKeyDown: handleContentKey, onEscapeKeyDown: e => e.preventDefault(), maxWidth: '320px' }

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

let fileOpenCleanup

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Dialog prompting user to reopen last file or open new one
// @sig FileOpenDialog :: { open, onOpenChange, onReopen, onOpenNew } -> ReactElement
const FileOpenDialog = ({ open, onOpenChange, onReopen, onOpenNew }) => {
    // Registers dialog actions on mount, cleans up on unmount
    // @sig ref :: Element? -> void
    const ref = element => {
        fileOpenCleanup?.()
        fileOpenCleanup = undefined
        if (!element) return
        fileOpenCleanup = ActionRegistry.register(undefined, [
            { id: 'dismiss', description: 'Close', execute: () => onOpenChange(false) },
            { id: 'file:reopen', description: 'Reopen Last', execute: () => onReopen() },
            { id: 'file:open-new', description: 'Open New', execute: () => onOpenNew() },
        ])
    }

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content ref={ref} {...CONTENT_PROPS}>
                    <Dialog.Title>Open File</Dialog.Title>
                    <Dialog.Description asChild>
                        <Text size="2" style={{ marginBottom: 'var(--space-4)' }}>
                            Would you like to reopen your last file or choose a new one?
                        </Text>
                    </Dialog.Description>
                    <Flex gap="3" justify="end">
                        <Button variant="soft" onClick={onOpenNew}>
                            Open New...
                        </Button>
                        <Button variant="solid" onClick={onReopen}>
                            Reopen Last
                        </Button>
                    </Flex>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export { FileOpenDialog }
