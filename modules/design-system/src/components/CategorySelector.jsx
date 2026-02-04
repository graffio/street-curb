// ABOUTME: Hierarchical category filtering component with search
// ABOUTME: Allows users to select categories with incremental search and keyboard navigation

import { containsIgnoreCase } from '@graffio/functional'
import { KeymapModule } from '@graffio/keymap'
import { Badge, Box, Flex, ScrollArea, Text, TextField } from '@radix-ui/themes'
import PropTypes from 'prop-types'
import React, { useEffect, useMemo, useRef, useState } from 'react'

const T = {
    // Converts highlight/selected state and position to dropdown item style object
    // @sig toDropdownItemStyle :: (Boolean, Boolean, Boolean) -> Object
    toDropdownItemStyle: (isHighlighted, isSelected, isLast) => ({
        padding: 'var(--space-2)',
        cursor: 'pointer',
        borderBottom: isLast ? 'none' : '1px solid var(--gray-3)',
        backgroundColor: isHighlighted ? 'var(--accent-4)' : isSelected ? 'var(--accent-3)' : 'transparent',
    }),
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

// Dropdown list item for a single category with highlight and selected state
// @sig CategoryItem :: { category, isHighlighted, isSelected, isLast, onClick, onMouseEnter, itemRef? } -> ReactElement
const CategoryItem = ({ category, isHighlighted, isSelected, isLast, onClick, onMouseEnter, itemRef }) => (
    <Box
        ref={itemRef}
        style={T.toDropdownItemStyle(isHighlighted, isSelected, isLast)}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
    >
        <Flex justify="between" align="center">
            <Text size="2">{category}</Text>
            {isSelected && <Text size="2">✓</Text>}
        </Flex>
    </Box>
)

/**
 * Category dropdown with search and keyboard navigation
 * @sig CategoryDropdown :: CategoryDropdownProps -> ReactElement
 *     CategoryDropdownProps = { categories, selectedCategories, onCategoryAdded, onCategoryRemoved }
 */
const CategoryDropdown = ({
    categories,
    selectedCategories,
    onCategoryAdded,
    onCategoryRemoved,
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

    const moveDown = () => setHighlightedIndex(prev => (prev < filteredCount - 1 ? prev + 1 : 0))
    const moveUp = () => setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredCount - 1))

    // Toggles highlighted category selection and resets search text
    // @sig toggleCategory :: () -> void
    const toggleCategory = () => {
        if (filteredCount === 0) return
        const category = filteredCategories[highlightedIndex]
        const isSelected = selectedCategories.includes(category)
        if (isSelected) onCategoryRemoved(category)
        else onCategoryAdded(category)
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
        return KeymapModule.fromBindings(keymapId, keymapName, [
            { description: 'Move down', keys: ['ArrowDown'], action: moveDown },
            { description: 'Move up', keys: ['ArrowUp'], action: moveUp },
            { description: 'Toggle', keys: ['Enter'], action: toggleCategory },
            { description: 'Dismiss', keys: ['Escape'], action: dismiss },
        ])
    }

    const keymapRegistrationEffect = () => {
        if (!keymap || !onRegisterKeymap || !onUnregisterKeymap) return undefined
        return E.keymapRegistrationEffect(keymap, keymapId, onRegisterKeymap, onUnregisterKeymap)
    }

    // Toggles category selection by click and refocuses input
    // @sig handleCategoryClick :: String -> void
    const handleCategoryClick = category => {
        const isSelected = selectedCategories.includes(category)
        if (isSelected) onCategoryRemoved(category)
        else onCategoryAdded(category)
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
        if ((event.key === 'ArrowDown' || event.key === 'Enter') && filteredCount > 0) {
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
        toggleCategory()
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
        setIsOpen(newFiltered.length > 0)
    }

    const handleInputFocus = () => {
        if (filteredCount > 0) setIsOpen(true)
    }

    const handleInputBlur = () => setTimeout(() => setIsOpen(false), 150)

    // Maps category and index to CategoryItem element
    // @sig toCategoryItem :: (String, Number) -> ReactElement
    const toCategoryItem = (cat, i) => (
        <CategoryItem
            key={cat}
            category={cat}
            isHighlighted={i === highlightedIndex}
            isSelected={selectedCategories.includes(cat)}
            isLast={i === filteredCount - 1}
            onClick={() => handleCategoryClick(cat)}
            onMouseEnter={() => setHighlightedIndex(i)}
            itemRef={i === highlightedIndex ? highlightedRef : null}
        />
    )

    // Hooks
    const [searchText, setSearchText] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const textFieldRef = useRef(null)
    const highlightedRef = useRef(null)

    // Derived state
    const filteredCategories = filterCategories(categories, searchText)
    const { length: filteredCount } = filteredCategories

    // Effects
    useEffect(() => setHighlightedIndex(0), [filteredCount])
    useEffect(() => highlightedRef.current?.scrollIntoView({ block: 'nearest' }), [highlightedIndex])

    const keymap = useMemo(createKeymapMemo, [
        isOpen,
        onRegisterKeymap,
        keymapId,
        keymapName,
        highlightedIndex,
        filteredCount,
    ])

    useEffect(keymapRegistrationEffect, [keymap, keymapId, onRegisterKeymap, onUnregisterKeymap])

    const showNoMatches = searchText && filteredCount === 0

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

                {isOpen && filteredCount > 0 && (
                    <ScrollArea style={scrollAreaStyle}>{filteredCategories.map(toCategoryItem)}</ScrollArea>
                )}
            </Box>

            {showNoMatches && (
                <Text size="1" color="gray">
                    No categories match "{searchText}"
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
            onCategoryRemoved={onCategoryRemoved}
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
