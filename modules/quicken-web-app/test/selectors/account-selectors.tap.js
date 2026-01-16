// ABOUTME: Tests for account-related selectors
// ABOUTME: Verifies balance computation and account enrichment

import t from 'tap'
import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Account } from '../../src/types/account.js'
import { Transaction } from '../../src/types/transaction.js'
import { Accounts } from '../../src/store/selectors/accounts.js'
import { AccountSection } from '../../src/types/account-section.js'
import { EnrichedAccount } from '../../src/types/enriched-account.js'
import { SortMode } from '../../src/types/sort-mode.js'

const { T, A } = Accounts
const accountBalance = T.toBankBalance
const enrichedAccounts = A.collectEnriched
const organizedAccounts = A.collectOrganized

// -----------------------------------------------------------------------------
// Test helpers
// -----------------------------------------------------------------------------

const bankTxn = (id, accountId, date, amount) =>
    Transaction.Bank.from({ id, accountId, date, amount, transactionType: 'bank' })

// -----------------------------------------------------------------------------
// accountBalance
// -----------------------------------------------------------------------------

t.test('Given a state with transactions for a bank account', t => {
    const account = Account('acc_000000000001', 'Checking', 'Bank', null, null)
    const transactions = LookupTable(
        [
            bankTxn('txn_000000000001', 'acc_000000000001', '2024-01-15', 100),
            bankTxn('txn_000000000002', 'acc_000000000001', '2024-01-20', -50),
            bankTxn('txn_000000000003', 'acc_000000000001', '2024-01-25', 200),
        ],
        Transaction,
        'id',
    )
    const state = { accounts: LookupTable([account], Account, 'id'), transactions }

    t.test('When accountBalance is called', t => {
        const result = accountBalance(state, 'acc_000000000001')
        t.equal(result, 250, 'Then it returns the sum of transaction amounts')
        t.end()
    })
    t.end()
})

t.test('Given a state with transactions for multiple accounts', t => {
    const account1 = Account('acc_000000000001', 'Checking', 'Bank', null, null)
    const account2 = Account('acc_000000000002', 'Savings', 'Bank', null, null)
    const transactions = LookupTable(
        [
            bankTxn('txn_000000000001', 'acc_000000000001', '2024-01-15', 100),
            bankTxn('txn_000000000002', 'acc_000000000002', '2024-01-20', 500),
            bankTxn('txn_000000000003', 'acc_000000000001', '2024-01-25', 200),
        ],
        Transaction,
        'id',
    )
    const state = { accounts: LookupTable([account1, account2], Account, 'id'), transactions }

    t.test('When accountBalance is called for account1', t => {
        const result = accountBalance(state, 'acc_000000000001')
        t.equal(result, 300, 'Then it only sums transactions for that account')
        t.end()
    })

    t.test('When accountBalance is called for account2', t => {
        const result = accountBalance(state, 'acc_000000000002')
        t.equal(result, 500, 'Then it only sums transactions for that account')
        t.end()
    })
    t.end()
})

t.test('Given a state with no transactions for an account', t => {
    const account = Account('acc_000000000001', 'Empty', 'Bank', null, null)
    const state = { accounts: LookupTable([account], Account, 'id'), transactions: LookupTable([], Transaction, 'id') }

    t.test('When accountBalance is called', t => {
        const result = accountBalance(state, 'acc_000000000001')
        t.equal(result, 0, 'Then it returns 0')
        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// enrichedAccounts
// -----------------------------------------------------------------------------

t.test('Given a state with bank accounts and transactions', t => {
    const account1 = Account('acc_000000000001', 'Checking', 'Bank', null, null)
    const account2 = Account('acc_000000000002', 'Savings', 'Bank', null, null)
    const transactions = LookupTable(
        [
            bankTxn('txn_000000000001', 'acc_000000000001', '2024-01-15', 100),
            bankTxn('txn_000000000002', 'acc_000000000002', '2024-01-20', 500),
            bankTxn('txn_000000000003', 'acc_000000000001', '2024-01-25', 200),
        ],
        Transaction,
        'id',
    )
    const state = { accounts: LookupTable([account1, account2], Account, 'id'), transactions }

    t.test('When enrichedAccounts is called', t => {
        const result = enrichedAccounts(state)

        t.ok(LookupTable.is(result), 'Then it returns a LookupTable')
        t.equal(result.length, 2, 'Then it has 2 enriched accounts')

        const enriched1 = result.get('acc_000000000001')
        t.ok(EnrichedAccount.is(enriched1), 'Then each item is an EnrichedAccount')
        t.equal(enriched1.id, 'acc_000000000001', 'Then id matches account id')
        t.equal(enriched1.account.name, 'Checking', 'Then account is embedded')
        t.equal(enriched1.balance, 300, 'Then balance is computed from transactions')
        t.equal(enriched1.dayChange, 0, 'Then dayChange is 0 for bank accounts')
        t.equal(enriched1.dayChangePct, undefined, 'Then dayChangePct is undefined for bank accounts')

        const enriched2 = result.get('acc_000000000002')
        t.equal(enriched2.balance, 500, 'Then second account has correct balance')

        t.end()
    })
    t.end()
})

// -----------------------------------------------------------------------------
// organizedAccounts
// -----------------------------------------------------------------------------

t.test('Given accounts of various types with SortMode.Alphabetical', t => {
    const accounts = LookupTable(
        [
            Account('acc_000000000001', 'Checking', 'Bank', null, null),
            Account('acc_000000000002', 'Savings', 'Bank', null, null),
            Account('acc_000000000003', 'Credit Card', 'Credit Card', null, null),
        ],
        Account,
        'id',
    )
    const transactions = LookupTable(
        [
            bankTxn('txn_000000000001', 'acc_000000000001', '2024-01-15', 100),
            bankTxn('txn_000000000002', 'acc_000000000002', '2024-01-20', 200),
            bankTxn('txn_000000000003', 'acc_000000000003', '2024-01-25', -50),
        ],
        Transaction,
        'id',
    )
    const state = { accounts, transactions, accountListSortMode: SortMode.Alphabetical() }

    t.test('When organizedAccounts is called', t => {
        const result = organizedAccounts(state)

        t.ok(LookupTable.is(result), 'Then it returns a LookupTable of sections')
        t.equal(result.length, 1, 'Then it has 1 section (all accounts)')

        const section = result[0]
        t.ok(AccountSection.is(section), 'Then each item is an AccountSection')
        t.equal(section.label, 'All Accounts', 'Then section label is All Accounts')
        t.equal(section.accounts.length, 3, 'Then section has 3 accounts')
        t.equal(section.accounts[0].account.name, 'Checking', 'Then accounts are alphabetized')
        t.equal(section.accounts[1].account.name, 'Credit Card', 'Then Credit Card is second')
        t.equal(section.accounts[2].account.name, 'Savings', 'Then Savings is third')

        t.end()
    })
    t.end()
})

t.test('Given accounts with zero balance (Alphabetical mode with $0 section)', t => {
    const accounts = LookupTable(
        [
            Account('acc_000000000001', 'Checking', 'Bank', null, null),
            Account('acc_000000000002', 'Empty Account', 'Bank', null, null),
            Account('acc_000000000003', 'Savings', 'Bank', null, null),
        ],
        Account,
        'id',
    )
    const transactions = LookupTable(
        [
            bankTxn('txn_000000000001', 'acc_000000000001', '2024-01-15', 100),
            bankTxn('txn_000000000002', 'acc_000000000003', '2024-01-20', 500),

            // acc_000000000002 has no transactions = $0 balance
        ],
        Transaction,
        'id',
    )
    const state = { accounts, transactions, accountListSortMode: SortMode.Alphabetical() }

    t.test('When organizedAccounts is called', t => {
        const result = organizedAccounts(state)

        t.equal(result.length, 2, 'Then it has 2 sections')

        const mainSection = result[0]
        t.equal(mainSection.label, 'All Accounts', 'Then first section is main accounts')
        t.equal(mainSection.accounts.length, 2, 'Then main section has 2 accounts with balance')
        t.equal(mainSection.isCollapsible, false, 'Then main section is not collapsible')

        const zeroSection = result[1]
        t.equal(zeroSection.label, '$0 Balance', 'Then second section is zero balance')
        t.equal(zeroSection.accounts.length, 1, 'Then zero section has 1 account')
        t.equal(zeroSection.isCollapsible, true, 'Then zero section is collapsible')
        t.equal(zeroSection.accounts[0].account.name, 'Empty Account', 'Then Empty Account is in zero section')

        t.end()
    })
    t.end()
})

t.test('Given accounts with SortMode.ByType', t => {
    const accounts = LookupTable(
        [
            Account('acc_000000000001', 'Checking', 'Bank', null, null),
            Account('acc_000000000002', 'Cash', 'Cash', null, null),
            Account('acc_000000000003', 'Visa', 'Credit Card', null, null),
        ],
        Account,
        'id',
    )
    const transactions = LookupTable(
        [
            bankTxn('txn_000000000001', 'acc_000000000001', '2024-01-15', 100),
            bankTxn('txn_000000000002', 'acc_000000000002', '2024-01-20', 50),
            bankTxn('txn_000000000003', 'acc_000000000003', '2024-01-25', -200),
        ],
        Transaction,
        'id',
    )
    const state = { accounts, transactions, accountListSortMode: SortMode.ByType() }

    t.test('When organizedAccounts is called', t => {
        const result = organizedAccounts(state)

        t.equal(result.length, 2, 'Then it has 2 sections (Cash, Credit)')

        const cashSection = result.find(s => s.label === 'Cash')
        t.ok(cashSection, 'Then there is a Cash section')
        t.equal(cashSection.accounts.length, 2, 'Then Cash has Bank + Cash accounts')

        const creditSection = result.find(s => s.label === 'Credit')
        t.ok(creditSection, 'Then there is a Credit section')
        t.equal(creditSection.accounts.length, 1, 'Then Credit has 1 account')

        t.end()
    })
    t.end()
})
