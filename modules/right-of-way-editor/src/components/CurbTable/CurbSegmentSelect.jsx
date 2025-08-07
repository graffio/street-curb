import { Select as RadixSelect } from '@radix-ui/themes'
import { forwardRef } from 'react'
import { selectStyles } from './CurbSegmentSelect.css.js'

/**
 * Creates individual color option object
 * @sig createColorOption :: String -> Option
 */
const createColorOption = colorKey => ({ value: colorKey, label: colorKey })

/**
 * Helper function to create options from COLORS constant
 * @sig createColorOptions :: Object -> [Option]
 */
const createColorOptions = colorsObject => Object.keys(colorsObject).map(createColorOption)

/**
 * Helper function to create option with custom properties
 * @sig createOption :: (String, String, Boolean?) -> Option
 */
const createOption = (value, label = value, disabled = false) => ({ value, label, disabled })

/**
 * CurbSegmentSelect - specialized select component for curb segment types
 * @sig CurbSegmentSelect :: ({
 *   options: [Option],
 *   value?: String,
 *   onValueChange?: Function,
 *   placeholder?: String,
 *   size?: String,
 *   variant?: String,
 *   disabled?: Boolean,
 *   colorMapping?: Object,
 *   className?: String
 * }) -> JSXElement
 */
const CurbSegmentSelect = forwardRef(
    (
        {
            options = [],
            value,
            onValueChange,
            placeholder = 'Select an option',
            size = '2',
            variant = 'surface',
            disabled = false,
            colorMapping = {},
            className = '',
            ...props
        },
        ref,
    ) => {
        const handleValueChange = newValue => onValueChange && onValueChange(newValue)

        const getOptionColor = optionValue => colorMapping[optionValue] || 'transparent'

        /**
         * Renders individual option item with color styling
         * @sig renderOptionItem :: (Option) -> JSXElement
         */
        const renderOptionItem = option => (
            <RadixSelect.Item
                key={option.value}
                value={option.value}
                className={selectStyles.item}
                disabled={option.disabled}
            >
                {option.label || option.value}
            </RadixSelect.Item>
        )

        const selectedOption = options.find(opt => opt.value === value)
        const selectedColor = selectedOption ? getOptionColor(selectedOption.value) : 'transparent'

        return (
            <div className={`${selectStyles.wrapper} ${className}`}>
                <RadixSelect.Root value={value} onValueChange={handleValueChange} disabled={disabled} {...props}>
                    <RadixSelect.Trigger
                        ref={ref}
                        className={selectStyles.trigger}
                        size={size}
                        variant={variant}
                        style={{ backgroundColor: selectedColor }}
                        placeholder={placeholder}
                    />

                    <RadixSelect.Content className={selectStyles.content} position="popper">
                        {options.map(renderOptionItem)}
                    </RadixSelect.Content>
                </RadixSelect.Root>
            </div>
        )
    },
)

CurbSegmentSelect.displayName = 'CurbSegmentSelect'

export { CurbSegmentSelect, createColorOptions, createOption }
