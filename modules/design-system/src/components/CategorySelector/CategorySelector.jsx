/*
 * CategorySelector Component
 *
 * A hierarchical category filtering component that allows users to select from
 * a list of categories with incremental search and keyboard navigation.
 */

import { Badge, Box, Flex, ScrollArea, Text, TextField } from '@radix-ui/themes'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import {
    badgeContainer,
    dropdown,
    dropdownContainer,
    dropdownItem,
    dropdownItemHighlighted,
    moreItemsIndicator,
} from './CategorySelector.css.js'

/*
 * Filter categories by search text (incremental search)
 *
 * @sig filterCategories :: ([String], String) -> [String]
 */
const filterCategories = (categories, searchText) => {
    if (!searchText.trim()) return categories

    const searchLower = searchText.toLowerCase()
    return categories.filter(category => category.toLowerCase().includes(searchLower))
}

/*
 * CategorySelector component for hierarchical category filtering
 *
 * Provides:
 * - Incremental text filtering of categories as you type
 * - Dropdown with all matching categories
 * - Return key to select highlighted category
 * - Display of selected categories as removable badges
 * - Support for hierarchical category matching
 *
 * @sig CategorySelector :: (CategorySelectorProps) -> ReactElement
 *     CategorySelectorProps = {
 *         categories: [String],
 *         selectedCategories: [String],
 *         onCategoryAdd: String -> (),
 *         onCategoryRemove: String -> ()
 *     }
 */
const CategorySelector = ({ categories = [], selectedCategories = [], onCategoryAdd, onCategoryRemove }) => {
    /*
     * Reset highlighted index when available categories change
     *
     * @sig resetHighlightedIndex :: () -> ()
     */
    const resetHighlightedIndex = () => setHighlightedIndex(0)

    /*
     * Handle input blur with delay to allow clicks on dropdown items
     *
     * @sig handleInputBlur :: () -> ()
     */
    const handleInputBlur = () => setTimeout(() => setIsOpen(false), 150)

    /*
     * Handle clicking on a category in the dropdown
     *
     * @sig handleCategoryClick :: String -> ()
     */
    const handleCategoryClick = category => {
        onCategoryAdd(category)
        setSearchText('')
        setIsOpen(false)
        setHighlightedIndex(0)
        textFieldRef.current?.focus()
    }

    /*
     * Handle mouse enter on category item
     *
     * @sig handleCategoryMouseEnter :: Number -> ()
     */
    const handleCategoryMouseEnter = index => setHighlightedIndex(index)

    /*
     * Handle badge click to remove category
     *
     * @sig handleBadgeClick :: String -> ()
     */
    const handleBadgeClick = category => () => onCategoryRemove(category)

    /*
     * Render a category badge
     *
     * @sig renderCategoryBadge :: String -> ReactElement
     */
    const renderCategoryBadge = category => (
        <Badge key={category} variant="soft" style={{ cursor: 'pointer' }} onClick={handleBadgeClick(category)}>
            {category} ×
        </Badge>
    )

    /*
     * Handle escape key to close dropdown
     *
     * @sig handleEscapeKey :: Event -> ()
     */
    const handleEscapeKey = event => {
        event.preventDefault()
        setSearchText('')
        setIsOpen(false)
        setHighlightedIndex(0)
    }

    /*
     * Render a category dropdown item
     *
     * @sig renderCategoryItem :: (String, Number) -> ReactElement
     */
    const renderCategoryItem = (category, index) => (
        <Box
            key={category}
            className={`${dropdownItem} ${index === highlightedIndex ? dropdownItemHighlighted : ''}`}
            onClick={() => handleCategoryClick(category)}
            onMouseEnter={() => handleCategoryMouseEnter(index)}
        >
            <Text size="2">{category}</Text>
        </Box>
    )

    /*
     * Handle opening dropdown when closed
     *
     * @sig handleOpenDropdown :: Event -> ()
     */
    const handleOpenDropdown = event => {
        if ((event.key === 'ArrowDown' || event.key === 'Enter') && availableCategories.length > 0) {
            setIsOpen(true)
            event.preventDefault()
        }
    }

    /*
     * Handle arrow down navigation
     *
     * @sig handleArrowDown :: Event -> ()
     */
    const handleArrowDown = event => {
        event.preventDefault()
        setHighlightedIndex(prev => (prev < availableCategories.length - 1 ? prev + 1 : 0))
    }

    /*
     * Handle arrow up navigation
     *
     * @sig handleArrowUp :: Event -> ()
     */
    const handleArrowUp = event => {
        event.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : availableCategories.length - 1))
    }

    /*
     * Handle enter key selection
     *
     * @sig handleEnterKey :: Event -> ()
     */
    const handleEnterKey = event => {
        event.preventDefault()
        if (availableCategories.length === 0) return

        const selectedCategory = availableCategories[highlightedIndex]
        onCategoryAdd(selectedCategory)
        setSearchText('')
        setIsOpen(false)
        setHighlightedIndex(0)
    }

    /*
     * Handle keyboard navigation in dropdown
     *
     * @sig handleKeyDown :: Event -> ()
     */
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

    /*
     * Handle input focus - always show dropdown if there are available categories
     *
     * @sig handleInputFocus :: () -> ()
     */
    const handleInputFocus = () => {
        if (availableCategories.length > 0) setIsOpen(true)
    }

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
        <Flex direction="column" gap="2">
            <Text size="2" weight="medium" color="gray">
                Categories
            </Text>

            {/* Selected categories as badges */}

            {selectedCategories.length > 0 && (
                <Box className={badgeContainer}>{selectedCategories.map(renderCategoryBadge)}</Box>
            )}

            {/* Search input */}
            <Box className={dropdownContainer}>
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
                    <ScrollArea className={dropdown}>
                        {availableCategories.slice(0, 100).map(renderCategoryItem)}

                        {availableCategories.length > 100 && (
                            <Box className={moreItemsIndicator}>
                                <Text size="1" color="gray">
                                    ... and {availableCategories.length - 100} more (keep typing to filter)
                                </Text>
                            </Box>
                        )}
                    </ScrollArea>
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
        </Flex>
    )
}

CategorySelector.propTypes = {
    categories: PropTypes.arrayOf(PropTypes.string),
    selectedCategories: PropTypes.arrayOf(PropTypes.string),
    onCategoryAdd: PropTypes.func.isRequired,
    onCategoryRemove: PropTypes.func.isRequired,
}

export { CategorySelector }
