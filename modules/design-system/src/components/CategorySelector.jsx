// ABOUTME: Hierarchical category filtering component with search
// ABOUTME: Allows users to select categories with incremental search and keyboard navigation

import { containsIgnoreCase } from '@graffio/functional'
import { Badge, Box, Flex, ScrollArea, Text, TextField } from '@radix-ui/themes'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'

/**
 * Displays selected categories as removable badges
 * @sig SelectedCategories :: ({ selectedCategories: [String], onCategoryRemoved: String -> () }) -> ReactElement
 */
const SelectedCategories = ({ selectedCategories, onCategoryRemoved }) => {
    const handleBadgeClick = category => () => onCategoryRemoved(category)

    const renderCategoryBadge = category => (
        <Badge key={category} variant="soft" style={{ cursor: 'pointer' }} onClick={handleBadgeClick(category)}>
            {category} ×
        </Badge>
    )

    if (selectedCategories.length === 0) return null

    return (
        <Flex wrap="wrap" gap="1">
            {selectedCategories.map(renderCategoryBadge)}
        </Flex>
    )
}

const scrollAreaStyle = { border: '1px solid var(--gray-6)', zIndex: 1000, height: '200px' }

/**
 * Category dropdown with search and keyboard navigation
 * @sig CategoryDropdown :: CategoryDropdownProps -> ReactElement
 *     CategoryDropdownProps = { categories: [String], selectedCategories: [String], onCategoryAdded: String -> () }
 */
const CategoryDropdown = ({ categories, selectedCategories, onCategoryAdded }) => {
    // @sig filterCategories :: ([String], String) -> [String]
    const filterCategories = (cats, searchText) => {
        if (!searchText.trim()) return cats
        return cats.filter(containsIgnoreCase(searchText))
    }

    const resetHighlightedIndex = () => setHighlightedIndex(0)
    const handleInputBlur = () => setTimeout(() => setIsOpen(false), 150)

    // @sig handleCategoryClick :: String -> void
    const handleCategoryClick = category => {
        onCategoryAdded(category)
        setSearchText('')
        setIsOpen(false)
        setHighlightedIndex(0)
        textFieldRef.current?.focus()
    }

    const handleCategoryMouseEnter = index => setHighlightedIndex(index)

    // @sig handleEscapeKey :: Event -> void
    const handleEscapeKey = event => {
        event.preventDefault()
        setSearchText('')
        setIsOpen(false)
        setHighlightedIndex(0)
    }

    // @sig handleOpenDropdown :: Event -> void
    const handleOpenDropdown = event => {
        const { length } = availableCategories
        if ((event.key === 'ArrowDown' || event.key === 'Enter') && length > 0) {
            setIsOpen(true)
            event.preventDefault()
        }
    }

    const handleArrowDown = event => {
        event.preventDefault()
        setHighlightedIndex(prev => (prev < availableCategories.length - 1 ? prev + 1 : 0))
    }

    const handleArrowUp = event => {
        event.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : availableCategories.length - 1))
    }

    // @sig handleEnterKey :: Event -> void
    const handleEnterKey = event => {
        event.preventDefault()
        if (availableCategories.length === 0) return

        const selectedCategory = availableCategories[highlightedIndex]
        onCategoryAdded(selectedCategory)
        setSearchText('')
        setIsOpen(false)
        setHighlightedIndex(0)
    }

    // @sig handleKeyDown :: Event -> void
    const handleKeyDown = event => {
        const { key } = event
        if (!isOpen) return handleOpenDropdown(event)
        if (key === 'ArrowDown') return handleArrowDown(event)
        if (key === 'ArrowUp') return handleArrowUp(event)
        if (key === 'Enter') return handleEnterKey(event)
        if (key === 'Escape') return handleEscapeKey(event)
    }

    // @sig handleInputChange :: Event -> void
    const handleInputChange = event => {
        const value = event.target.value
        setSearchText(value)

        // Check availability with the NEW search value, not the stale state
        const newFiltered = filterCategories(categories, value)
        const newAvailable = newFiltered.filter(cat => !selectedCategories.includes(cat))
        setIsOpen(newAvailable.length > 0)
    }

    const handleInputFocus = () => {
        const { length } = availableCategories
        if (length > 0) setIsOpen(true)
    }

    // @sig getDropdownItemStyle :: (Boolean, Boolean) -> Object
    const getDropdownItemStyle = (isHighlighted, isLast) => ({
        padding: 'var(--space-2)',
        cursor: 'pointer',
        borderBottom: isLast ? 'none' : '1px solid var(--gray-3)',
        backgroundColor: isHighlighted ? 'var(--gray-3)' : 'transparent',
    })

    // @sig renderCategoryItem :: (String, Number) -> ReactElement
    const renderCategoryItem = (category, index) => {
        const isLast = index === availableCategories.length - 1
        return (
            <Box
                key={category}
                style={getDropdownItemStyle(index === highlightedIndex, isLast)}
                onClick={() => handleCategoryClick(category)}
                onMouseEnter={() => handleCategoryMouseEnter(index)}
            >
                <Text size="2">{category}</Text>
            </Box>
        )
    }

    const [searchText, setSearchText] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const textFieldRef = useRef(null)

    // Filter categories based on search text
    const filteredCategories = filterCategories(categories, searchText)

    // Show available categories (exclude already selected ones)
    const availableCategories = filteredCategories.filter(cat => !selectedCategories.includes(cat))
    const { length: availableCount } = availableCategories

    // Reset highlighted index when available categories change
    useEffect(resetHighlightedIndex, [availableCount])

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

                {isOpen && availableCategories.length > 0 && (
                    <ScrollArea style={scrollAreaStyle}>{availableCategories.map(renderCategoryItem)}</ScrollArea>
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
const CategorySelector = props => {
    const { categories, selectedCategories, onCategoryAdded, onCategoryRemoved, style = {} } = props
    return (
        <Flex direction="column" gap="2" style={{ ...style }}>
            <SelectedCategories selectedCategories={selectedCategories} onCategoryRemoved={onCategoryRemoved} />
            <CategoryDropdown
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryAdded={onCategoryAdded}
            />
        </Flex>
    )
}

CategorySelector.propTypes = {
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
    onCategoryAdded: PropTypes.func.isRequired,
    onCategoryRemoved: PropTypes.func.isRequired,
    style: PropTypes.object,
}

export { CategorySelector }
