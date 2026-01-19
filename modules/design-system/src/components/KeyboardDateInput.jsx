// ABOUTME: Custom date input with keyboard-only navigation between month/day/year segments
// ABOUTME: Supports arrow keys, Tab, slash navigation, and smart 2-digit year expansion
// COMPLEXITY-TODO: lines — Complex keyboard navigation requires many handlers (expires 2026-04-01)
// COMPLEXITY-TODO: function-declaration-ordering — Handlers reference state that must exist (expires 2026-04-01)
// COMPLEXITY-TODO: react-component-cohesion — Render functions share state tightly (expires 2026-04-01)
// COMPLEXITY-TODO: single-level-indentation — React hooks require inline callbacks (expires 2026-04-01)
// COMPLEXITY-TODO: sig-documentation — Handlers are self-documenting by name (expires 2026-04-01)
// COMPLEXITY-TODO: chain-extraction — Event destructuring would break prettier alignment (expires 2026-04-01)
/*
 * KeyboardDateInput - A custom date input with arrow key navigation
 *
 * This component allows users to navigate and edit date fields using only arrow keys:
 * - Left/Right: Move between month, day, year segments
 * - Up/Down: Increment/decrement the selected segment with wrapping
 * - Number keys: Type values directly (2-digit years expand to 1980-2079, applies immediately except for 19/20 prefix)
 * - /: Apply pending input and advance to next field
 * - Tab: Apply pending input and advance (shift-tab goes backward)
 * - Enter: Exit keyboard navigation mode
 * - []: decrease/increase date by one day
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

import { datePartsToDate, dateToDateParts, formatDateString, LookupTable } from '@graffio/functional'
import { KeymapModule } from '@graffio/keymap'
import { Box, Flex, Text, TextField } from '@radix-ui/themes'
import PropTypes from 'prop-types'
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import {
    expandTwoDigitYear,
    parseDateString,
    toDisplayDateString,
    updateDatePartWithValidation,
} from '../utils/date-input-utils.js'

const F = {
    // Creates a date input keymap with navigation and editing intents
    // @sig createDateInputKeymap :: (String, String, Object) -> Keymap
    createDateInputKeymap: (keymapId, keymapName, handlers) => {
        const { Intent, Keymap } = KeymapModule
        const { onLeft, onRight, onUp, onDown, onEnter, onToday, onDayMinus, onDayPlus, onSlash } = handlers

        const intents = LookupTable(
            [
                Intent('Decrement value', ['ArrowUp'], onUp),
                Intent('Increment value', ['ArrowDown'], onDown),
                Intent('Previous field', ['ArrowLeft'], onLeft),
                Intent('Next field', ['ArrowRight', '/'], onRight),
                Intent('Next field (apply)', ['Tab'], onSlash),
                Intent('Set to today', ['t'], onToday),
                Intent('Decrease by day', ['['], onDayMinus),
                Intent('Increase by day', [']'], onDayPlus),
                Intent('Exit', ['Enter'], onEnter),
            ],
            Intent,
            'description',
        )

        return Keymap(keymapId, keymapName, 10, false, null, intents)
    },
}

const E = {
    // Registers keymap and returns cleanup that unregisters it
    // @sig keymapRegistrationEffect :: (Keymap, String, Function, Function) -> (() -> void)
    keymapRegistrationEffect: (keymap, keymapId, onRegister, onUnregister) => {
        onRegister(keymap)
        return () => onUnregister(keymapId)
    },
}

/*
 * KeyboardDateInput component
 */
// prettier-ignore
const KeyboardDateInput = forwardRef((props, ref) => {
    const { value = null, onChange, disabled = false, placeholder = 'MM/DD/YYYY', style = {}, onTabOut, onShiftTabOut,
        keymapId, keymapName = 'Date Input', onRegisterKeymap, onUnregisterKeymap, ...restProps } = props

    // Helper functions for keyboard navigation
    const handleTabNavigation = (event, isShiftTab) => {
        applyPendingBuffer()
        return isShiftTab ? handleArrowLeft() : handleArrowRight()
    }

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

        // For year field with 2 digits: apply immediately unless it could be a 4-digit year prefix
        const isTwoDigitYear = activePart === 'year' && newBuffer.length === 2
        const couldBeFourDigitPrefix = newBuffer === '19' || newBuffer === '20'

        if (isTwoDigitYear && !couldBeFourDigitPrefix) {
            applyTypedNumber(newBuffer)
            setTypingBuffer('')
            return
        }

        // Shorter delay for ambiguous year prefixes (19/20), normal delay otherwise
        const delay = isTwoDigitYear && couldBeFourDigitPrefix ? 400 : 800
        const timeout = setTimeout(() => {
            applyTypedNumber(newBuffer)
            setTypingBuffer('')
            setTypingTimeout(null)
        }, delay)

        setTypingTimeout(timeout)
    }

    const applyPendingBuffer = () => {
        if (!typingBuffer) return
        if (typingTimeout) clearTimeout(typingTimeout)
        applyTypedNumber(typingBuffer)
        setTypingBuffer('')
        setTypingTimeout(null)
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

    const handleSlashKey = () => {
        applyPendingBuffer()
        handleArrowRight()
    }

    const applyTypedNumber = buffer => {
        const number = parseInt(buffer, 10)
        if (isNaN(number)) return

        const value = activePart === 'year' ? expandTwoDigitYear(number) : number

        userInitiatedChange.current = true
        setDateParts(prev => updateDatePartWithValidation(prev, activePart, value))
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
        if (event.key === '/')           return handleSlashKey()
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

        const displayValue = formatDateString(dateParts, false)
        const parts = displayValue.split('/')
        return parts[partIndex]
    }

    // Render a single date part with highlighting
    const renderPart = (partIndex, isYear = false) => {
        const partNames = ['month', 'day', 'year']
        const partName = partNames[partIndex]
        const isActive = activePart === partName

        const partStyle = {
            padding: '2px 4px',
            borderRadius: 'var(--radius-2)',
            textAlign: 'center',
            display: 'inline-block',
            ...(isActive && { backgroundColor: 'var(--accent-3)', color: 'var(--accent-9)' }),
        }

        return (
            <Text as="span" style={partStyle}>
                {getPartDisplay(partIndex)}
            </Text>
        )
    }

    const renderSlash = () => (
        <Text as="span" style={{ margin: '0 2px' }}>
            /
        </Text>
    )

    const renderKeyboardMode = () => {
        // Parse help text with {{key}} syntax for highlighted keys
        const helpText = () => {
            const interpolateBraces = (part, index) => {
                if (!part.startsWith('{{') || !part.endsWith('}}')) return part

                return (
                    <Text key={index} as="span" style={{ color: 'var(--accent-9)' }}>
                        {part.slice(2, -2)}
                    </Text>
                )
            }

            if (typingBuffer) return ''
            const shortcuts = '{{↑↓}} change • {{←→}}/{{Tab}}/{{/}} navigate • {{0-9}} type • {{t}} today'
            const extras = '{{[}}/{{]}} +/- day • {{Enter}}/click to exit'
            const parts = `${shortcuts} • ${extras}`.split(/(\{\{.*?\}\})/)
            return parts.map(interpolateBraces)
        }

        const keyboardDisplayStyle = { border: '2px solid var(--gray-6)', borderRadius: 'var(--radius-2)' }
        return (
            <Box style={style}>
                <Flex p="1" align="center" style={keyboardDisplayStyle}>
                    {renderPart(0)}
                    {renderSlash()}
                    {renderPart(1)}
                    {renderSlash()}
                    {renderPart(2, true)}
                </Flex>
                <Text size="1" color="gray" mt="1" style={{ textAlign: 'center', lineHeight: 1.3, maxWidth: '280px' }}>
                    {helpText()}
                </Text>
            </Box>
        )
    }

    const renderKeyboardModeWrapper = () => {
        const hiddenInputStyle = { opacity: 0, position: 'absolute', left: '-9999px', width: '1px', height: '1px' }

        return (
            <Box>
                <input
                    ref={inputRef}
                    type="text"
                    style={hiddenInputStyle}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    autoFocus
                />
                {renderKeyboardMode()}
            </Box>
        )
    }

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

    // Create keymap with current handlers when in keyboard mode
    const keymap = useMemo(() => {
        if (!isKeyboardMode || !onRegisterKeymap || !keymapId) return null
        const handlers = {
            onLeft: handleArrowLeft,
            onRight: handleArrowRight,
            onUp: () => updateDatePart(false),
            onDown: () => updateDatePart(true),
            onEnter: handleEnterKey,
            onToday: handleTodayKey,
            onDayMinus: () => handleDayAdjustment(false),
            onDayPlus: () => handleDayAdjustment(true),
            onSlash: handleSlashKey,
        }
        return F.createDateInputKeymap(keymapId, keymapName, handlers)
    }, [isKeyboardMode, onRegisterKeymap, keymapId, keymapName, activePart, dateParts, typingBuffer])

    // Register/unregister keymap when entering/exiting keyboard mode
    useEffect(() => {
        if (!keymap || !onRegisterKeymap || !onUnregisterKeymap) return undefined
        return E.keymapRegistrationEffect(keymap, keymapId, onRegisterKeymap, onUnregisterKeymap)
    }, [keymap, keymapId, onRegisterKeymap, onUnregisterKeymap])

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
    keymapId: PropTypes.string,
    keymapName: PropTypes.string,
    onRegisterKeymap: PropTypes.func,
    onUnregisterKeymap: PropTypes.func,
}

export { KeyboardDateInput }
