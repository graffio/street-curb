import { Box, Button, Dialog, Grid, Text } from '@graffio/design-system'
import { useState } from 'react'

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

const processNumberInput = (currentInput, button) => (currentInput === '0' ? button : currentInput + button)
const processDecimalInput = currentInput => (currentInput.includes('.') ? currentInput : currentInput + '.')
const processBackspaceInput = currentInput => (currentInput.length <= 1 ? '' : currentInput.slice(0, -1))

/**
 * Gets button color based on button type
 * @sig getButtonColor :: String -> String
 */
const getButtonColor = button => {
    if (button === 'enter') return 'green'
    if (button === 'cancel') return 'red'
    return 'gray'
}

/**
 * Gets button text/icon based on button type
 * @sig getButtonText :: String -> String
 */
const getButtonText = button => {
    if (button === 'enter') return '✓'
    if (button === 'cancel') return '✗'
    if (button === 'backspace') return '←'
    if (button === 'clear') return 'C'
    return button
}

const buttonStyle = { borderRadius: 'var(--radius-2)', height: '64px', margin: '3px', minWidth: '64px', width: '64px' }

/**
 * Individual number pad button component
 * @sig NumberButton :: ({ value: String, onClick: Function }) -> JSXElement
 */
const NumberButton = ({ value, onClick }) => (
    <Button variant="surface" size="4" onClick={() => onClick(value)} style={buttonStyle}>
        {value}
    </Button>
)

/**
 * Function button component (backspace, enter, cancel, clear)
 * @sig FunctionButton :: ({ type: String, onClick: Function, disabled: Boolean }) -> JSXElement
 */
const FunctionButton = ({ type, onClick, disabled }) => (
    <Button
        variant="surface"
        color={getButtonColor(type)}
        size="4"
        onClick={() => onClick(type)}
        disabled={disabled}
        style={buttonStyle}
    >
        {getButtonText(type)}
    </Button>
)

/**
 * Renders button grid layout
 * @sig NumberPadGrid :: ({ onClick: Function, isValid: Boolean }) -> JSXElement
 */
const NumberPadGrid = ({ onClick, isValid }) => {
    const renderNumber = k => <NumberButton key={k} value={k} onClick={onClick} />

    return (
        <>
            <Grid columns="3" gap="2" mb="2">
                {['1', '2', '3'].map(renderNumber)}
                {['4', '5', '6'].map(renderNumber)}
                {['7', '8', '9'].map(renderNumber)}

                <NumberButton key="0" value="0" onClick={onClick} />
                <NumberButton key="." value="." onClick={onClick} />
                <FunctionButton type="backspace" onClick={onClick} disabled={false} />
            </Grid>

            <Grid columns="3" gap="2">
                <FunctionButton type="clear" onClick={onClick} disabled={false} />
                <FunctionButton type="cancel" onClick={onClick} disabled={false} />
                <FunctionButton type="enter" onClick={onClick} disabled={!isValid} />
            </Grid>
        </>
    )
}

/**
 * Dialog content with state management and event handling
 * @sig Content :: ({ value: Number, min: Number, max: Number, onSave: Function, onCancel: Function, label: String }) -> JSXElement
 */
const Content = ({ value, min, max, onSave, onCancel }) => {
    // prettier-ignore
    const handleClick = button => {
        if (button === 'enter' && isValid)  onSave(parseFloat(input))
        if (button === 'cancel')            onCancel()
        if (button === 'backspace')         setInput(processBackspaceInput(input))
        if (button === 'clear')             setInput('0')
        if (button === '.')                 setInput(processDecimalInput(input))
        if (button >= '0' && button <= '9') setInput(processNumberInput(input, button))
    }

    const [input, setInput] = useState(value.toString())
    const { isValid, errorMessage } = validateInput(input, min, max)

    const style = { display: 'flex', justifyContent: 'center' }
    const color = isValid ? 'gray' : 'red'
    return (
        <>
            <Box mb="3">
                <Text size="8" weight="bold" color={color} style={style}>
                    {input || '0'}
                </Text>
                <Text size="3" color={color} mt="2" style={style}>
                    {errorMessage || `Maximum ${max}`}
                </Text>
            </Box>
            <NumberPadGrid onClick={handleClick} isValid={isValid} />
        </>
    )
}

/**
 * Mobile-optimized number input component using Radix UI
 * @sig NumberPad :: ({ value: Number, min: Number, max: Number, onSave: Function, onCancel: Function, label: String }) -> JSXElement
 */
const NumberPad = ({ value, min = 0, max = 999, onSave, onCancel }) => {
    const dialogOverlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.1)', zIndex: 10000 }
    const dialogDescriptionStyle = { display: 'none' }
    const dialogContentStyle = {
        position: 'fixed',
        top: '60%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '236px',
        zIndex: 10001,
    }

    return (
        <Dialog.Root open={true}>
            <Dialog.Portal>
                <Dialog.Overlay style={dialogOverlayStyle} />
                <Dialog.Content style={dialogContentStyle}>
                    <Dialog.Description style={dialogDescriptionStyle}>Number input dialog</Dialog.Description>
                    <Content {...{ value, min, max, onSave, onCancel }} />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export default NumberPad
