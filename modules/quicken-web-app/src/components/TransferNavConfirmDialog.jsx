// ABOUTME: Confirm dialog for transfer navigation when target account's date filter excludes the transfer date
// ABOUTME: Self-selecting — reads transferNavPending from Redux, renders nothing when not pending

import { Text } from '@radix-ui/themes'
import { useSelector } from 'react-redux'
import * as S from '../store/selectors.js'
import { Dialog } from './Dialog.jsx'

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const DIALOG_STYLE = { marginBottom: 'var(--space-4)' }

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Dialog asking user to adjust date filter to include a transfer's date
// @sig TransferNavConfirmDialog :: { onConfirm, onCancel } -> ReactElement | false
const TransferNavConfirmDialog = ({ onConfirm, onCancel }) => {
    const handleOpenChange = isOpen => {
        if (!isOpen) onCancel()
    }
    const pending = useSelector(S.transferNavPending)
    if (!pending) return false

    return (
        <Dialog.Root open onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.OkCancel maxWidth="380px" onConfirm={onConfirm} onCancel={onCancel}>
                    <Dialog.Title>Adjust Date Filter?</Dialog.Title>
                    <Dialog.Description asChild>
                        <Text size="2" style={DIALOG_STYLE}>
                            The matching transfer is outside the target account's current date filter. Adjust the filter
                            to include it?
                        </Text>
                    </Dialog.Description>
                </Dialog.OkCancel>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export { TransferNavConfirmDialog }
