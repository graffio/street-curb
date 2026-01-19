// ABOUTME: Hierarchical category filtering component with search
// ABOUTME: Allows users to select categories with incremental search and keyboard navigation

import { containsIgnoreCase, LookupTable } from '@graffio/functional'
import { KeymapModule } from '@graffio/keymap'
import { Badge, Box, Flex, ScrollArea, Text, TextField } from '@radix-ui/themes'
import PropTypes from 'prop-types'
import React, { useEffect, useMemo, useRef, useState } from 'react'

const T = {
    // Converts highlight state and position to dropdown item style object
    // @sig toDropdownItemStyle :: (Boolean, Boolean) -> Object
    toDropdownItemStyle: (isHighlighted, isLast) => ({
        padding: 'var(--space-2)',
        cursor: 'pointer',
        borderBottom: isLast ? 'none' : '1px solid var(--gray-3)',
        backgroundColor: isHighlighted ? 'var(--gray-3)' : 'transparent',
    }),
}

const F = {
    // Creates keymap with navigation intents for category selector dropdown
    // @sig createCategorySelectorKeymap :: (String, String, Object) -> Keymap
    createCategorySelectorKeymap: (keymapId, keymapName, handlers) => {
        const { Intent, Keymap } = KeymapModule
        const { onDown, onUp, onEnter, onEscape } = handlers

        const intents = LookupTable(
            [
                Intent('Move down', ['ArrowDown'], onDown),
                Intent('Move up', ['ArrowUp'], onUp),
                Intent('Select', ['Enter'], onEnter),
                Intent('Dismiss', ['Escape'], onEscape),
            ],
            Intent,
            'description',
        )

        return Keymap(keymapId, keymapName, 10, false, null, intents)
    },
}

const E = {
    // Registers keymap and returns cleanup function that unregisters it
    // @sig keymapRegistrationEffect :: (Keymap, String, Function, Function) -> (() -> void)
    keymapRegistrationEffect: (keymap, keymapId, onRegister, onUnregister) => {
        onRegister(keymap)
        return () => onUnregister(keymapId)
    },
}

const badgeStyle = { cursor: 'pointer' }

// Removable badge displaying a single category
// @sig CategoryBadge :: { category: String, onRemove: () -> void } -> ReactElement
const CategoryBadge = ({ category, onRemove }) => (
    <Badge variant="soft" style={badgeStyle} onClick={onRemove}>
        {category} ×
    </Badge>
)

/**
 * Displays selected categories as removable badges
 * @sig SelectedCategories :: ({ selectedCategories: [String], onCategoryRemoved: String -> () }) -> ReactElement
 */
const SelectedCategories = ({ selectedCategories, onCategoryRemoved }) => {
    if (selectedCategories.length === 0) return null

    return (
        <Flex wrap="wrap" gap="1">
            {selectedCategories.map(category => (
                <CategoryBadge key={category} category={category} onRemove={() => onCategoryRemoved(category)} />
            ))}
        </Flex>
    )
}

const scrollAreaStyle = { border: '1px solid var(--gray-6)', zIndex: 1000, height: '200px' }

// Dropdown list item for a single category with highlight state
// @sig CategoryItem :: { category, isHighlighted, isLast, onClick, onMouseEnter } -> ReactElement
const CategoryItem = ({ category, isHighlighted, isLast, onClick, onMouseEnter }) => (
    <Box style={T.toDropdownItemStyle(isHighlighted, isLast)} onClick={onClick} onMouseEnter={onMouseEnter}>
        <Text size="2">{category}</Text>
    </Box>
)

/**
 * Category dropdown with search and keyboard navigation
 * @sig CategoryDropdown :: CategoryDropdownProps -> ReactElement
 *     CategoryDropdownProps = { categories: [String], selectedCategories: [String], onCategoryAdded: String -> () }
 */
const CategoryDropdown = ({
    categories,
    selectedCategories,
    onCategoryAdded,
    keymapId,
    keymapName = 'Category Selector',
    onRegisterKeymap,
    onUnregisterKeymap,
}) => {
    // Functions defined before hooks (closures capture bindings, not values)
    const filterCategories = (cats, text) => {
        if (!text.trim()) return cats
        return cats.filter(containsIgnoreCase(text))
    }

    const moveDown = () => setHighlightedIndex(prev => (prev < availableCount - 1 ? prev + 1 : 0))
    const moveUp = () => setHighlightedIndex(prev => (prev > 0 ? prev - 1 : availableCount - 1))

    // Adds highlighted category and resets search text (keeps dropdown open for more selections)
    // @sig selectCategory :: () -> void
    const selectCategory = () => {
        if (availableCount === 0) return
        onCategoryAdded(availableCategories[highlightedIndex])
        setSearchText('')
        setHighlightedIndex(0)
    }

    const dismiss = () => {
        setSearchText('')
        setIsOpen(false)
        setHighlightedIndex(0)
    }

    // Creates keymap when dropdown is open and keymap props provided
    // @sig createKeymapMemo :: () -> Keymap?
    const createKeymapMemo = () => {
        if (!isOpen || !onRegisterKeymap || !keymapId) return null
        return F.createCategorySelectorKeymap(keymapId, keymapName, {
            onDown: moveDown,
            onUp: moveUp,
            onEnter: selectCategory,
            onEscape: dismiss,
        })
    }

    const keymapRegistrationEffect = () => {
        if (!keymap || !onRegisterKeymap || !onUnregisterKeymap) return undefined
        return E.keymapRegistrationEffect(keymap, keymapId, onRegisterKeymap, onUnregisterKeymap)
    }

    // Selects category by click and refocuses input
    // @sig handleCategoryClick :: String -> void
    const handleCategoryClick = category => {
        onCategoryAdded(category)
        setSearchText('')
        setIsOpen(false)
        setHighlightedIndex(0)
        textFieldRef.current?.focus()
    }

    const handleEscapeKey = event => {
        event.preventDefault()
        dismiss()
    }

    // Opens dropdown on ArrowDown or Enter when categories available
    // @sig handleOpenDropdown :: Event -> void
    const handleOpenDropdown = event => {
        if ((event.key === 'ArrowDown' || event.key === 'Enter') && availableCount > 0) {
            setIsOpen(true)
            event.preventDefault()
        }
    }

    const handleArrowDown = event => {
        event.preventDefault()
        moveDown()
    }

    const handleArrowUp = event => {
        event.preventDefault()
        moveUp()
    }

    const handleEnterKey = event => {
        event.preventDefault()
        selectCategory()
    }

    // Routes keyboard events to appropriate handlers
    // @sig handleKeyDown :: Event -> void
    const handleKeyDown = event => {
        const { key } = event
        if (!isOpen) return handleOpenDropdown(event)
        if (key === 'ArrowDown') return handleArrowDown(event)
        if (key === 'ArrowUp') return handleArrowUp(event)
        if (key === 'Enter') return handleEnterKey(event)
        if (key === 'Escape') return handleEscapeKey(event)
    }

    // Updates search text and opens dropdown if matches found
    // @sig handleInputChange :: Event -> void
    const handleInputChange = event => {
        const value = event.target.value
        setSearchText(value)
        const newFiltered = filterCategories(categories, value)
        const newAvailable = newFiltered.filter(cat => !selectedCategories.includes(cat))
        setIsOpen(newAvailable.length > 0)
    }

    const handleInputFocus = () => {
        if (availableCount > 0) setIsOpen(true)
    }

    const handleInputBlur = () => setTimeout(() => setIsOpen(false), 150)

    // Maps category and index to CategoryItem element
    // @sig toCategoryItem :: (String, Number) -> ReactElement
    const toCategoryItem = (cat, i) => (
        <CategoryItem
            key={cat}
            category={cat}
            isHighlighted={i === highlightedIndex}
            isLast={i === availableCount - 1}
            onClick={() => handleCategoryClick(cat)}
            onMouseEnter={() => setHighlightedIndex(i)}
        />
    )

    // Hooks
    const [searchText, setSearchText] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const textFieldRef = useRef(null)

    // Derived state
    const filteredCategories = filterCategories(categories, searchText)
    const availableCategories = filteredCategories.filter(cat => !selectedCategories.includes(cat))
    const { length: availableCount } = availableCategories

    // Effects
    useEffect(() => setHighlightedIndex(0), [availableCount])

    const keymap = useMemo(createKeymapMemo, [
        isOpen,
        onRegisterKeymap,
        keymapId,
        keymapName,
        highlightedIndex,
        availableCount,
    ])

    useEffect(keymapRegistrationEffect, [keymap, keymapId, onRegisterKeymap, onUnregisterKeymap])

    const showNoMatches = searchText && availableCount === 0
    const showAllSelected = !searchText && availableCount === 0 && selectedCategories.length > 0

    return (
        <>
            <Box style={{ position: 'relative' }}>
                <TextField.Root
                    ref={textFieldRef}
                    placeholder="Type or press ↓ to browse"
                    value={searchText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                />

                {isOpen && availableCount > 0 && (
                    <ScrollArea style={scrollAreaStyle}>{availableCategories.map(toCategoryItem)}</ScrollArea>
                )}
            </Box>

            {showNoMatches && (
                <Text size="1" color="gray">
                    No available categories match "{searchText}"
                </Text>
            )}

            {showAllSelected && (
                <Text size="1" color="gray">
                    All categories selected
                </Text>
            )}
        </>
    )
}

/**
 * CategorySelector component for hierarchical category filtering
 * @sig CategorySelector :: CategorySelectorProps -> ReactElement
 *     CategorySelectorProps = { categories, selectedCategories, onCategoryAdded, onCategoryRemoved }
 */
const CategorySelector = ({
    categories,
    selectedCategories,
    onCategoryAdded,
    onCategoryRemoved,
    style = {},
    keymapId,
    keymapName,
    onRegisterKeymap,
    onUnregisterKeymap,
}) => (
    <Flex direction="column" gap="2" style={{ ...style }}>
        <SelectedCategories selectedCategories={selectedCategories} onCategoryRemoved={onCategoryRemoved} />
        <CategoryDropdown
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryAdded={onCategoryAdded}
            keymapId={keymapId}
            keymapName={keymapName}
            onRegisterKeymap={onRegisterKeymap}
            onUnregisterKeymap={onUnregisterKeymap}
        />
    </Flex>
)

CategorySelector.propTypes = {
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
    onCategoryAdded: PropTypes.func.isRequired,
    onCategoryRemoved: PropTypes.func.isRequired,
    style: PropTypes.object,
    keymapId: PropTypes.string,
    keymapName: PropTypes.string,
    onRegisterKeymap: PropTypes.func,
    onUnregisterKeymap: PropTypes.func,
}

export { CategorySelector }
