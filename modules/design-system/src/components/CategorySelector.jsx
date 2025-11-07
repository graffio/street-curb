/*
 * CategorySelector Component
 *
 * A hierarchical category filtering component that allows users to select from
 * a list of categories with incremental search and keyboard navigation.
 */

import { Badge, Box, Flex, ScrollArea, Text, TextField } from '@radix-ui/themes'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'

const filterCategories = (categories, searchText) => {
    if (!searchText.trim()) return categories
    const searchLower = searchText.toLowerCase()
    return categories.filter(category => category.toLowerCase().includes(searchLower))
}

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

/**
 * Category dropdown with search and keyboard navigation
 * @sig CategoryDropdown :: ({ categories: [String], selectedCategories: [String], onCategoryAdded: String -> () }) -> ReactElement
 */
const CategoryDropdown = ({ categories, selectedCategories, onCategoryAdded }) => {
    const resetHighlightedIndex = () => setHighlightedIndex(0)
    const handleInputBlur = () => setTimeout(() => setIsOpen(false), 150)
    const handleCategoryClick = category => {
        onCategoryAdded(category)
        setSearchText('')
        setIsOpen(false)
        setHighlightedIndex(0)
        textFieldRef.current?.focus()
    }

    const handleCategoryMouseEnter = index => setHighlightedIndex(index)
    const handleEscapeKey = event => {
        event.preventDefault()
        setSearchText('')
        setIsOpen(false)
        setHighlightedIndex(0)
    }

    const handleOpenDropdown = event => {
        if ((event.key === 'ArrowDown' || event.key === 'Enter') && availableCategories.length > 0) {
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

    const handleEnterKey = event => {
        event.preventDefault()
        if (availableCategories.length === 0) return

        const selectedCategory = availableCategories[highlightedIndex]
        onCategoryAdded(selectedCategory)
        setSearchText('')
        setIsOpen(false)
        setHighlightedIndex(0)
    }

    const handleKeyDown = event => {
        if (!isOpen) return handleOpenDropdown(event)
        if (event.key === 'ArrowDown') return handleArrowDown(event)
        if (event.key === 'ArrowUp') return handleArrowUp(event)
        if (event.key === 'Enter') return handleEnterKey(event)
        if (event.key === 'Escape') return handleEscapeKey(event)
    }

    /*
     * Handle text input changes
     *
     * @sig handleInputChange :: Event -> ()
     */
    const handleInputChange = event => {
        const value = event.target.value
        setSearchText(value)
        setIsOpen(availableCategories.length > 0)
    }

    const handleInputFocus = () => availableCategories.length > 0 && setIsOpen(true)

    const getDropdownItemStyle = (isHighlighted, isLast) => ({
        padding: 'var(--space-2)',
        cursor: 'pointer',
        borderBottom: isLast ? 'none' : '1px solid var(--gray-3)',
        backgroundColor: isHighlighted ? 'var(--gray-3)' : 'transparent',
    })

    const renderCategoryItem = (category, index) => (
        <Box
            key={category}
            style={getDropdownItemStyle(index === highlightedIndex, index === availableCategories.length - 1)}
            onClick={() => handleCategoryClick(category)}
            onMouseEnter={() => handleCategoryMouseEnter(index)}
        >
            <Text size="2">{category}</Text>
        </Box>
    )

    const scrollAreaStyle = { border: '1px solid var(--gray-6)', zIndex: 1000, height: '200px' }

    const [searchText, setSearchText] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const textFieldRef = useRef(null)

    // Filter categories based on search text
    const filteredCategories = filterCategories(categories, searchText)

    // Show available categories (exclude already selected ones)
    const availableCategories = filteredCategories.filter(cat => !selectedCategories.includes(cat))

    // Reset highlighted index when available categories change
    useEffect(resetHighlightedIndex, [availableCategories.length])

    return (
        <>
            <Box style={{ position: 'relative' }}>
                <TextField.Root
                    ref={textFieldRef}
                    placeholder="Type to filter categories or press ↓ to browse..."
                    value={searchText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                />

                {/* Dropdown list */}

                {isOpen && availableCategories.length > 0 && (
                    <ScrollArea style={scrollAreaStyle}>{availableCategories.map(renderCategoryItem)}</ScrollArea>
                )}
            </Box>

            {searchText && availableCategories.length === 0 && (
                <Text size="1" color="gray">
                    No available categories match "{searchText}"
                </Text>
            )}

            {!searchText && availableCategories.length === 0 && selectedCategories.length > 0 && (
                <Text size="1" color="gray">
                    All categories selected
                </Text>
            )}
        </>
    )
}

/**
 * CategorySelector component for hierarchical category filtering
 * @sig CategorySelector :: ({ categories: [String], selectedCategories: [String], onCategoryAdded: String -> (), onCategoryRemoved: String -> () }) -> ReactElement
 */
const CategorySelector = ({ categories, selectedCategories, onCategoryAdded, onCategoryRemoved, style = {} }) => (
    <Flex direction="column" gap="2" style={{ ...style }}>
        <SelectedCategories selectedCategories={selectedCategories} onCategoryRemoved={onCategoryRemoved} />
        <CategoryDropdown
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryAdded={onCategoryAdded}
        />
    </Flex>
)

CategorySelector.propTypes = {
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
    onCategoryAdded: PropTypes.func.isRequired,
    onCategoryRemoved: PropTypes.func.isRequired,
    style: PropTypes.object, // style properties applied to top-level Flex
}

export { CategorySelector }
