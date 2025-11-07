import React, { useState } from 'react'
import { MainTheme } from '../../themes/theme.jsx'
import { CategorySelector } from './CategorySelector.jsx'

export default {
    title: 'Components/CategorySelector',
    component: CategorySelector,
    parameters: { layout: 'padded' },
    decorators: [
        Story => (
            <MainTheme>
                <div style={{ width: '400px' }}>
                    <Story />
                </div>
            </MainTheme>
        ),
    ],
}

const SAMPLE_CATEGORIES = [
    'Banking',
    'Banking:ATM',
    'Banking:Fees',
    'Credit Card Payment',
    'Entertainment',
    'Entertainment:Movies',
    'Entertainment:Music',
    'Entertainment:Streaming',
    'Food',
    'Food:Coffee',
    'Food:Dining',
    'Food:Fast Food',
    'Food:Groceries',
    'Food:Restaurant',
    'Food:Restaurant:Lunch',
    'Food:Restaurant:Dinner',
    'Food:Takeout',
    'Health',
    'Health:Doctor',
    'Health:Gym',
    'Health:Medical',
    'Health:Pharmacy',
    'Home',
    'Home:Improvement',
    'Housing',
    'Housing:Mortgage',
    'Income',
    'Income:Bonus',
    'Income:Salary',
    'Income:Tax Refund',
    'Insurance',
    'Insurance:Auto',
    'Shopping',
    'Shopping:General',
    'Shopping:Online',
    'Shopping:Wholesale',
    'Tax',
    'Tax:Property',
    'Transportation',
    'Transportation:Gas',
    'Transportation:Registration',
    'Utilities',
    'Utilities:Electric',
    'Utilities:Internet',
    'Utilities:Phone',
]

/*
 * Interactive CategorySelector with state management
 */
const InteractiveCategorySelector = ({ categories = SAMPLE_CATEGORIES, initialSelected = [] }) => {
    const [selectedCategories, setSelectedCategories] = useState(initialSelected)

    const handleCategoryAdded = category => setSelectedCategories(prev => [...prev, category])
    const handleCategoryRemoved = category => setSelectedCategories(prev => prev.filter(c => c !== category))

    return (
        <CategorySelector
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryAdded={handleCategoryAdded}
            onCategoryRemoved={handleCategoryRemoved}
            style={{ position: 'relative', left: '50%' }}
        />
    )
}

/*
 * Default story - empty selector with sample categories
 */
export const Default = { render: () => <InteractiveCategorySelector /> }

/*
 * Story with some categories pre-selected
 */
export const WithSelectedCategories = {
    render: () => (
        <InteractiveCategorySelector
            initialSelected={['Food:Restaurant', 'Transportation:Gas', 'Entertainment:Movies']}
        />
    ),
}

/*
 * Story with a large number of categories to test performance and scrolling
 */
export const LargeCategoryList = {
    render: () => {
        const largeCategories = []
        const topLevelCategories = [
            'Food',
            'Transportation',
            'Entertainment',
            'Shopping',
            'Health',
            'Home',
            'Banking',
            'Utilities',
        ]
        const subCategories = ['Category1', 'Category2', 'Category3', 'Category4', 'Category5']
        const subSubCategories = ['SubA', 'SubB', 'SubC']

        topLevelCategories.forEach(top => {
            largeCategories.push(top)
            subCategories.forEach(sub => {
                largeCategories.push(`${top}:${sub}`)
                subSubCategories.forEach(subsub => largeCategories.push(`${top}:${sub}:${subsub}`))
            })
        })

        return <InteractiveCategorySelector categories={largeCategories} />
    },
}
