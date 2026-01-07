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
    // Sorts enriched accounts alphabetically by name
    // @sig toAlphabetized :: [EnrichedAccount] -> [EnrichedAccount]
    toAlphabetized: accounts => [...accounts].sort((a, b) => a.account.name.localeCompare(b.account.name)),

    // Sorts enriched accounts by balance descending (highest first, treats NaN as 0)
    // @sig toSortedByAmount :: [EnrichedAccount] -> [EnrichedAccount]
    toSortedByAmount: accounts => {
        const safeBalance = e => (Number.isFinite(e.balance) ? e.balance : 0)
        return [...accounts].sort((a, b) => safeBalance(b) - safeBalance(a))
    },

    // Converts section label to a section id
    // @sig toSectionId :: String -> String
    toSectionId: label => label.toLowerCase().replace(/\s+/g, '-').replace(/\$/g, ''),

    // Gets the section label for an enriched account
    // @sig toSectionLabel :: EnrichedAccount -> String
    toSectionLabel: e => TYPE_TO_SECTION[e.account.type] || 'Other',

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
    // Creates an AccountSection from enriched accounts
    // @sig createSection :: (String, [EnrichedAccount], Boolean, [AccountSection]?) -> AccountSection
    createSection: (label, accounts, isCollapsible, childSections = []) => {
        const id = T.toSectionId(label)
        const accountsTable = LookupTable(accounts, EnrichedAccount, 'id')
        const children = LookupTable(childSections, AccountSection, 'id')
        return AccountSection(id, label, isCollapsible, accountsTable, children)
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

    // Organizes accounts into sections based on sort mode (always segregates $0)
    // @sig collectSections :: (LookupTable<EnrichedAccount>, SortMode) -> LookupTable<AccountSection>
    collectSections: (enriched, sortMode) => {
        const sorted = T.toAlphabetized(enriched)
        const byAmount = T.toSortedByAmount(enriched)
        const withBalance = sorted.filter(e => !P.hasZeroBalance(e))
        const zeroBalance = sorted.filter(P.hasZeroBalance)
        const withBalanceByAmount = byAmount.filter(e => !P.hasZeroBalance(e))

        // @sig appendZeroSection :: [AccountSection] -> [AccountSection]
        const appendZeroSection = sections => {
            if (zeroBalance.length === 0) return sections
            return [...sections, F.createSection('$0 Balance', zeroBalance, true)]
        }

        const sections = sortMode.match({
            Alphabetical: () => appendZeroSection([F.createSection('All Accounts', withBalance, false)]),
            ByAmount: () => appendZeroSection([F.createSection('All Accounts', withBalanceByAmount, false)]),
            ByType: () => A.collectByTypeSections(withBalance, zeroBalance),
            Manual: () => appendZeroSection([F.createSection('All Accounts', withBalance, false)]),
        })

        return LookupTable(sections, AccountSection, 'id')
    },
}

const accountOrganization = { P, T, F, A }

export { accountOrganization }
