/*
 * Display import results
 * @sig displayImportResults :: QifData -> void
 */
import { filter, map } from '@graffio/functional'

const displayImportResults = qifData => {
    console.log('\nImport Statistics:')
    console.log(`  Accounts: ${qifData.accounts.length}`)
    console.log(`  Securities: ${qifData.securities.length}`)
    console.log(`  Categories: ${qifData.categories.length}`)
    console.log(`  Tags: ${qifData.tags.length}`)
    console.log(`  Bank Transactions: ${qifData.bankTransactions.length}`)
    console.log(`  Investment Transactions: ${qifData.investmentTransactions.length}`)
    console.log(`  Prices: ${qifData.prices.length}`)
}

/*
 * Display all (account, security) pairs with non-zero balance
 * @sig displayAccountSecurityHoldings :: ([Holding], [Account], [Security]) -> void
 */
const displayAccountSecurityHoldings = (holdings, accounts, securities) => {
    if (holdings.length === 0) {
        console.log('\n✅ No account/security holdings with non-zero balance found')
        return
    }

    const createMap = items => new Map(items.map(item => [item.id, item]))
    const accountMap = createMap(accounts)
    const securityMap = createMap(securities)

    const groupHoldingsByAccount = () => {
        const grouped = new Map()
        holdings.forEach(h => {
            if (!grouped.has(h.accountId)) grouped.set(h.accountId, [])
            grouped.get(h.accountId).push(h)
        })
        return grouped
    }

    const displaySecurity = h => {
        const security = securityMap.get(h.securityId)
        if (!security) return

        const symbol = security.symbol ? ` (${security.symbol})` : ''
        console.log(`    ${security.name}${symbol}: ${h.quantity}`)
    }

    const displayAccountHoldings = (accountHoldings, accountId) => {
        const account = accountMap.get(accountId)
        if (!account) return

        console.log(`  ${account.name} (${account.type})`)
        accountHoldings.forEach(displaySecurity)
    }

    const holdingsByAccount = groupHoldingsByAccount()
    console.log(`\n📄 Account/Security Holdings with Non-Zero Balance (${holdings.length} positions):`)
    holdingsByAccount.forEach(displayAccountHoldings)
}

/*
 * Display schema information
 * @sig displaySchemaInfo :: SchemaInfo -> void
 */
const displaySchemaInfo = schemaInfo => {
    const displayTableColumn = col => {
        const nullable = col.nullable ? 'NULL' : 'NOT NULL'
        const pk = col.primaryKey ? ' (PRIMARY KEY)' : ''
        console.log(`    ${col.name}: ${col.type} ${nullable}${pk}`)
    }

    const displayTable = table => {
        console.log(`\n  ${table.name}:`)
        map(displayTableColumn, table.columns)
    }

    const displayViews = () => {
        if (schemaInfo.views.length === 0) return
        console.log('\nViews:')
        map(view => console.log(`  - ${view.name}`), schemaInfo.views)
    }

    const displayIndexes = () => {
        if (schemaInfo.indexes.length === 0) return
        console.log('\nIndexes:')
        map(index => console.log(`  - ${index.name}`), schemaInfo.indexes)
    }

    console.log('\n=== Database Schema ===')
    console.log('\nTables:')
    map(displayTable, schemaInfo.tables)
    displayViews()
    displayIndexes()
}

/*
 * Display accounts with non-zero balances
 * @sig displayAccountsWithNonZeroBalances :: ([AccountWithBalance], [Holding], [Security], Database) -> void
 */
const displayAccountsWithNonZeroBalances = (accountsWithBalances, allHoldings, allSecurities, db) => {
    const hasSignificantBalance = account =>
        Math.abs(account.cashBalance) >= 1 ||
        Math.abs(account.investmentBalance) >= 1 ||
        Math.abs(account.totalBalance) >= 1

    const filtered = filter(hasSignificantBalance, accountsWithBalances)
    if (filtered.length === 0) {
        console.log('\n⚠️  No accounts with non-zero balances found')
        return
    }

    const processValue = v => {
        let s = Math.abs(v) < 1e-6 ? '0' : v.toFixed(6).replace(/^-0\./, '0.')
        s = s.replace(/(\.[0-9]*[1-9])0+$/, '$1').replace(/\.0+$/, '')
        if (s.endsWith('.')) s = s.slice(0, -1)
        const [intPart, fracPart] = s.split('.')
        return { intPart, fracPart: fracPart || '', orig: s }
    }

    const formatNumber = (values, header) => {
        const splitVals = map(processValue, values)
        const maxInt = Math.max(...splitVals.map(x => x.intPart.length), header.length)
        const maxFrac = Math.max(...splitVals.map(x => x.fracPart.length))
        const headerStr = header.padStart(maxInt + (maxFrac ? 1 : 0) + maxFrac)

        const formatValue = x =>
            maxFrac
                ? x.intPart.padStart(maxInt) + (x.fracPart ? '.' + x.fracPart.padEnd(maxFrac) : ' '.repeat(maxFrac + 1))
                : x.intPart.padStart(maxInt)

        const out = map(formatValue, splitVals)
        return { out, header: headerStr }
    }

    const createMaps = () => {
        const securityMap = new Map(allSecurities.map(s => [s.id, s]))
        const holdingsByAccount = new Map()
        allHoldings.forEach(h => {
            if (!holdingsByAccount.has(h.accountId)) holdingsByAccount.set(h.accountId, [])
            holdingsByAccount.get(h.accountId).push(h)
        })
        return { securityMap, holdingsByAccount }
    }

    const getLatestPrice = securityId => {
        const row = db
            .prepare('SELECT price FROM prices WHERE security_id = ? ORDER BY date DESC LIMIT 1')
            .get(securityId)
        return row && row.price ? row.price : 0
    }

    const formatBalance = v => (Math.abs(v) < 1 ? '0.00' : v.toFixed(2).replace(/^-0\./, '0.'))

    const getSecurityName = h => {
        const security = securityMap.get(h.securityId)
        const symbol = security && security.symbol ? ` (${security.symbol})` : ''
        return security ? security.name + symbol : 'Unknown'
    }

    const displayHoldingsTable = (holdings, securityMap) => {
        if (holdings.length === 0) return

        const quantities = map(h => Number(h.quantity), holdings)
        const prices = map(h => getLatestPrice(h.securityId), holdings)
        const totals = map((h, i) => quantities[i] * prices[i], holdings)
        const names = map(getSecurityName, holdings)

        const qCol = formatNumber(quantities, 'Quantity')
        const pCol = formatNumber(prices, 'Latest Price')
        const tCol = formatNumber(totals, 'Total')
        const nameHeader = 'Name'
        const nameWidth = Math.max(...names.map(n => n.length), nameHeader.length)

        console.log('    Holdings:')
        console.log(`      ${qCol.header}  ${pCol.header}  ${tCol.header}  ${nameHeader.padEnd(nameWidth)}`)
        holdings.forEach((h, i) =>
            console.log(`      ${qCol.out[i]}  ${pCol.out[i]}  ${tCol.out[i]}  ${names[i].padEnd(nameWidth)}`),
        )
    }

    const displayAccount = (account, securityMap, holdingsByAccount) => {
        const description = account.description ? ` - ${account.description}` : ''
        console.log(`  - ${account.name} (${account.type})${description}`)
        console.log(`    Cash: $${formatBalance(account.cashBalance)}`)
        console.log(`    Investments: $${formatBalance(account.investmentBalance)}`)
        console.log(`    Total: $${formatBalance(account.totalBalance)}`)

        const holdings = holdingsByAccount.get(account.id) || []
        displayHoldingsTable(holdings, securityMap)
        console.log('')
    }

    const { securityMap, holdingsByAccount } = createMaps()
    console.log(`\n💰 Accounts with non-zero balances (${filtered.length}):`)
    map(account => displayAccount(account, securityMap, holdingsByAccount), filtered)
}

/*
 * Display account register with running cash balances
 * @sig displayAccountRegister :: (String, [RegisterEntry]) -> void
 */
const displayAccountRegister = (accountName, registerEntries) => {
    console.log(`\n📋 ACCOUNT REGISTER: ${accountName}`)
    console.log('='.repeat(120))
    console.log('Date       | Type         | Action    | Amount       | Cash Impact  | Running Balance | Payee/Memo')
    console.log('-'.repeat(120))

    registerEntries.forEach(entry => {
        const date = entry.date
        const type = entry.transaction_type.padEnd(12)
        const action = (entry.investment_action || '').padEnd(9)
        const amount = entry.amount ? entry.amount.toFixed(2).padStart(12) : ' '.repeat(12)
        const cashImpact = entry.cash_impact.toFixed(2).padStart(12)
        const runningBalance = entry.running_balance.toFixed(2).padStart(15)
        const description = (entry.payee || entry.memo || '').substring(0, 30)

        console.log(`${date} | ${type} | ${action} | ${amount} | ${cashImpact} | ${runningBalance} | ${description}`)
    })

    if (registerEntries.length === 0) {
        console.log('No transactions found for this account.')
    } else {
        const finalBalance = registerEntries[registerEntries.length - 1].running_balance
        console.log('-'.repeat(120))
        console.log(`Final Cash Balance: ${finalBalance.toFixed(2)}`)
    }
}

export {
    displayAccountRegister,
    displayAccountsWithNonZeroBalances,
    displayAccountSecurityHoldings,
    displayImportResults,
    displaySchemaInfo,
}
