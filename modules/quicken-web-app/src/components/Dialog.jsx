// ABOUTME: Portal-aware Dialog wrapping @radix-ui/react-dialog with proper theme inheritance
// ABOUTME: Automatically creates themed portal container for dialogs rendered outside app tree
// COMPLEXITY: react-redux-separation — Portal manages DOM portal container lifecycle (useState + useEffect required)

import * as RadixDialog from '@radix-ui/react-dialog'
import { forwardRef, useEffect, useState } from 'react'

const F = {
    // Creates a portal container with proper Radix theme attributes
    // @sig createPortalContainer :: () -> HTMLElement
    createPortalContainer: () => {
        const container = document.createElement('div')
        container.className = 'radix-themes'
        container.setAttribute('data-radius', 'medium')
        container.setAttribute('data-scaling', '100%')
        container.setAttribute('data-accent-color', 'blue')
        container.setAttribute('data-gray-color', 'gray')
        container.setAttribute('data-appearance', 'light')
        container.style.position = 'fixed'
        container.style.inset = '0'
        container.style.pointerEvents = 'none'
        container.style.zIndex = '9999'
        document.body.appendChild(container)
        return container
    },

    // Removes portal container from DOM
    // @sig cleanupPortalContainer :: HTMLElement -> Void
    cleanupPortalContainer: container => {
        if (document.body.contains(container)) document.body.removeChild(container)
    },
}

// Dialog Title component
// @sig Title :: Props -> JSXElement
const Title = ({ children, className, style, ...props }) => {
    const titleStyle = {
        fontSize: 'var(--font-size-4)',
        fontWeight: '600',
        color: 'var(--gray-12)',
        marginBottom: 'var(--space-3)',
        ...style,
    }

    return (
        <RadixDialog.Title className={className} style={titleStyle} {...props}>
            {children}
        </RadixDialog.Title>
    )
}

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

const E = {
    // Creates portal container on mount and cleans up on unmount (skips if custom container provided)
    // @sig portalLifecycle :: (HTMLElement?, Function) -> (() -> void)?
    portalLifecycle: (customContainer, setPortalContainer) => {
        if (customContainer) return
        const container = F.createPortalContainer()
        setPortalContainer(container)
        return () => F.cleanupPortalContainer(container)
    },
}

// Portal with theme-aware container creation and cleanup
// @sig Portal :: { children: ReactNode, container?: HTMLElement } -> JSXElement
const Portal = ({ children, container: customContainer }) => {
    const [portalContainer, setPortalContainer] = useState(customContainer || null)

    useEffect(() => E.portalLifecycle(customContainer, setPortalContainer), [customContainer])

    if (!portalContainer) return null
    return <RadixDialog.Portal container={portalContainer}>{children}</RadixDialog.Portal>
}

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
