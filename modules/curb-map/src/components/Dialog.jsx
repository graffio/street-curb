// ABOUTME: Portal-aware Dialog wrapping @radix-ui/react-dialog with theme inheritance
// ABOUTME: Copied inline for curb-map (mothballed) — canonical version in quicken-web-app
// COMPLEXITY: aboutme-comment — added above
// COMPLEXITY: cohesion-structure — curb-map is mothballed; original design-system structure preserved
// COMPLEXITY: react-redux-separation — Portal manages DOM lifecycle (useState + useEffect required)
// COMPLEXITY: sig-documentation — curb-map is mothballed; JSDoc already documents these functions
// COMPLEXITY: single-level-indentation — curb-map is mothballed; useEffect callback manages lifecycle

import * as RadixDialog from '@radix-ui/react-dialog'
import { forwardRef, useEffect, useState } from 'react'

/**
 * Portal-aware Dialog component with proper theme inheritance
 *
 * This component wraps @radix-ui/react-dialog to handle the common issue where
 * dialogs rendered outside the main app tree lose theme context. It automatically
 * creates a portal container with the necessary Radix Themes attributes.
 */

/**
 * Dialog Title component
 * @sig Title :: ({ children: ReactNode, className?: String, style?: Object }) -> JSXElement
 */
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

/**
 * Dialog Description component
 * @sig Description :: ({ children: ReactNode, className?: String, style?: Object }) -> JSXElement
 */
const Description = ({ children, className, style, ...props }) => (
    <RadixDialog.Description className={className} style={style} {...props}>
        {children}
    </RadixDialog.Description>
)

/**
 * Dialog Close component
 * @sig Close :: ({ children: ReactNode, asChild?: Boolean }) -> JSXElement
 */
const Close = ({ children, ...props }) => <RadixDialog.Close {...props}>{children}</RadixDialog.Close>

/**
 * Creates a portal container with proper theme attributes
 * @sig createPortalContainer :: () -> HTMLElement
 */
const createPortalContainer = () => {
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

    // Append to body instead of documentElement to work with Radix accessibility features
    document.body.appendChild(container)
    return container
}

/**
 * Cleanup portal container from DOM
 * @sig cleanupPortalContainer :: HTMLElement -> Void
 */
const cleanupPortalContainer = container => {
    if (document.body.contains(container)) document.body.removeChild(container)
}

/**
 * Handle portal cleanup effect
 * @sig handlePortalCleanup :: HTMLElement -> () -> Void
 */
const handlePortalCleanup = container => () => cleanupPortalContainer(container)

/**
 * Portal component that handles theme-aware rendering
 * @sig Portal :: ({ children: ReactNode, container?: HTMLElement }) -> JSXElement
 */
const Portal = ({ children, container: customContainer }) => {
    const [portalContainer, setPortalContainer] = useState(customContainer || null)

    useEffect(() => {
        if (customContainer) return

        const container = createPortalContainer()
        setPortalContainer(container)

        return handlePortalCleanup(container)
    }, [customContainer])

    if (!portalContainer) return null

    return <RadixDialog.Portal container={portalContainer}>{children}</RadixDialog.Portal>
}

/**
 * Dialog Root component
 * @sig Root :: ({ children: ReactNode, open?: Boolean, onOpenChange?: Function, modal?: Boolean }) -> JSXElement
 */
const Root = ({ children, ...props }) => <RadixDialog.Root {...props}>{children}</RadixDialog.Root>

/**
 * Dialog Trigger component
 * @sig Trigger :: ({ children: ReactNode, asChild?: Boolean }) -> JSXElement
 */
const Trigger = ({ children, ...props }) => <RadixDialog.Trigger {...props}>{children}</RadixDialog.Trigger>

/**
 * Dialog Overlay component
 * @sig Overlay :: ({ className?: String, style?: Object }) -> JSXElement
 */
const Overlay = forwardRef(({ className, style, ...props }, ref) => {
    const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'var(--black-a-8)', zIndex: 10000, ...style }

    return <RadixDialog.Overlay ref={ref} className={className} style={overlayStyle} {...props} />
})
Overlay.displayName = 'Dialog.Overlay'

/**
 * Dialog Content component with automatic centering
 * @sig Content :: ({ children: ReactNode, className?: String, style?: Object, maxWidth?: String }) -> JSXElement
 */
const Content = forwardRef(({ children, className, style, maxWidth = '90vw', ...props }, ref) => {
    const contentStyle = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth,
        maxHeight: '90vh',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-panel-solid)',
        borderRadius: 'var(--radius-4)',
        boxShadow: 'var(--shadow-6)',
        fontFamily: 'var(--default-font-family)',
        zIndex: 10001,
        ...style,
    }

    return (
        <RadixDialog.Content ref={ref} className={className} style={contentStyle} {...props}>
            {children}
        </RadixDialog.Content>
    )
})
Content.displayName = 'Dialog.Content'

const Dialog = { Root, Portal, Trigger, Overlay, Content, Title, Description, Close }
export { Dialog }
