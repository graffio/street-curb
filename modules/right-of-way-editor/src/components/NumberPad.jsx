import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Dialog, Grid, Text } from '../../../design-system/src/index.js'
import {
    dialogContent,
    dialogDescription,
    dialogOverlay,
    dialogTitle,
    functionButton,
    inputContainer,
    inputContainerError,
    numberButton,
} from './NumberPad.css.js'

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
 * Handles key press with input validation
 * @sig processKeyPress :: (String, String, Number, Number, Function) -> Void
 */
const processKeyPress = (key, currentInput, min, max, setInput) => {
    let newInput = currentInput

    if (key === 'backspace') {
        newInput = processBackspaceInput(currentInput)
    } else if (key === 'clear') {
        newInput = '0'
    } else if (key === '.') {
        newInput = processDecimalInput(currentInput)
    } else if (key >= '0' && key <= '9') {
        newInput = processNumberInput(currentInput, key)
    }

    setInput(newInput)
}

/**
 * Renders individual number pad button
 * @sig renderNumberButton :: (String, Function, String) -> JSXElement
 */
const renderNumberButton = (key, onKeyPress) => (
    <Button key={key} variant="soft" size="4" onClick={() => onKeyPress(key)} className={numberButton}>
        {key}
    </Button>
)

/**
 * Renders function button (backspace, enter, cancel)
 * @sig renderFunctionButton :: (String, Function, String, Boolean) -> JSXElement
 */
const renderFunctionButton = (key, onKeyPress, currentInput, isValid) => {
    const isEnter = key === 'enter'
    const isCancel = key === 'cancel'
    const isBackspace = key === 'backspace'
    const isClear = key === 'clear'

    const getVariant = () => {
        if (isEnter) return 'solid'
        if (isCancel) return 'soft'
        return 'surface'
    }

    const getColor = () => {
        if (isEnter) return 'green'
        if (isCancel) return 'red'
        return 'gray'
    }

    const disabled = isEnter && !isValid

    const getButtonText = () => {
        if (isEnter) return '✓'
        if (isCancel) return '✗'
        if (isBackspace) return '←'
        if (isClear) return 'C'
        return key
    }

    return (
        <Button
            key={key}
            variant={getVariant()}
            color={getColor()}
            size="4"
            onClick={() => onKeyPress(key)}
            disabled={disabled}
            className={functionButton}
        >
            {getButtonText()}
        </Button>
    )
}

/**
 * Mobile-optimized number input component using Radix UI
 * @sig NumberPad :: ({ value: Number, min: Number, max: Number, onSave: Function, onCancel: Function, label: String }) -> JSXElement
 */
const NumberPad = ({ value, min = 0, max = 999, onSave, onCancel, label = 'Value' }) => {
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
        key => {
            if (key === 'enter' && isValid) {
                onSave(parseFloat(input))
            } else if (key === 'cancel') {
                onCancel()
            } else {
                processKeyPress(key, input, min, max, setInput)
            }
        },
        [input, isValid, onSave, onCancel, min, max],
    )

    return (
        <Dialog.Root open={true}>
            <Dialog.Portal>
                <Dialog.Overlay className={dialogOverlay} />
                <Dialog.Content className={dialogContent}>
                    <Dialog.Title className={dialogTitle}>{label}</Dialog.Title>
                    <Dialog.Description className={dialogDescription}>
                        Number input dialog for {label}
                    </Dialog.Description>
                    <Box mb="3">
                        <Box p="4" className={isValid ? inputContainer : `${inputContainer} ${inputContainerError}`}>
                            <Text size="8" weight="bold" color={isValid ? 'gray' : 'red'}>
                                {input || '0'}
                            </Text>
                        </Box>
                        {!isValid && errorMessage && (
                            <Text size="3" color="red" mt="2" className={errorMessage}>
                                {errorMessage}
                            </Text>
                        )}
                    </Box>

                    <Grid columns="3" gap="2" mb="2">
                        {['1', '2', '3'].map(key => renderNumberButton(key, handleKeyPress, input))}
                        {['4', '5', '6'].map(key => renderNumberButton(key, handleKeyPress, input))}
                        {['7', '8', '9'].map(key => renderNumberButton(key, handleKeyPress, input))}
                        {renderNumberButton('0', handleKeyPress, input)}
                        {renderNumberButton('.', handleKeyPress, input)}
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
