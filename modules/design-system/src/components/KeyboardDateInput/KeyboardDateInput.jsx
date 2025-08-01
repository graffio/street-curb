/*
 * KeyboardDateInput - A custom date input with arrow key navigation
 *
 * This component allows users to navigate and edit date fields using only arrow keys:
 * - Left/Right: Move between month, day, year segments
 * - Up/Down: Increment/decrement the selected segment with wrapping
 * - Number keys: Type values directly into segments
 * - Enter/Tab: Exit keyboard navigation mode
 * - onChange is called immediately when any date value changes
 * - []: decrease/increase date
 * - t: set to today
 *
 * FEATURES:
 * - Visual highlighting of active date segment
 * - Smart wrapping (32nd day wraps to 1st, etc.)
 * - Month validation (February 30th becomes February 28th/29th)
 * - Immediate onChange feedback on all modifications
 * - Keyboard-only navigation
 * - Falls back to standard input when not in keyboard mode
 *
 * @sig KeyboardDateInput :: Props -> ReactElement
 *     Props = {
 *         value: Date?,
 *         onChange: (Date?) -> void?,
 *         disabled: Boolean?,
 *         placeholder: String?,
 *         style: Object?,
 *         onTabOut: () -> void?,
 *         onShiftTabOut: () -> void?
 *     }
 */

import { Box, Text, TextField } from '@radix-ui/themes'
import { datePartsToDate, dateToDateParts, formatDateString } from 'functional'
import PropTypes from 'prop-types'
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { parseDateString, toDisplayDateString, updateDatePartWithValidation } from '../../utils/date-input-utils.js'
import * as styles from './KeyboardDateInput.css.js'

/*
 * KeyboardDateInput component
 */
const KeyboardDateInput = forwardRef((props, ref) => {
    const {
        value = null,
        onChange,
        disabled = false,
        placeholder = 'MM/DD/YYYY',
        style = {},
        onTabOut,
        onShiftTabOut,
        ...restProps
    } = props

    // Helper functions for keyboard navigation
    const handleTabNavigation = (event, isShiftTab) => (isShiftTab ? handleArrowLeft() : handleArrowRight())

    // prettier-ignore
    const handleArrowLeft = () => {
        if (activePart === 'month' && onShiftTabOut) return onShiftTabOut()
        if (activePart === 'month'                 ) return setActivePart('year')
        if (activePart === 'day'                   ) return setActivePart('month')
        if (activePart === 'year'                  ) return setActivePart('day')
    }

    // prettier-ignore
    const handleArrowRight = () => {
        if (activePart === 'month'           ) return setActivePart('day')
        if (activePart === 'day'             ) return setActivePart('year')
        if (activePart === 'year' && onTabOut) return onTabOut()
        if (activePart === 'year'            ) return setActivePart('month')
    }

    const updateDatePart = (increment = true) => {
        userInitiatedChange.current = true
        setDateParts(prev => {
            const direction = increment ? 1 : -1
            const newValue = prev[activePart] + direction
            return updateDatePartWithValidation(prev, activePart, newValue)
        })
    }

    const handleNumberTyping = key => {
        const newBuffer = typingBuffer + key
        setTypingBuffer(newBuffer)

        // Clear existing timeout
        if (typingTimeout) clearTimeout(typingTimeout)

        // Set new timeout to apply the number after a short delay
        const timeout = setTimeout(() => {
            applyTypedNumber(newBuffer)
            setTypingBuffer('')
            setTypingTimeout(null)
        }, 800) // 800ms delay allows for multi-digit input

        setTypingTimeout(timeout)
    }

    const handleBackspace = () => {
        // Clear typing buffer or decrement if no buffer
        if (typingBuffer.length > 0) return setTypingBuffer(typingBuffer.slice(0, -1))

        userInitiatedChange.current = true
        setDateParts(prev => {
            const newValue = prev[activePart] - 1
            return updateDatePartWithValidation(prev, activePart, newValue)
        })
    }

    const handleEnterKey = () => {
        setIsKeyboardMode(false)
        onChange?.(datePartsToDate(dateParts)) // Trigger onChange with the new Date object
        inputRef.current?.blur()
    }

    const handleTodayKey = () => {
        userInitiatedChange.current = true
        const today = new Date()
        setDateParts(dateToDateParts(today))
    }

    const handleDayAdjustment = (increment = true) => {
        userInitiatedChange.current = true
        const currentDate = datePartsToDate(dateParts)
        const newDate = new Date(currentDate)
        newDate.setDate(currentDate.getDate() + (increment ? 1 : -1))
        setDateParts(dateToDateParts(newDate))
    }

    const applyTypedNumber = buffer => {
        const number = parseInt(buffer, 10)
        if (isNaN(number)) return

        userInitiatedChange.current = true
        setDateParts(prev => updateDatePartWithValidation(prev, activePart, number))
    }

    // Enter keyboard mode on any arrow key or tab
    const possiblyEnterKeyboardMode = event => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
            event.preventDefault()
            setIsKeyboardMode(true)
            setActivePart('month')
        }
    }

    // prettier-ignore
    const handleKeyDown = event => {
        if (!isKeyboardMode) return possiblyEnterKeyboardMode(event)

        event.preventDefault()

        const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        
        if (event.key === 'Tab')         return handleTabNavigation(event, event.shiftKey)
        if (event.key === 'ArrowLeft')   return handleArrowLeft()
        if (event.key === 'ArrowRight')  return handleArrowRight()
        if (event.key === 'ArrowUp')     return updateDatePart(false) // up key DECREMENTS value
        if (event.key === 'ArrowDown')   return updateDatePart(true) // down key INCREMENTS value
        if (event.key === 'Enter')       return handleEnterKey()
        if (event.key === 'Backspace')   return handleBackspace()
        if (event.key === 't')           return handleTodayKey()
        if (event.key === '[')           return handleDayAdjustment(false)
        if (event.key === ']')           return handleDayAdjustment(true)
        if (numbers.includes(event.key)) return handleNumberTyping(event.key)
    }

    // When focused, show the current date parts and enter keyboard mode immediately
    const handleFocus = () => {
        setDateParts(dateToDateParts(value))
        setIsKeyboardMode(true)
        setActivePart('month')
    }

    const handleBlur = () => {
        if (!isKeyboardMode) return

        setIsKeyboardMode(false)
        onChange && onChange(datePartsToDate(dateParts)) // Save the Date object on blur
    }

    const handleChange = event => {
        if (!isKeyboardMode && onChange) {
            // Convert string input to Date object for consistency
            const dateString = event.target.value
            const dateParts = parseDateString(dateString)
            const newDate = datePartsToDate(dateParts)
            onChange(newDate)
        }
    }

    // Get display text for a date part (showing typing buffer if active)
    const getPartDisplay = partIndex => {
        const partNames = ['month', 'day', 'year']
        const partName = partNames[partIndex]

        if (activePart === partName && typingBuffer) return typingBuffer

        const displayValue = formatDateString(dateParts)
        const parts = displayValue.split('/')
        return parts[partIndex]
    }

    // Render a single date part with highlighting
    const renderPart = (partIndex, isYear = false) => {
        const partNames = ['month', 'day', 'year']
        const partName = partNames[partIndex]
        const isActive = activePart === partName
        const className = isYear ? styles.yearPart : styles.datePart

        return (
            <span className={className} data-active={isActive}>
                {getPartDisplay(partIndex)}
            </span>
        )
    }

    const renderKeyboardMode = () => (
        <Box className={styles.keyboardContainer} style={style}>
            <div className={`${styles.keyboardDisplay} ${styles.focusRing}`}>
                {renderPart(0)}
                <span className={styles.separator}>/</span>
                {renderPart(1)}
                <span className={styles.separator}>/</span>
                {renderPart(2, true)}
            </div>
            <Text className={styles.helpText}>
                {typingBuffer ? (
                    <span className={styles.typingIndicator}>
                        Type: {typingBuffer} • Backspace to clear • Navigate with arrow/tab keys
                    </span>
                ) : (
                    <>
                        <span className={styles.keyHighlight}>↑↓</span> change field •{' '}
                        <span className={styles.keyHighlight}>←→</span>/<span className={styles.keyHighlight}>Tab</span>{' '}
                        navigate fields • <span className={styles.keyHighlight}>0-9</span> type •{' '}
                        <span className={styles.keyHighlight}>t</span> today •{' '}
                        <span className={styles.keyHighlight}>[</span>/<span className={styles.keyHighlight}>]</span>{' '}
                        +/- day • <span className={styles.keyHighlight}>Enter</span>/click away to exit
                    </>
                )}
            </Text>
        </Box>
    )

    const renderKeyboardModeWrapper = () => (
        <Box className={styles.responsiveContainer}>
            <input
                ref={inputRef}
                type="text"
                className={styles.hiddenInput}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                autoFocus
            />
            {renderKeyboardMode()}
        </Box>
    )

    const renderTextMode = () => {
        // Convert Date to string for display in regular input mode
        const displayValue = value ? toDisplayDateString(dateToDateParts(value)) : ''

        return (
            <TextField.Root
                ref={inputRef}
                value={displayValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                disabled={disabled}
                placeholder={placeholder}
                className={styles.regularInput}
                style={style}
                {...restProps}
            />
        )
    }

    // State variables
    const [isKeyboardMode, setIsKeyboardMode] = useState(false)
    const [dateParts, setDateParts] = useState(() => dateToDateParts(value))
    const [activePart, setActivePart] = useState('month') // 'month', 'day', 'year'
    const [typingBuffer, setTypingBuffer] = useState('') // Buffer for typed numbers
    const [typingTimeout, setTypingTimeout] = useState(null)
    const userInitiatedChange = useRef(false)
    const inputRef = useRef(null)

    // Expose focus method to parent components
    useImperativeHandle(
        ref,
        () => ({
            focus: (part = 'month') => {
                setIsKeyboardMode(true)
                setActivePart(part)
            },
            blur: () => {
                setIsKeyboardMode(false)
                if (inputRef.current) inputRef.current.blur()
            },
        }),
        [],
    )

    // Update internal state when value prop changes
    useEffect(() => {
        if (!isKeyboardMode) setDateParts(dateToDateParts(value))
    }, [value, isKeyboardMode])

    // Emit onChange when dateParts change due to user interaction
    useEffect(() => {
        if (isKeyboardMode && userInitiatedChange.current) {
            onChange?.(datePartsToDate(dateParts))
            userInitiatedChange.current = false
        }
    }, [dateParts, isKeyboardMode])

    // Clear typing timeout on unmount
    useEffect(
        () => () => {
            if (typingTimeout) clearTimeout(typingTimeout)
        },
        [typingTimeout],
    )

    return isKeyboardMode ? renderKeyboardModeWrapper() : renderTextMode()
})

KeyboardDateInput.propTypes = {
    value: PropTypes.instanceOf(Date),
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    style: PropTypes.object,
    onTabOut: PropTypes.func,
    onShiftTabOut: PropTypes.func,
}

export { KeyboardDateInput }
