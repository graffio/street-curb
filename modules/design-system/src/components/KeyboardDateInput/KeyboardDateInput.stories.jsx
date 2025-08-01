/*
 * KeyboardDateInput.stories.jsx - Storybook stories for KeyboardDateInput component
 *
 * This file demonstrates the keyboard-driven date input functionality with arrow key navigation.
 * Users can navigate between date parts and increment/decrement values using only the keyboard.
 */

import { Card, Flex, Text } from '@radix-ui/themes'
import React, { useState } from 'react'
import { MainTheme } from '../../themes/theme.jsx'
import { KeyboardDateInput } from './KeyboardDateInput'

export default {
    title: 'KeyboardDateInput',
    component: KeyboardDateInput,
    decorators: [
        Story => (
            <MainTheme>
                <Story />
            </MainTheme>
        ),
    ],
    parameters: {
        docs: {
            description: {
                component:
                    'A custom date input that allows arrow key navigation. Click the input to automatically enter keyboard mode, then use ↑↓ to change values and ←→/Tab to move between month/day/year segments.',
            },
        },
    },
    argTypes: {
        value: { control: 'date', description: 'Current date value as Date object' },
        disabled: { control: 'boolean', description: 'Whether the input is disabled' },
        placeholder: { control: 'text', description: 'Placeholder text shown when input is empty' },
    },
}

export const Default = { args: { value: new Date(2025, 6, 8), disabled: false, placeholder: 'MM/DD/YYYY' } }

export const Interactive = () => {
    const [value, setValue] = useState(new Date(2025, 6, 8))
    const [lastChanged, setLastChanged] = useState(null)

    const handleChange = newDate => {
        setValue(newDate)
        setLastChanged(new Date().toLocaleTimeString())
    }

    return (
        <Flex direction="column" gap="4" style={{ maxWidth: '500px' }}>
            <Card style={{ padding: '16px' }}>
                <Flex direction="column" gap="3">
                    <Text size="3" weight="medium">
                        Interactive Keyboard Date Input
                    </Text>
                    <Text size="2" color="gray">
                        Click the input to automatically enter keyboard mode:
                    </Text>
                    <ul style={{ fontSize: '14px', color: '#666', margin: '0', paddingLeft: '20px' }}>
                        <li>
                            <strong>↑↓</strong> - Increment/decrement selected date part
                        </li>
                        <li>
                            <strong>←→/Tab</strong> - Move between month, day, year (with wrapping)
                        </li>
                        <li>
                            <strong>0-9</strong> - Type numbers directly
                        </li>
                        <li>
                            <strong>Enter</strong> - Save changes and exit keyboard mode
                        </li>
                        <li>
                            <strong>Click away</strong> - Save changes and exit keyboard mode
                        </li>
                    </ul>
                </Flex>
            </Card>

            <KeyboardDateInput value={value} onChange={handleChange} placeholder="MM/DD/YYYY" />

            <Card style={{ padding: '16px' }}>
                <Flex direction="column" gap="2">
                    <Text size="3" weight="medium">
                        Current State:
                    </Text>
                    <Text size="2">
                        Value: <strong>{value ? value.toLocaleDateString() : 'Empty'}</strong>
                    </Text>
                    {lastChanged && (
                        <Text size="1" color="gray">
                            Last changed: {lastChanged}
                        </Text>
                    )}
                </Flex>
            </Card>
        </Flex>
    )
}

Interactive.parameters = {
    docs: {
        description: {
            story: 'Interactive example showing the keyboard navigation in action. Try using the arrow keys to navigate and edit the date.',
        },
    },
}

export const MultipleInputs = () => {
    const [startDate, setStartDate] = useState(new Date(2025, 0, 1))
    const [endDate, setEndDate] = useState(new Date(2025, 11, 31))

    const handleStartDateChange = newDate => {
        setStartDate(newDate)
    }

    const handleEndDateChange = newDate => {
        setEndDate(newDate)
    }

    return (
        <Flex direction="column" gap="4" style={{ maxWidth: '400px' }}>
            <Text size="4" weight="medium">
                Date Range Selection
            </Text>

            <Flex direction="column" gap="2">
                <Text size="2" weight="medium" color="gray">
                    Start Date
                </Text>
                <KeyboardDateInput value={startDate} onChange={handleStartDateChange} placeholder="MM/DD/YYYY" />
            </Flex>

            <Flex direction="column" gap="2">
                <Text size="2" weight="medium" color="gray">
                    End Date
                </Text>
                <KeyboardDateInput value={endDate} onChange={handleEndDateChange} placeholder="MM/DD/YYYY" />
            </Flex>

            <Card style={{ padding: '16px' }}>
                <Flex direction="column" gap="2">
                    <Text size="3" weight="medium">
                        Selected Range:
                    </Text>
                    <Text size="2">
                        Start: <strong>{startDate ? startDate.toLocaleDateString() : 'Not set'}</strong>
                    </Text>
                    <Text size="2">
                        End: <strong>{endDate ? endDate.toLocaleDateString() : 'Not set'}</strong>
                    </Text>
                </Flex>
            </Card>
        </Flex>
    )
}

MultipleInputs.parameters = {
    docs: {
        description: {
            story: 'Example with multiple date inputs. Each input has independent keyboard navigation within its own month/day/year segments. For seamless navigation between inputs, see the DateRangePicker component which connects multiple inputs.',
        },
    },
}

export const EdgeCases = () => {
    const [value, setValue] = useState(new Date(2025, 1, 28))

    const handleChange = newDate => {
        setValue(newDate)
    }

    const renderButton = (text, dateValue) => <button onClick={() => setValue(dateValue)}>{text}</button>

    return (
        <Flex direction="column" gap="4" style={{ maxWidth: '500px' }}>
            <Text size="4" weight="medium">
                Edge Case Testing
            </Text>
            <Text size="2" color="gray">
                Try these scenarios to test the wrapping logic:
            </Text>

            <Card style={{ padding: '16px' }}>
                <Flex direction="column" gap="2">
                    <Text size="2">
                        <strong>February 28th:</strong> Try incrementing the day to see leap year handling
                    </Text>
                    <Text size="2">
                        <strong>December 31st:</strong> Try incrementing month or day to see year wrapping
                    </Text>
                    <Text size="2">
                        <strong>Month boundaries:</strong> Try changing months with 31 days to months with 30 days
                    </Text>
                </Flex>
            </Card>

            <KeyboardDateInput value={value} onChange={handleChange} placeholder="MM/DD/YYYY" />

            <Card style={{ padding: '16px' }}>
                <Text size="2">
                    Current: <strong>{value ? value.toLocaleDateString() : 'Not set'}</strong>
                </Text>
            </Card>

            <Flex direction="column" gap="2">
                {renderButton('Set to Feb 28, 2025', new Date(2025, 1, 28))}
                {renderButton('Set to Feb 29, 2024 (Leap Year)', new Date(2024, 1, 29))}
                {renderButton('Set to Jan 31, 2025', new Date(2025, 0, 31))}
                {renderButton('Set to Dec 31, 2025', new Date(2025, 11, 31))}
            </Flex>
        </Flex>
    )
}

EdgeCases.parameters = {
    docs: {
        description: {
            story: 'Tests edge cases like leap years, month boundaries, and date wrapping. Use the preset buttons to quickly test different scenarios.',
        },
    },
}
