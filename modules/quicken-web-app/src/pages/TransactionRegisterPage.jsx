// ABOUTME: Bank transaction register page — thin wrapper around RegisterPageView
// ABOUTME: Configures columns, selectors, and title for checking account display

import React from 'react'
import { TransactionColumns } from '../columns/index.js'
import * as S from '../store/selectors.js'
import { RegisterPageView } from './RegisterPageView.jsx'

const { bankColumns } = TransactionColumns

const bankConfig = {
    prefix: 'account',
    columns: bankColumns,
    sortSelector: S.Transactions.sortedForBankDisplay,
    highlightSelector: S.Transactions.highlightedIdForBank,
}

/*
 * Thin wrapper — renders RegisterPageView with bank-specific config
 *
 * @sig TransactionRegisterPage :: ({ accountId: String, height?: Number }) -> ReactElement
 */
const TransactionRegisterPage = ({ accountId, height }) => (
    <RegisterPageView accountId={accountId} height={height} config={bankConfig} />
)

export { TransactionRegisterPage }
