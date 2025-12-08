import React from 'react'
import { generateRealisticTransactions } from '../utils/mock-transaction-generator.js'
import { TransactionRegisterPage } from './TransactionRegisterPage'

const defaultTransactions = generateRealisticTransactions(10000)

const Default = args => <TransactionRegisterPage {...args} />

export default {
    title: 'Pages/TransactionRegisterPage',
    component: TransactionRegisterPage,
    parameters: { layout: 'fullscreen' },
    args: { transactions: defaultTransactions, startingBalance: 5000, height: 600 },
}

export { Default }
