// ABOUTME: Portal-aware Dialog wrapping @radix-ui/react-dialog with proper theme inheritance
// ABOUTME: Automatically creates themed portal container for dialogs rendered outside app tree

import * as RadixDialog from '@radix-ui/react-dialog'
import { forwardRef } from 'react'

let _portalContainer = null

const TITLE_BASE_STYLE = {
    fontSize: 'var(--font-size-4)',
    fontWeight: '600',
    color: 'var(--gray-12)',
    marginBottom: 'var(--space-3)',
}

const F = {
    // Merges title base style with optional overrides
    // @sig toTitleStyle :: Style? -> Style
    toTitleStyle: style => ({ ...TITLE_BASE_STYLE, ...style }),

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

const OVERLAY_STYLE = { position: 'fixed', inset: 0, backgroundColor: 'var(--black-a-8)', zIndex: 10000 }

// Dialog Overlay component
// @sig Overlay :: Props -> JSXElement
const Overlay = forwardRef(({ className, style, ...props }, ref) => {
    const overlayStyle = { ...OVERLAY_STYLE, ...style }
    return <RadixDialog.Overlay ref={ref} className={className} style={overlayStyle} {...props} />
})
Overlay.displayName = 'Dialog.Overlay'

const CONTENT_BASE_STYLE = {
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
}

// Dialog Content component with automatic centering
// @sig Content :: Props -> JSXElement
const Content = forwardRef(({ children, className, style, maxWidth = '90vw', ...props }, ref) => {
    const contentStyle = { ...CONTENT_BASE_STYLE, maxWidth, ...style }

    return (
        <RadixDialog.Content ref={ref} className={className} style={contentStyle} {...props}>
            {children}
        </RadixDialog.Content>
    )
})
Content.displayName = 'Dialog.Content'

const Dialog = { Root, Portal, Trigger, Overlay, Content, Title, Description, Close }
export { Dialog }
