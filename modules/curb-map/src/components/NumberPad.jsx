import { Box, Button, Dialog, Grid, Text } from '@graffio/design-system'
import { useCallback, useEffect, useState } from 'react'

/**
 * NumberPad - Mobile-optimized number input component using Radix UI
 *
 * Migrated version of NumberPad using design system components.
 * Provides a custom number pad interface for one-handed thumb interaction
 * during field data collection, replacing the device keyboard.
 */

/**
 * Validates input value against constraints
 * @sig validateInput :: (String, Number, Number) -> { isValid: Boolean, errorMessage: String }
 */
const validateInput = (input, min, max) => {
    if (!input || input === '.') return { isValid: false, errorMessage: 'Enter a number' }

    const num = parseFloat(input)
    if (isNaN(num)) return { isValid: false, errorMessage: 'Invalid number' }
    if (num < min) return { isValid: false, errorMessage: `Minimum ${min}` }
    if (num > max) return { isValid: false, errorMessage: `Maximum ${max}` }

    return { isValid: true, errorMessage: '' }
}

/**
 * Processes number key input
 * @sig processNumberInput :: (String, String) -> String
 */
const processNumberInput = (currentInput, key) => {
    if (currentInput === '0') return key
    return currentInput + key
}

/**
 * Processes decimal point input
 * @sig processDecimalInput :: String -> String
 */
const processDecimalInput = currentInput => {
    if (currentInput.includes('.')) return currentInput
    return currentInput + '.'
}

/**
 * Processes backspace input
 * @sig processBackspaceInput :: String -> String
 */
const processBackspaceInput = currentInput => {
    if (currentInput.length <= 1) return ''
    return currentInput.slice(0, -1)
}

/**
 * Gets button variant based on key type
 * @sig getButtonVariant :: String -> String
 */
const getButtonVariant = key => {
    if (key === 'enter') return 'solid'
    if (key === 'cancel') return 'soft'
    return 'surface'
}

/**
 * Gets button color based on key type
 * @sig getButtonColor :: String -> String
 */
const getButtonColor = key => {
    if (key === 'enter') return 'green'
    if (key === 'cancel') return 'red'
    return 'gray'
}

/**
 * Gets button text/icon based on key type
 * @sig getButtonText :: String -> String
 */
const getButtonText = key => {
    if (key === 'enter') return '✓'
    if (key === 'cancel') return '✗'
    if (key === 'backspace') return '←'
    if (key === 'clear') return 'C'
    return key
}

/**
 * Renders individual number pad button
 * @sig renderNumberButton :: (String, Function, String) -> JSXElement
 */
const renderNumberButton = (key, onKeyPress) => {
    const numberButtonStyle = {
        aspectRatio: '1',
        fontSize: '20px',
        fontWeight: '600',
        height: '64px',
        width: '64px',
        minWidth: '64px',
        backgroundColor: 'var(--accent-3)',
        border: '1px solid var(--accent-6)',
        borderRadius: 'var(--radius-2)',
        margin: '3px',
    }

    return (
        <Button key={key} variant="soft" size="4" onClick={() => onKeyPress(key)} style={numberButtonStyle}>
            {key}
        </Button>
    )
}

/**
 * Renders function button (backspace, enter, cancel)
 * @sig renderFunctionButton :: (String, Function, String, Boolean) -> JSXElement
 */
const renderFunctionButton = (key, onKeyPress, currentInput, isValid) => {
    const isEnter = key === 'enter'
    const disabled = isEnter && !isValid

    const functionButtonStyle = {
        aspectRatio: '1',
        fontSize: '18px',
        fontWeight: '600',
        height: '64px',
        width: '64px',
        minWidth: '64px',
        borderRadius: 'var(--radius-2)',
        border: '1px solid var(--gray-6)',
        margin: '3px',
    }

    return (
        <Button
            key={key}
            variant={getButtonVariant(key)}
            color={getButtonColor(key)}
            size="4"
            onClick={() => onKeyPress(key)}
            disabled={disabled}
            style={functionButtonStyle}
        >
            {getButtonText(key)}
        </Button>
    )
}

/**
 * Mobile-optimized number input component using Radix UI
 * @sig NumberPad :: ({ value: Number, min: Number, max: Number, onSave: Function, onCancel: Function, label: String }) -> JSXElement
 */
const NumberPad = ({ value, min = 0, max = 999, onSave, onCancel, label = 'Value' }) => {
    const dialogOverlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10000 }

    const dialogContentStyle = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '236px',
        maxHeight: '80vh',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2)',
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
        zIndex: 10001,
    }

    const dialogTitleStyle = {
        textAlign: 'center',
        marginBottom: '8px',
        fontSize: '18px',
        fontWeight: '600',
        color: '#374151',
    }

    const dialogDescriptionStyle = { display: 'none' }

    const inputContainerStyle = {
        backgroundColor: 'var(--gray-2)',
        borderRadius: '12px',
        border: '2px solid var(--gray-6)',
        textAlign: 'center',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
    }

    const inputContainerErrorStyle = {
        ...inputContainerStyle,
        backgroundColor: 'var(--red-2)',
        border: '2px solid var(--red-6)',
    }

    const [input, setInput] = useState(value.toString())
    const { isValid, errorMessage } = validateInput(input, min, max)

    const handleEscapeKey = useCallback((e, onCancel) => {
        if (e.key === 'Escape') onCancel()
    }, [])

    useEffect(() => {
        const handleKeyDown = e => handleEscapeKey(e, onCancel)
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onCancel, handleEscapeKey])

    const handleKeyPress = useCallback(
        // prettier-ignore
        key => {
            if (key === 'enter' && isValid) onSave(parseFloat(input))
            if (key === 'cancel')           onCancel()
            if (key === 'backspace')        setInput(processBackspaceInput(input))
            if (key === 'clear')            setInput('0')
            if (key === '.')                setInput(processDecimalInput(input))
            if (key >= '0' && key <= '9')   setInput(processNumberInput(input, key))
        },
        [input, isValid, onSave, onCancel, min, max],
    )

    return (
        <Dialog.Root open={true}>
            <Dialog.Portal>
                <Dialog.Overlay style={dialogOverlayStyle} />
                <Dialog.Content style={dialogContentStyle}>
                    <Dialog.Title style={dialogTitleStyle}>{label}</Dialog.Title>
                    <Dialog.Description style={dialogDescriptionStyle}>
                        Number input dialog for {label}
                    </Dialog.Description>
                    <Box mb="3">
                        <Box p="4" style={isValid ? inputContainerStyle : inputContainerErrorStyle}>
                            <Text size="8" weight="bold" color={isValid ? 'gray' : 'red'}>
                                {input || '0'}
                            </Text>
                        </Box>
                        {!isValid && errorMessage && (
                            <Text size="3" color="red" mt="2">
                                {errorMessage}
                            </Text>
                        )}
                    </Box>

                    <Grid columns="3" gap="2" mb="2">
                        {['1', '2', '3'].map(key => renderNumberButton(key, handleKeyPress))}
                        {['4', '5', '6'].map(key => renderNumberButton(key, handleKeyPress))}
                        {['7', '8', '9'].map(key => renderNumberButton(key, handleKeyPress))}
                        {renderNumberButton('0', handleKeyPress)}
                        {renderNumberButton('.', handleKeyPress)}
                        {renderFunctionButton('backspace', handleKeyPress, input, isValid)}
                    </Grid>

                    <Grid columns="3" gap="2">
                        {renderFunctionButton('clear', handleKeyPress, input, isValid)}
                        {renderFunctionButton('cancel', handleKeyPress, input, isValid)}
                        {renderFunctionButton('enter', handleKeyPress, input, isValid)}
                    </Grid>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export default NumberPad
