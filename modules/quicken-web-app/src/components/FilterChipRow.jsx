// ABOUTME: Composition layout shell for filter chips — renders count summary and children
// ABOUTME: Children are self-selecting column components that call their own useSelector

import { Flex, Text } from '@radix-ui/themes'
import { useSelector } from 'react-redux'
import * as S from '../store/selectors.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const containerBaseStyle = { padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--gray-4)' }
const containerActiveStyle = { ...containerBaseStyle, backgroundColor: 'var(--ruby-3)' }
const containerInactiveStyle = { ...containerBaseStyle, backgroundColor: 'var(--gray-2)' }

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Composition layout shell for filter chips — renders count summary, container highlight, and children
 *
 * @sig FilterChipRow :: FilterChipRowProps -> ReactElement
 *     FilterChipRowProps = { viewId, accountId?, filteredCount?, totalCount?, itemLabel?, children }
 */
const FilterChipRow = props => {
    const { viewId, accountId, filteredCount: filteredCountProp, totalCount: totalCountProp } = props
    const { itemLabel = 'transactions', children } = props

    const { filtered, total, isFiltering } = useSelector(state => S.UI.filterCounts(state, viewId, accountId))

    const filteredCount = filteredCountProp ?? filtered
    const totalCount = totalCountProp ?? total
    const containerStyle = isFiltering ? containerActiveStyle : containerInactiveStyle

    return (
        <Flex direction="column" gap="2" style={containerStyle}>
            <Flex align="center" gap="2" style={{ paddingLeft: 'var(--space-2)' }}>
                <Text size="1" color="gray">
                    {filteredCount} {itemLabel}
                </Text>
                {isFiltering && filteredCount < totalCount && (
                    <Text size="1" color="ruby" weight="medium">
                        (filtered from {totalCount})
                    </Text>
                )}
            </Flex>
            <Flex align="start" gap="3" wrap="wrap">
                {children}
            </Flex>
        </Flex>
    )
}

export { FilterChipRow }
