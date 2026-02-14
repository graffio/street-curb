// ABOUTME: Pure domain logic for organizing accounts into sections
// ABOUTME: Handles sorting, grouping, and section creation based on SortMode

import LookupTable from '@graffio/functional/src/lookup-table.js'
import { AccountSection } from '../types/account-section.js'
import { EnrichedAccount } from '../types/enriched-account.js'

// Maps account types to display sections
const TYPE_TO_SECTION = {
    Bank: 'Cash',
    Cash: 'Cash',
    'Credit Card': 'Credit',
    Investment: 'Investments',
    '401(k)/403(b)': 'Investments',
    'Other Asset': 'Other Assets',
    'Other Liability': 'Other Liabilities',
}

// Ordered list of section labels for consistent display
const SECTION_ORDER = ['Cash', 'Credit', 'Investments', 'Other Assets', 'Other Liabilities', 'Other']

const P = {
    // Checks if an enriched account has zero balance (within 1 cent, treats NaN as zero)
    // @sig hasZeroBalance :: EnrichedAccount -> Boolean
    hasZeroBalance: enriched => !Number.isFinite(enriched.balance) || Math.abs(enriched.balance) < 0.01,
}

const T = {
    // Returns balance as a number, treating NaN/Infinity as 0
    // @sig toSafeBalance :: EnrichedAccount -> Number
    toSafeBalance: e => (Number.isFinite(e.balance) ? e.balance : 0),

    // Sorts enriched accounts alphabetically by name
    // @sig toAlphabetized :: [EnrichedAccount] -> [EnrichedAccount]
    toAlphabetized: accounts => [...accounts].sort((a, b) => a.account.name.localeCompare(b.account.name)),

    // Sorts enriched accounts by balance descending (highest first, treats NaN as 0)
    // @sig toSortedByAmount :: [EnrichedAccount] -> [EnrichedAccount]
    toSortedByAmount: accounts => [...accounts].sort((a, b) => T.toSafeBalance(b) - T.toSafeBalance(a)),

    // Converts section label to a section id
    // @sig toSectionId :: String -> String
    toSectionId: label => label.toLowerCase().replace(/\s+/g, '-').replace(/\$/g, ''),

    // Gets the section label for an enriched account
    // @sig toSectionLabel :: EnrichedAccount -> String
    toSectionLabel: e => TYPE_TO_SECTION[e.account.type] || 'Other',

    // Appends a $0 Balance section to a list of sections if any zero-balance accounts exist
    // @sig toWithZeroSection :: ([AccountSection], [EnrichedAccount]) -> [AccountSection]
    toWithZeroSection: (sections, zeroBalance) => {
        if (zeroBalance.length === 0) return sections
        return [...sections, F.createSection('$0 Balance', zeroBalance, true)]
    },

    // Groups accounts by their section label
    // @sig toGroupedByType :: [EnrichedAccount] -> Object
    toGroupedByType: accounts => {
        const addToGroup = (groups, e) => {
            const label = T.toSectionLabel(e)
            groups[label] = [...(groups[label] || []), e]
            return groups
        }
        return accounts.reduce(addToGroup, {})
    },
}

const F = {
    // Creates an AccountSection from enriched accounts, computing subtotals
    // @sig createSection :: (String, [EnrichedAccount], Boolean, [AccountSection]?) -> AccountSection
    createSection: (label, accounts, isCollapsible, childSections = []) => {
        const id = T.toSectionId(label)
        const accountsTable = LookupTable(accounts, EnrichedAccount, 'id')
        const children = LookupTable(childSections, AccountSection, 'id')
        const directBalance = accounts.reduce((sum, e) => sum + T.toSafeBalance(e), 0)
        const childBalance = childSections.reduce((sum, child) => sum + (child.totalBalance ?? 0), 0)
        const totalBalance = directBalance + childBalance
        const childAccountCount = childSections.reduce((sum, child) => sum + (child.totalCount ?? 0), 0)
        const totalCount = accounts.length + childAccountCount
        return AccountSection(id, label, isCollapsible, accountsTable, children, totalBalance, totalCount)
    },

    // Creates a $0 Balance section with nested type subsections
    // @sig createZeroBalanceByType :: [EnrichedAccount] -> AccountSection
    createZeroBalanceByType: zeroAccounts => {
        const groups = T.toGroupedByType(zeroAccounts)
        const orderedLabels = SECTION_ORDER.filter(label => groups[label])
        const childSections = orderedLabels.map(label => F.createSection(label, groups[label], true))
        return F.createSection('$0 Balance', [], true, childSections)
    },
}

const A = {
    // Creates sections for ByType sort mode with $0 nested subsections
    // @sig collectByTypeSections :: ([EnrichedAccount], [EnrichedAccount]) -> [AccountSection]
    collectByTypeSections: (withBalance, zeroBalance) => {
        const groups = T.toGroupedByType(withBalance)
        const orderedLabels = SECTION_ORDER.filter(label => groups[label])
        const result = orderedLabels.map(label => F.createSection(label, groups[label], true))
        if (zeroBalance.length > 0) result.push(F.createZeroBalanceByType(zeroBalance))
        return result
    },
}

// Organizes accounts into sections based on sort mode (always segregates $0)
// @sig toAccountSections :: (LookupTable<EnrichedAccount>, SortMode) -> LookupTable<AccountSection>
const toAccountSections = (enriched, sortMode) => {
    const sorted = T.toAlphabetized(enriched)
    const byAmount = T.toSortedByAmount(enriched)
    const withBalance = sorted.filter(e => !P.hasZeroBalance(e))
    const zeroBalance = sorted.filter(P.hasZeroBalance)
    const withBalanceByAmount = byAmount.filter(e => !P.hasZeroBalance(e))

    const sections = sortMode.match({
        Alphabetical: () => T.toWithZeroSection([F.createSection('All Accounts', withBalance, false)], zeroBalance),
        ByAmount: () => T.toWithZeroSection([F.createSection('All Accounts', withBalanceByAmount, false)], zeroBalance),
        ByType: () => A.collectByTypeSections(withBalance, zeroBalance),
        Manual: () => T.toWithZeroSection([F.createSection('All Accounts', withBalance, false)], zeroBalance),
    })

    return LookupTable(sections, AccountSection, 'id')
}

export { toAccountSections }
