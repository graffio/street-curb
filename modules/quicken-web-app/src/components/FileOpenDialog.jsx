// ABOUTME: Dialog for reopening last file or opening a new one
// ABOUTME: Shown on app startup when a previous file handle exists

import { Button, Flex, Text } from '@radix-ui/themes'
import { Dialog } from './Dialog.jsx'

// Dialog prompting user to reopen last file or open new one
// @sig FileOpenDialog :: { open, onOpenChange, onReopen, onOpenNew } -> ReactElement
const FileOpenDialog = ({ open, onOpenChange, onReopen, onOpenNew }) => (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content maxWidth="320px">
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

export { FileOpenDialog }
