import { useCallback, useEffect, useState } from 'react'

/**
 * NumberPad - Mobile-optimized number input component for CurbTable
 *
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
const renderNumberButton = (key, onKeyPress, currentInput) => (
    <button key={key} className="number-pad-button number-button" onClick={() => onKeyPress(key)} disabled={false}>
        {key}
    </button>
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

    const buttonClass = `number-pad-button ${isEnter ? 'enter-button' : isCancel ? 'cancel-button' : isClear ? 'clear-button' : 'function-button'}`
    const disabled = isEnter && !isValid

    const getButtonText = () => {
        if (isEnter) return '✓'
        if (isCancel) return '✗'
        if (isBackspace) return '←'
        if (isClear) return 'C'
        return key
    }

    return (
        <button key={key} className={buttonClass} onClick={() => onKeyPress(key)} disabled={disabled}>
            {getButtonText()}
        </button>
    )
}

/**
 * Handles backdrop click to close number pad
 * @sig handleBackdropClick :: (Event, Function) -> Void
 */
const handleBackdropClick = (e, onCancel) => {
    if (e.target === e.currentTarget) onCancel()
}

/**
 * Mobile-optimized number input component
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
        <div className="number-pad-backdrop" onClick={e => handleBackdropClick(e, onCancel)}>
            <div className="number-pad-container">
                <div className="number-pad-header">
                    <div className="number-pad-label">{label}</div>
                    <div className={`number-pad-display ${!isValid ? 'error' : ''}`}>{input || '0'}</div>
                    {!isValid && errorMessage && <div className="number-pad-error">{errorMessage}</div>}
                </div>

                <div className="number-pad-grid">
                    <div className="number-pad-row">
                        {['1', '2', '3'].map(key => renderNumberButton(key, handleKeyPress, input))}
                    </div>
                    <div className="number-pad-row">
                        {['4', '5', '6'].map(key => renderNumberButton(key, handleKeyPress, input))}
                    </div>
                    <div className="number-pad-row">
                        {['7', '8', '9'].map(key => renderNumberButton(key, handleKeyPress, input))}
                    </div>
                    <div className="number-pad-row">
                        {renderNumberButton('0', handleKeyPress, input)}
                        {renderNumberButton('.', handleKeyPress, input)}
                        {renderFunctionButton('backspace', handleKeyPress, input, isValid)}
                    </div>
                    <div className="number-pad-row">
                        {renderFunctionButton('clear', handleKeyPress, input, isValid)}
                        {renderFunctionButton('cancel', handleKeyPress, input, isValid)}
                        {renderFunctionButton('enter', handleKeyPress, input, isValid)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NumberPad
