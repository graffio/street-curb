// Auto-generated static tagged sum type: TestTransaction
// Generated from: test/fixtures/TestTransaction.type.js
// fields from: { Bank: { id: "Number", amount: "Number" }, Investment: { id: "Number", securityId: "Number?" }}

import * as R from 'modules/cli-type-generator/index.js'

// -------------------------------------------------------------------------------------------------------------
//
// TestTransaction constructor
//
// -------------------------------------------------------------------------------------------------------------
const TestTransaction = {
    '@@typeName': 'TestTransaction',
    '@@tagNames': ['Bank', 'Investment'],
    toString: () => 'TestTransaction',
    is: v => {
        if (typeof v !== 'object') return false
        const constructor = Object.getPrototypeOf(v).constructor
        return constructor === TestTransaction.Bank || constructor === TestTransaction.Investment
    },
}

// -------------------------------------------------------------------------------------------------------------
//
// Set up TestTransaction's prototype as TestTransactionPrototype
//
// -------------------------------------------------------------------------------------------------------------
// Type prototype with match method
const TestTransactionPrototype = {
    match(variants) {
        // Validate all variants are handled
        const requiredVariants = ['Bank', 'Investment']
        requiredVariants.map(variant => {
            if (!variants[variant]) throw new TypeError("Constructors given to match didn't include: " + variant)
            return variant
        })

        const variant = variants[this['@@tagName']]
        return variant.call(variants, this)
    },
}

// Add hidden properties
Object.defineProperty(TestTransaction, '@@typeName', { value: 'TestTransaction' })
Object.defineProperty(TestTransaction, '@@tagNames', { value: ['Bank', 'Investment'] })

TestTransactionPrototype.constructor = TestTransaction
TestTransaction.prototype = TestTransactionPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant TestTransaction.Bank constructor
//
// -------------------------------------------------------------------------------------------------------------
const BankConstructor = function Bank(id, amount) {
    R.validateArgumentLength('TestTransaction.Bank(id, amount)', 2, arguments)
    R.validateNumber('TestTransaction.Bank(id, amount)', 'id', false, id)
    R.validateNumber('TestTransaction.Bank(id, amount)', 'amount', false, amount)

    const result = Object.create(BankPrototype)
    result.id = id
    result.amount = amount
    return result
}

TestTransaction.Bank = BankConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant TestTransaction.Bank prototype
//
// -------------------------------------------------------------------------------------------------------------
const BankPrototype = Object.create(TestTransactionPrototype)
Object.defineProperty(BankPrototype, '@@tagName', { value: 'Bank' })
Object.defineProperty(BankPrototype, '@@typeName', { value: 'TestTransaction' })

BankPrototype.toString = function () {
    return `TestTransaction.Bank(${R._toString(this.id)}, ${R._toString(this.amount)})`
}

BankPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

BankConstructor.prototype = BankPrototype
BankPrototype.constructor = BankConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant TestTransaction.Bank: static functions:
//
// -------------------------------------------------------------------------------------------------------------
BankConstructor.is = val => val && val.constructor === BankConstructor
BankConstructor.toString = () => 'TestTransaction.Bank'
BankConstructor.from = o => TestTransaction.Bank(o.id, o.amount)

// -------------------------------------------------------------------------------------------------------------
//
// Variant TestTransaction.Investment constructor
//
// -------------------------------------------------------------------------------------------------------------
const InvestmentConstructor = function Investment(id, securityId) {
    R.validateNumber('TestTransaction.Investment(id, securityId)', 'id', false, id)
    R.validateNumber('TestTransaction.Investment(id, securityId)', 'securityId', true, securityId)

    const result = Object.create(InvestmentPrototype)
    result.id = id
    if (securityId != null) result.securityId = securityId
    return result
}

TestTransaction.Investment = InvestmentConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant TestTransaction.Investment prototype
//
// -------------------------------------------------------------------------------------------------------------
const InvestmentPrototype = Object.create(TestTransactionPrototype)
Object.defineProperty(InvestmentPrototype, '@@tagName', { value: 'Investment' })
Object.defineProperty(InvestmentPrototype, '@@typeName', { value: 'TestTransaction' })

InvestmentPrototype.toString = function () {
    return `TestTransaction.Investment(${R._toString(this.id)}, ${R._toString(this.securityId)})`
}

InvestmentPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

InvestmentConstructor.prototype = InvestmentPrototype
InvestmentPrototype.constructor = InvestmentConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant TestTransaction.Investment: static functions:
//
// -------------------------------------------------------------------------------------------------------------
InvestmentConstructor.is = val => val && val.constructor === InvestmentConstructor
InvestmentConstructor.toString = () => 'TestTransaction.Investment'
InvestmentConstructor.from = o => TestTransaction.Investment(o.id, o.securityId)

export { TestTransaction }
