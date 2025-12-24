// ABOUTME: Integration tests for QIF parser
// ABOUTME: Verifies parsing of accounts, transactions, categories, securities, prices, and edge cases

import tap from 'tap'
import parseQifData from '../src/qif/parse-qif-data.js'

const sampleQifData = `!Option:AutoSwitch
!Clear:AutoSwitch
!Account
NBrokerage Account
TInvst
DMain investment account
L10000.00
^
!Type:Invst
D01/15/2023
NBuy
YAPL
I150.25
Q10
T1502.50
CX
#123
L[Brokerage Account]
MBought 10 shares of Apple Inc.
O14.99
^
D01/20/2023
NSell
YMSFT
I300.50
Q5
T1502.50
L[Brokerage Account]
MPartial sale of Microsoft shares
O14.99
$1000.00
$502.50
^
D02/01/2023
NShrsIn
YGOOG
I2500.00
Q1.5
T3750.00
MStock split 3:2
^
D02/15/2023
NReinvDiv
YAPL
I155.00
Q0.5
T77.50
MReinvested dividend
^
D03/01/2023
NXIn
YABC
I0
Q100
T0
MReceived shares from spinoff
^
D03/15/2023
NShtSell
YXYZ
I50
Q-10
T-500
MShort sell transaction
^
D04/01/2023
NMargInt
T-50.00
MMargIn Interest
^
D04/15/2023
NCGLong
YAPL
T1000.00
MLong-term capital gains distribution
^
!Type:Bank
D05/01/2023
T-1000.00
PCheck 101
N101
L[Brokerage Account]
MTransfer to brokerage account
^
!Type:CCard
D05/15/2023
T-500.00
POnline Store
LElectronics:Computer
MNew laptop purchase
^
!Type:Cash
D06/01/2023
T-100.00
PGrocery Store
LFood:Groceries
^
!Type:Oth A
D06/15/2023
T5000.00
PEmployer
LIncome:Salary
^
!Type:Oth L
D07/01/2023
T-1000.00
PBank Loan
LLiabilities:Loans
^
!Type:Prices
"AAPL",150.25,"01/15/2023"
"MSFT",300.50,"01/20/2023"
"GOOG",2500.00,"02/01/2023"
^
!Type:Security
NAPL
SApple Inc.
TStock
GGrowth
^
!Type:Cat
NTechnology
DInvestments in tech companies
T
I
B1000.00
R1
^
!Type:Class
NPersonal
DPersonal expenses
^
!Type:Memorized
KP
T-50.00
PMonthly Subscription
MNetflix subscription
^
!Type:Payee
NOnline Store
AWeb Shop
AInternet Retailer
^
!Type:Tag
N2023 Investments
DTracking investments made in 2023
C#FF0000
^
`

tap.test('QIF Parser Comprehensive Test', async t => {
    const result = parseQifData(sampleQifData)

    t.test('Account parsing', t => {
        t.equal(result.accounts.length, 1, 'Should parse one account')
        t.equal(result.accounts[0].name, 'Brokerage Account', 'Should correctly parse account name')
        t.equal(result.accounts[0].type, 'Investment', 'Should correctly parse account type')
        t.equal(result.accounts[0].description, 'Main investment account', 'Should parse account description')
        t.equal(result.accounts[0].creditLimit, 10000, 'Should parse credit limit or balance')
        t.end()
    })

    t.test('Investment transaction parsing', t => {
        t.equal(result.investmentTransactions.length, 8, 'Should parse eight investment transactions')

        const {
            amount,
            category,
            cleared,
            commission,
            date,
            memo,
            number,
            price,
            quantity,
            security,
            transactionType,
        } = result.investmentTransactions[0]
        t.same(date, new Date('01/15/2023'), 'Should parse date correctly')
        t.equal(transactionType, 'Buy', 'Should identify transaction type as Buy')
        t.equal(security, 'APL', 'Should parse security symbol')
        t.equal(price, 150.25, 'Should parse price correctly')
        t.equal(quantity, 10, 'Should parse quantity correctly')
        t.equal(amount, -1502.5, 'Should calculate total amount correctly (negative = cash outflow)')
        t.equal(cleared, 'X', 'Should parse cleared status')
        t.equal(number, '123', 'Should parse transaction number')
        t.equal(category, '[Brokerage Account]', 'Should parse category/transfer account')
        t.equal(memo, 'Bought 10 shares of Apple Inc.', 'Should parse memo correctly')
        t.equal(commission, 14.99, 'Should parse commission')

        const sell = result.investmentTransactions[1]
        t.equal(sell.transactionType, 'Sell', 'Should identify transaction type as Sell')

        // t.equal(sellTransaction.splits.length, 2, 'Should parse two splits for sell transaction')
        // t.equal(sellTransaction.splits[0].amount, 1000.0, 'Should parse first split amount')
        // t.equal(sellTransaction.splits[1].amount, 502.5, 'Should parse second split amount')

        const shareInTransaction = result.investmentTransactions[2]
        t.equal(shareInTransaction.transactionType, 'ShrsIn', 'Should identify transaction type as ShrsIn')

        const reinvestDividendTransaction = result.investmentTransactions[3]
        t.equal(reinvestDividendTransaction.transactionType, 'ReinvDiv', 'Should identify transaction type as ReinvDiv')

        const spinoffTransaction = result.investmentTransactions[4]
        t.equal(spinoffTransaction.transactionType, 'XIn', 'Should identify transaction type as XIn for spinoff')

        const shortSellTransaction = result.investmentTransactions[5]
        t.equal(shortSellTransaction.transactionType, 'ShtSell', 'Should identify transaction type as ShtSell')

        const marginInterestTransaction = result.investmentTransactions[6]
        t.equal(marginInterestTransaction.transactionType, 'MargInt', 'Should identify transaction type as MargInt')

        const capitalGainsTransaction = result.investmentTransactions[7]
        t.equal(capitalGainsTransaction.transactionType, 'CGLong', 'Should identify transaction type as CGLong')

        t.end()
    })

    t.test('Bank transaction parsing', t => {
        t.equal(result.bankTransactions.length, 5, 'Should parse five non-investment transactions')

        const { amount, number, payee } = result.bankTransactions[0]
        t.equal(amount, -1000.0, 'Should parse amount correctly')
        t.equal(payee, 'Check 101', 'Should parse payee correctly')
        t.equal(number, '101', 'Should parse check number correctly')
        t.end()
    })

    t.test('Credit Card transaction parsing', t => {
        const transaction = result.bankTransactions[1]
        t.equal(transaction.transactionType, 'Credit Card', 'Should identify transaction type as Cash')
        t.equal(transaction.category, 'Electronics:Computer', 'Should parse category with subcategory')
        t.end()
    })

    t.test('Cash transaction parsing', t => {
        const transaction = result.bankTransactions[2]
        t.equal(transaction.transactionType, 'Cash', 'Should identify transaction type as Cash')
        t.end()
    })

    t.test('Other Asset transaction parsing', t => {
        const transaction = result.bankTransactions[3]
        t.equal(transaction.transactionType, 'Other Asset', 'Should identify transaction type as Other Asset')
        t.end()
    })

    t.test('Other Liability transaction parsing', t => {
        const transaction = result.bankTransactions[4]
        t.equal(transaction.transactionType, 'Other Liability', 'Should identify transaction type as Other Liability')
        t.end()
    })

    t.test('Price parsing', t => {
        t.equal(result.prices.length, 3, 'Should parse three price entries')

        t.equal(result.prices[0].symbol, 'AAPL', 'Should parse symbol correctly')
        t.equal(result.prices[0].price, 150.25, 'Should parse price correctly')
        t.same(result.prices[0].date, new Date('01/15/2023'), 'Should parse date correctly')
        t.end()
    })

    t.test('Security parsing', t => {
        t.equal(result.securities.length, 1, 'Should parse one security')
        t.equal(result.securities[0].name, 'APL', 'Should parse security name correctly')
        t.equal(result.securities[0].symbol, 'Apple Inc.', 'Should parse security symbol correctly')
        t.equal(result.securities[0].type, 'Stock', 'Should parse security type correctly')
        t.equal(result.securities[0].goal, 'Growth', 'Should parse security goal correctly')
        t.end()
    })

    t.test('Category parsing', t => {
        t.equal(result.categories.length, 1, 'Should parse one category')
        t.equal(result.categories[0].name, 'Technology', 'Should parse category name correctly')
        t.equal(
            result.categories[0].description,
            'Investments in tech companies',
            'Should parse category description correctly',
        )
        t.equal(result.categories[0].isTaxRelated, true, 'Should parse tax-related flag correctly')
        t.equal(result.categories[0].isIncomeCategory, true, 'Should parse income category flag correctly')
        t.equal(result.categories[0].budgetAmount, 1000.0, 'Should parse budget amount correctly')
        t.equal(result.categories[0].taxSchedule, '1', 'Should parse tax schedule information correctly')
        t.end()
    })

    t.test('Class parsing', t => {
        t.equal(result.classes.length, 1, 'Should parse one class')
        t.equal(result.classes[0].name, 'Personal', 'Should parse class name correctly')
        t.equal(result.classes[0].description, 'Personal expenses', 'Should parse class description correctly')
        t.end()
    })

    t.test('Payee parsing', t => {
        t.equal(result.payees.length, 1, 'Should parse one payee')
        t.equal(result.payees[0].name, 'Online Store', 'Should parse payee name correctly')
        t.same(result.payees[0].address, ['Web Shop', 'Internet Retailer'], 'Should parse payee address correctly')
        t.end()
    })

    t.test('Tag parsing', t => {
        t.equal(result.tags.length, 1, 'Should parse one tag')
        t.equal(result.tags[0].name, '2023 Investments', 'Should parse tag name correctly')
        t.equal(
            result.tags[0].description,
            'Tracking investments made in 2023',
            'Should parse tag description correctly',
        )
        t.equal(result.tags[0].color, '#FF0000', 'Should parse tag color correctly')
        t.end()
    })

    t.end()
})

// Adding edge case tests to improve coverage
tap.test('QIF Parser Edge Cases', async t => {
    const edgeCaseQifData = `!Type:Invst
D07/01/2023
NMiscInc
T100.00
MUnclassified income
^
!Account
NBrokerage Account
TInvst
^
TInvst
!Type:Invst
D07/02/2023
NMiscExp
T-50.00
MUnclassified expense
^
!Type:Cat
NUnknownCategory
XUnknown Field
^
!Type:Class
NUnknownClass
YUnknown Field
^
!Type:Tag
NUnknownTag
ZUnknown Field
^
!Type:Payee
NUnknownPayee
BUnknown Field
^
!Type:Security
NUnknownSecurity
RUnknown Field
^
!Type:Prices
"UNKNOWN",100.00,"07/03/2023"
^
`

    const result = parseQifData(edgeCaseQifData)

    t.test('Edge case investment transaction parsing', t => {
        t.equal(result.investmentTransactions.length, 2, 'Should parse two edge case investment transactions')
        t.equal(
            result.investmentTransactions[0].transactionType,
            'MiscInc',
            'Should parse miscellaneous income transaction',
        )
        t.equal(
            result.investmentTransactions[1].transactionType,
            'MiscExp',
            'Should parse miscellaneous expense transaction',
        )
        t.end()
    })

    t.test('Edge case category parsing', t => {
        t.equal(result.categories.length, 1, 'Should parse one edge case category')
        t.equal(result.categories[0].name, 'UnknownCategory', 'Should parse category name')

        // t.equal(result.categories[0].X, 'Unknown Field', 'Should store unknown field')
        t.end()
    })

    t.test('Edge case class parsing', t => {
        t.equal(result.classes.length, 1, 'Should parse one edge case class')
        t.equal(result.classes[0].name, 'UnknownClass', 'Should parse class name')

        // t.equal(result.classes[0].Y, 'Unknown Field', 'Should store unknown field')
        t.end()
    })

    t.test('Edge case tag parsing', t => {
        t.equal(result.tags.length, 1, 'Should parse one edge case tag')
        t.equal(result.tags[0].name, 'UnknownTag', 'Should parse tag name')

        // t.equal(result.tags[0].Z, 'Unknown Field', 'Should store unknown field')
        t.end()
    })

    t.test('Edge case payee parsing', t => {
        t.equal(result.payees.length, 1, 'Should parse one edge case payee')
        t.equal(result.payees[0].name, 'UnknownPayee', 'Should parse payee name')

        // t.equal(result.payees[0].B, 'Unknown Field', 'Should store unknown field')
        t.end()
    })

    t.test('Edge case security parsing', t => {
        t.equal(result.securities.length, 1, 'Should parse one edge case security')
        t.equal(result.securities[0].name, 'UnknownSecurity', 'Should parse security name')

        // t.equal(result.securities[0].R, 'Unknown Field', 'Should store unknown field')
        t.end()
    })

    t.test('Edge case price parsing', t => {
        t.equal(result.prices.length, 1, 'Should parse one edge case price')
        t.equal(result.prices[0].symbol, 'UNKNOWN', 'Should parse unknown symbol')
        t.equal(result.prices[0].price, 100.0, 'Should parse price correctly')
        t.same(result.prices[0].date, new Date('07/03/2023'), 'Should parse date correctly')
        t.end()
    })

    t.end()
})

export default tap
