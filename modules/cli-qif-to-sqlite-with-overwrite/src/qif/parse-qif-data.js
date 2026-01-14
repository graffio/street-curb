// ABOUTME: Parses QIF file content into structured data groups
// ABOUTME: Converts line-oriented QIF format into typed Entry objects by context

// COMPLEXITY: legacy-module — This module is preserved for reference only, pending deletion
// COMPLEXITY: export-structure — Legacy export style preserved for compatibility
// COMPLEXITY: multiline-destructuring — Legacy code style preserved for reference
// COMPLEXITY-TODO: lines — Pre-existing debt, QIF parsing module (expires 2026-07-01)
// COMPLEXITY-TODO: functions — Pre-existing debt, QIF parsing module (expires 2026-07-01)
// COMPLEXITY-TODO: cohesion-structure — Pre-existing debt, parser functions (expires 2026-07-01)
// COMPLEXITY-TODO: sig-documentation — Pre-existing debt, QIF parsing (expires 2026-07-01)
// COMPLEXITY-TODO: single-level-indentation — Pre-existing debt, QIF parsing (expires 2026-07-01)
// COMPLEXITY-TODO: line-length — Pre-existing debt, array literal and error messages (expires 2026-07-01)
// COMPLEXITY-TODO: chain-extraction — Pre-existing debt, QifEntry usage (expires 2026-07-01)

/*
 * QIF is a line-oriented format where each row of a file is a single-line entry or a multi-line "LineGroup" (my name)
 * Each row of a LineGroup specifies some attribute of the LineGroup, and the LineGroup as a whole is within some
 * overarching "context".
 *
 *   !Type:Prices                       <- set the current context to 'Prices'
 *   "ZS",184.45," 6/14'24"             <- Z indicates this is a Price, because it's in a 'Prices' context
 *   ^                                  <- ^ ends a LineGroup
 *
 * In this simple example, there are 2 LineGroups:
 *
 *   !Type:Prices                       <- First just sets context
 *   ["ZS",184.45," 6/14'24"]           <- Second has data
 *
 *
 * A LineGroup gets converted into an Entity based on the context; there are many Entities
 */

import { groupBy } from '@graffio/functional'
import { lineGroupToEntry } from '../line-group-to-entry.js'
import { QifEntry } from '../types/index.js'

/*
 * These lines in a QIF file define the current context for lines that follow it; if you're in the Security context
 * you can expect that each lineGroup thereafter will have entries for a security until the context changes
 * Sometimes the context is set for a single LineGroup (Security and Prices) and sometimes for a slew of LineGroups
 */
const CONTEXTS = {
    '!Type:Bank': 'Bank',
    '!Type:Cash': 'Cash',
    '!Type:Cat': 'Category',
    '!Type:CCard': 'Credit Card',
    '!Type:Class': 'Class',
    '!Type:Invst': 'Investment',
    '!Type:Memorized': 'Memorized',
    '!Type:Oth A': 'Other Asset',
    '!Type:Oth L': 'Other Liability',
    '!Type:Payee': 'Payees',
    '!Type:Port': 'Investment',
    '!Type:Prices': 'Prices',
    '!Type:Security': 'Security',
    '!Type:Tag': 'Tag',

    // probably not in Quicken Premier
    '!Type:Bill': 'Bill',
    '!Type:Budget': 'Budget',
    '!Type:Invitem': 'Invoice Item',
    '!Type:Invoice': 'Invoice Transactions',
    '!Type:Tax': 'Tax-related',
    '!Type:Template': 'Business Template',
}

/*
 * Parse the text of a QIF into LineGroups. A LineGroup may consist of a single line, or many lines ending with a '^'
 *
 * @sig groupLines :: String -> [LineGroup]
 *  LineGroup = Header|[Field]
 *  Header = String
 *  Field = String
 *
 */
const groupLines = qifText => {
    const processLine = line => {
        if (line.startsWith('!Type')) return lineGroups.push(line)
        if (line.startsWith('!Option')) return lineGroups.push(line)
        if (line.startsWith('!Clear')) return lineGroups.push(line)

        if (line === '^') {
            lineGroups.push(openGroup)
            openGroup = []
        } else {
            openGroup.push(line)
        }
    }

    const lineGroups = []
    let openGroup = []
    const lines = qifText.split('\n').map(l => l.trim())
    lines.forEach(processLine)
    return lineGroups
}

/*
 * Process each LineGroup
 *
 * These LineGroups are just a single string, with a special meaning:
 *
 *   !Option:xyz  set option xyz
 *   !Clear:xyz   clear option xyz
 *   !Type:xyz    set the current context for the next LineGroups
 *
 * But most LineGroups are arrays of String that need to be processed based on their content and the current context
 * by lineGroupTo Entry
 */
const lineGroupsToEntries = lineGroups => {
    // prettier-ignore
    const byEntryType = entry => {
        if (QifEntry.Account.is(entry))               return 'accounts'
        if (QifEntry.Category.is(entry))              return 'categories'
        if (QifEntry.Class.is(entry))                 return 'classes'
        if (QifEntry.Security.is(entry))              return 'securities'
        if (QifEntry.TransactionBank.is(entry))       return 'bankTransactions'
        if (QifEntry.TransactionInvestment.is(entry)) return 'investmentTransactions'
        if (QifEntry.Payee.is(entry))                 return 'payees'
        if (QifEntry.Price.is(entry))                 return 'prices'
        if (QifEntry.Tag.is(entry))                   return 'tags'
        return 'others'
    }

    // prettier-ignore
    const processLineGroup = lineGroup => {
        const _lineGroupToEntry = () => {
            // Validate that transactions have account context
            const isTransactionContext = ['Bank', 'Cash', 'Credit Card', 'Investment', 'Invoice', 'Other Asset', 'Other Liability'].includes(currentContext)
            if (isTransactionContext && !currentAccount)
                throw new Error(`Transaction found in ${currentContext} context but no current account defined; line ${lineNumber}`)
           
            lineNumber += lineGroup.length + 1
            const result = lineGroupToEntry(currentContext, currentAccount, lineGroup)
            return Array.isArray(result) ? entries.splice(entries.length, 0, ...result) : entries.push(result)
        }
      
        if (!Array.isArray(lineGroup) && lineGroup.startsWith('!Option')) return setOption(lineGroup)
        if (!Array.isArray(lineGroup) && lineGroup.startsWith('!Clear'))  return clearOption(lineGroup)
        if (!Array.isArray(lineGroup) && lineGroup.startsWith('!Type'))   return setCurrentContext(lineGroup)
        if (Array.isArray(lineGroup)  && lineGroup[0] === '!Account')     return setAccountContext(lineGroup)
        if (Array.isArray(lineGroup))                                     return _lineGroupToEntry()
        
        throw new Error(`Don't understand lineGroup: ${lineGroup}}`)
    }

    const setOption = option => {
        const optionName = option.slice(8)
        options[optionName] = true
        lineNumber++
    }

    const clearOption = option => {
        const optionName = option.slice(7)
        options[optionName] = false
        lineNumber++
    }

    const setCurrentContext = header => {
        if (!CONTEXTS[header]) throw new Error(`Don't understand context: ${header}`)
        currentContext = CONTEXTS[header]
        lineNumber++
    }

    const setAccountContext = lineGroup => {
        currentContext = 'Account'
        currentAccount = lineGroupToEntry(currentContext, undefined, lineGroup.slice(1))
        entries.push(currentAccount)
    }

    let lineNumber = 1
    let entries = []
    lineGroups.forEach(processLineGroup)
    entries = entries.filter(e => e) // remove undefined

    let {
        accounts,
        categories,
        classes,
        securities,
        bankTransactions,
        investmentTransactions,
        payees,
        prices,
        tags,
        others,
    } = groupBy(byEntryType, entries)

    // Validate accounts exist if there are transactions
    if (!accounts && (bankTransactions?.length > 0 || investmentTransactions?.length > 0))
        throw new Error('QIF file contains transactions but no accounts. All transactions need an account.')

    accounts = accounts.sort((a, b) => a.name - b.name)

    return {
        accounts,
        categories,
        classes,
        securities,
        bankTransactions,
        investmentTransactions,
        payees,
        prices,
        tags,
        others,
    }
}

let currentContext
let currentAccount
const options = {}

const parseQifData = qifText => {
    const validateDataIntegrity = (accounts, securities, bankTransactions, investmentTransactions) => {
        const hasInvestmentTransactions = investmentTransactions && investmentTransactions.length > 0
        const hasBankTransactions = bankTransactions && bankTransactions.length > 0
        const hasAnyTransactions = hasBankTransactions || hasInvestmentTransactions
        const hasAccounts = accounts && accounts.length > 0
        const hasSecurities = securities && securities.length > 0

        if (hasInvestmentTransactions && !hasAccounts)
            throw new Error('Investment transactions found but no accounts. Investment transactions require accounts.')

        if (hasInvestmentTransactions && !hasSecurities)
            throw new Error('Investment transactions but no securities. Investment transactions require securities.')

        if (hasAnyTransactions && !hasAccounts)
            throw new Error('Transactions found but no accounts defined. Transactions require associated accounts.')

        // Validate that all transactions have account information
        if (hasBankTransactions) {
            const transactionsWithoutAccount = bankTransactions.filter(t => !t.account)
            if (transactionsWithoutAccount.length > 0)
                throw new Error(`Found bank transactions without account information`)
        }

        if (hasInvestmentTransactions) {
            const transactionsWithoutAccount = investmentTransactions.filter(t => !t.account)
            if (transactionsWithoutAccount.length > 0)
                throw new Error(`Found investment transactions without account information`)
        }
    }

    const lineGroups = groupLines(qifText)
    const entries = lineGroupsToEntries(lineGroups)

    const {
        accounts,
        categories,
        classes,
        securities,
        bankTransactions,
        investmentTransactions,
        payees,
        prices,
        tags,
        others,
    } = entries

    validateDataIntegrity(accounts, securities, bankTransactions, investmentTransactions)

    // prettier-ignore
    return {
        accounts              : accounts               || [],
        categories            : categories             || [],
        classes               : classes                || [],
        securities            : securities             || [],
        bankTransactions      : bankTransactions       || [],
        investmentTransactions: investmentTransactions || [],
        payees                : payees                 || [],
        prices                : prices                 || [],
        tags                  : tags                   || [],
        others                : others                 || [],
    }
}

export default parseQifData
