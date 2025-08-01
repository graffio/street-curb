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
const Title = ({ children, className, style, ...props }) => (
    <RadixDialog.Title
        className={className}
        style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '16px', ...style }}
        {...props}
    >
        {children}
    </RadixDialog.Title>
)

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
const Overlay = forwardRef(({ className, style, ...props }, ref) => (
    <RadixDialog.Overlay
        ref={ref}
        className={className}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10000, ...style }}
        {...props}
    />
))
Overlay.displayName = 'Dialog.Overlay'

/**
 * Dialog Content component with automatic centering
 * @sig Content :: ({ children: ReactNode, className?: String, style?: Object, maxWidth?: String }) -> JSXElement
 */
const Content = forwardRef(({ children, className, style, maxWidth = '90vw', ...props }, ref) => (
    <RadixDialog.Content
        ref={ref}
        className={className}
        style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth,
            maxHeight: '90vh',
            padding: '16px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2)',
            fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, ' +
                '"Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
            zIndex: 10001,
            ...style,
        }}
        {...props}
    >
        {children}
    </RadixDialog.Content>
))
Content.displayName = 'Dialog.Content'

const Dialog = { Root, Portal, Trigger, Overlay, Content, Title, Description, Close }
export { Dialog }
