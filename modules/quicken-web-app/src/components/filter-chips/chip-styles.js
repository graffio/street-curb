// ABOUTME: Shared style factories and constants for filter chip components
// ABOUTME: Provides chip trigger style factory and clear button style used across multiple chips

// ---------------------------------------------------------------------------------------------------------------------
//
// F
//
// ---------------------------------------------------------------------------------------------------------------------

// Creates chip trigger style with specified width and active state
// @sig makeChipTriggerStyle :: (Number, Boolean?) -> Style
const makeChipTriggerStyle = (width, isActive) => ({
    appearance: 'none',
    border: 'none',
    font: 'inherit',
    color: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius-4)',
    cursor: 'pointer',
    userSelect: 'none',
    width,
    backgroundColor: isActive ? 'var(--ruby-5)' : 'var(--accent-3)',
})

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const clearButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: 'var(--gray-6)',
    color: 'var(--gray-11)',
    fontSize: 10,
    cursor: 'pointer',
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const ChipStyles = { makeChipTriggerStyle, clearButtonStyle }

export { ChipStyles }
