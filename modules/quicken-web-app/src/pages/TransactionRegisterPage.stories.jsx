import React from 'react'
import { generateRealisticTransactions } from '../utils/mock-transaction-generator.js'
import { TransactionRegisterPage } from './TransactionRegisterPage'

/*
 * Storybook stories for TransactionRegisterPage component
 *
 * This file demonstrates the complete transaction register page that can be used
 * in both Storybook and the real application.
 */

const defaultTransactions = generateRealisticTransactions(10000)
const smallTransactions = generateRealisticTransactions(500)
const largeTransactions = generateRealisticTransactions(25000)

/*
 * Default story - standard page with full dataset
 */
const Default = args => <TransactionRegisterPage {...args} />

/*
 * Small Dataset story - faster loading for development
 */
const SmallDataset = args => (
    <TransactionRegisterPage transactions={smallTransactions} startingBalance={2500} {...args} />
)

/*
 * Large Dataset story - stress test with many transactions
 */
const LargeDataset = args => (
    <TransactionRegisterPage transactions={largeTransactions} startingBalance={15000} {...args} />
)

/*
 * Custom Height story - demonstrates different height configurations
 */
const CustomHeight = args => (
    <TransactionRegisterPage transactions={defaultTransactions} startingBalance={5000} height={400} {...args} />
)

/*
 * Empty State story - shows behavior with no transactions
 */
const EmptyState = args => <TransactionRegisterPage transactions={[]} startingBalance={1000} {...args} />

export default {
    title: 'Pages/TransactionRegisterPage',
    component: TransactionRegisterPage,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
                Complete transaction register page with filtering and search capabilities.
                
                This page combines:
                - Date range filtering (preset ranges + custom dates)
                - Search highlighting
                - Transaction virtualization for performance
                - MainLayout integration with sidebar and top bar
                
                The page can be used in both Storybook and the main application.
                `,
            },
        },
    },
    args: { transactions: defaultTransactions, startingBalance: 5000, height: 600 },
    argTypes: {
        transactions: { description: 'Array of transaction objects to display', control: false },
        startingBalance: { description: 'Starting account balance', control: { type: 'number' } },
        height: {
            description: 'Height of the transaction register component',
            control: { type: 'range', min: 300, max: 800, step: 50 },
        },
    },
}

export { Default, SmallDataset, LargeDataset, CustomHeight, EmptyState }
