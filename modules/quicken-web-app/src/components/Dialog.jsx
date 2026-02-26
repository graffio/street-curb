// ABOUTME: Portal-aware Dialog wrapping @radix-ui/react-dialog with proper theme inheritance
// ABOUTME: Includes OkCancel content variant with ActionRegistry keyboard support for dismiss/select

import { KeymapModule } from '@graffio/keymap'
import * as RadixDialog from '@radix-ui/react-dialog'
import { Button, Flex } from '@radix-ui/themes'
import { forwardRef } from 'react'
import { KeymapConfig } from '../keymap-config.js'

const { ActionRegistry } = KeymapModule

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

let _portalContainer

const F = {
    // Merges title base style with optional overrides
    // @sig toTitleStyle :: Style? -> Style
    toTitleStyle: style => ({
        fontSize: 'var(--font-size-4)',
        fontWeight: '600',
        color: 'var(--gray-12)',
        marginBottom: 'var(--space-3)',
        ...style,
    }),

    // Merges overlay base style with optional overrides
    // @sig toOverlayStyle :: Style? -> Style
    toOverlayStyle: style => ({
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--black-a-8)',
        zIndex: 10000,
        ...style,
    }),

    // Merges content base style with maxWidth and optional overrides
    // @sig toContentStyle :: (String, Style?) -> Style
    toContentStyle: (maxWidth, style) => ({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxHeight: '90vh',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-panel-solid)',
        borderRadius: 'var(--radius-4)',
        boxShadow: 'var(--shadow-6)',
        fontFamily: 'var(--default-font-family)',
        zIndex: 10001,
        maxWidth,
        ...style,
    }),

    // Creates (or returns cached) themed portal container for dialog rendering outside app tree
    // @sig createPortalContainer :: () -> HTMLElement
    createPortalContainer: () => {
        if (!_portalContainer) {
            _portalContainer = document.createElement('div')
            _portalContainer.className = 'radix-themes'
            _portalContainer.setAttribute('data-radius', 'medium')
            _portalContainer.setAttribute('data-scaling', '100%')
            _portalContainer.setAttribute('data-accent-color', 'blue')
            _portalContainer.setAttribute('data-gray-color', 'gray')
            _portalContainer.setAttribute('data-appearance', 'light')
            _portalContainer.style.position = 'fixed'
            _portalContainer.style.inset = '0'
            _portalContainer.style.pointerEvents = 'none'
            _portalContainer.style.zIndex = '9999'
            document.body.appendChild(_portalContainer)
        }
        return _portalContainer
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Dialog Title component
// @sig Title :: Props -> JSXElement
const Title = ({ children, className, style, ...props }) => (
    <RadixDialog.Title className={className} style={F.toTitleStyle(style)} {...props}>
        {children}
    </RadixDialog.Title>
)

// Dialog Description component
// @sig Description :: Props -> JSXElement
const Description = ({ children, className, style, ...props }) => (
    <RadixDialog.Description className={className} style={style} {...props}>
        {children}
    </RadixDialog.Description>
)

// Dialog Close component
// @sig Close :: Props -> JSXElement
const Close = ({ children, ...props }) => <RadixDialog.Close {...props}>{children}</RadixDialog.Close>

// Portal with theme-aware persistent container
// @sig Portal :: { children: ReactNode, container?: HTMLElement } -> JSXElement
const Portal = ({ children, container }) => (
    <RadixDialog.Portal container={container || F.createPortalContainer()}>{children}</RadixDialog.Portal>
)

// Dialog Root component
// @sig Root :: Props -> JSXElement
const Root = ({ children, ...props }) => <RadixDialog.Root {...props}>{children}</RadixDialog.Root>

// Dialog Trigger component
// @sig Trigger :: Props -> JSXElement
const Trigger = ({ children, ...props }) => <RadixDialog.Trigger {...props}>{children}</RadixDialog.Trigger>

// Dialog Overlay component
// @sig Overlay :: Props -> JSXElement
const Overlay = forwardRef(({ className, style, ...props }, ref) => (
    <RadixDialog.Overlay ref={ref} className={className} style={F.toOverlayStyle(style)} {...props} />
))
Overlay.displayName = 'Dialog.Overlay'

// Dialog Content with keyboard routing when used with ConfirmButtons
// @sig Content :: Props -> JSXElement
const Content = forwardRef(({ children, className, style, maxWidth = '90vw', ...props }, ref) => (
    <RadixDialog.Content ref={ref} className={className} style={F.toContentStyle(maxWidth, style)} {...props}>
        {children}
    </RadixDialog.Content>
))
Content.displayName = 'Dialog.Content'

// Content variant with OK/Cancel buttons and ActionRegistry keyboard support (dismiss/select)
// Ref callback registers actions at effect-time — no render-time side effects
// @sig OkCancel :: { onConfirm, onCancel, confirmLabel?, cancelLabel?, children, ...contentProps } -> ReactElement
const OkCancel = ({ onConfirm, onCancel, confirmLabel = 'OK', cancelLabel = 'Cancel', children, ...contentProps }) => {
    // Registers dismiss/select actions on mount, cleans up on unmount
    // @sig ref :: Element? -> void
    const ref = element => {
        confirmCleanup?.()
        confirmCleanup = undefined
        if (!element) return
        confirmCleanup = ActionRegistry.register(undefined, [
            { id: 'dismiss', description: 'Cancel', execute: () => onCancel() },
            { id: 'select', description: 'Confirm', execute: () => onConfirm() },
        ])
    }

    return (
        <Content ref={ref} onKeyDown={handleContentKey} onEscapeKeyDown={e => e.preventDefault()} {...contentProps}>
            {children}
            <Flex gap="3" justify="end">
                <Button variant="soft" onClick={onCancel}>
                    {cancelLabel}
                </Button>
                <Button variant="solid" onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </Flex>
        </Content>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const handleContentKey = KeymapConfig.createContentKeyHandler(() => undefined)

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

let confirmCleanup

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const Dialog = { Root, Portal, Trigger, Overlay, Content, Title, Description, Close, OkCancel }
export { Dialog }
