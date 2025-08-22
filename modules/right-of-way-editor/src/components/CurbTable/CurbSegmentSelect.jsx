import { Select as RadixSelect } from '@radix-ui/themes'
import { forwardRef } from 'react'

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
        const itemStyle = {
            padding: '4px 12px',
            cursor: 'pointer',
            fontSize: 'var(--font-size-2)',
            display: 'flex',
            alignItems: 'center',
            minHeight: '28px',
            outline: 'none',
            color: 'var(--gray-12)',
            fontWeight: '500',
        }

        const renderOptionItem = option => (
            <RadixSelect.Item key={option.value} value={option.value} style={itemStyle} disabled={option.disabled}>
                {option.label || option.value}
            </RadixSelect.Item>
        )

        const selectedOption = options.find(opt => opt.value === value)
        const selectedColor = selectedOption ? getOptionColor(selectedOption.value) : 'transparent'

        const wrapperStyle = { position: 'relative', display: 'inline-block', width: '100%', minWidth: '60px' }

        const triggerStyle = {
            width: '100%',
            minHeight: '32px',
            border: '1px solid rgba(0, 0, 0, 0.25)',
            borderRadius: 'var(--radius-2)',
            color: 'white',
            fontSize: 'var(--font-size-2)',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.1s ease',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
            backgroundColor: selectedColor,
        }

        const contentStyle = {
            backgroundColor: 'var(--color-panel-solid)',
            border: '1px solid var(--gray-6)',
            borderRadius: 'var(--radius-3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            minWidth: '120px',
            zIndex: 9999,
        }

        return (
            <div style={wrapperStyle} className={className}>
                <RadixSelect.Root value={value} onValueChange={handleValueChange} disabled={disabled} {...props}>
                    <RadixSelect.Trigger
                        ref={ref}
                        style={triggerStyle}
                        size={size}
                        variant={variant}
                        placeholder={placeholder}
                    />

                    <RadixSelect.Content style={contentStyle} position="popper">
                        {options.map(renderOptionItem)}
                    </RadixSelect.Content>
                </RadixSelect.Root>
            </div>
        )
    },
)

CurbSegmentSelect.displayName = 'CurbSegmentSelect'

export { CurbSegmentSelect, createColorOptions, createOption }
