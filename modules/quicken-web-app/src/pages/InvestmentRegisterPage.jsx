// ABOUTME: Investment transaction register page — thin wrapper around RegisterPageView
// ABOUTME: Configures columns, selectors, and title for investment account display

import React from 'react'
import { TransactionColumns } from '../columns/index.js'
import * as S from '../store/selectors.js'
import { RegisterPageView } from './RegisterPageView.jsx'

const { investmentColumns } = TransactionColumns

const investmentConfig = {
    prefix: 'investment',
    columns: investmentColumns,
    sortSelector: S.Transactions.sortedForDisplay,
    highlightSelector: S.Transactions.highlightedId,
    filterChipRowProps: { showSecurities: true, showActions: true, showCategories: false },
    useManualCounts: true,
}

/*
 * Thin wrapper — renders RegisterPageView with investment-specific config
 *
 * @sig InvestmentRegisterPage :: ({ accountId: String, height?: Number }) -> ReactElement
 */
const InvestmentRegisterPage = ({ accountId, height }) => (
    <RegisterPageView accountId={accountId} height={height} config={investmentConfig} />
)

export { InvestmentRegisterPage }
