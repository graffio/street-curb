/*  Result generated from: modules/curb-map/type-definitions/result.type.js
 *
 *  Success
 *      value  : "Object",
 *      status : /^(exists|created|updated)$/,
 *      message: "String"
 *  Failure
 *      originalError: "Object",
 *      message      : "String"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// Result constructor
//
// -------------------------------------------------------------------------------------------------------------
const Result = {
    toString: () => 'Result',
    is: v => {
        if (typeof v !== 'object') return false
        const constructor = Object.getPrototypeOf(v).constructor
        return constructor === Result.Success || constructor === Result.Failure
    },
}

// -------------------------------------------------------------------------------------------------------------
//
// Set up Result's prototype as ResultPrototype
//
// -------------------------------------------------------------------------------------------------------------
// Type prototype with match method
const ResultPrototype = {
    match(variants) {
        // Validate all variants are handled
        const requiredVariants = ['Success', 'Failure']
        requiredVariants.map(variant => {
            if (!variants[variant]) throw new TypeError("Constructors given to match didn't include: " + variant)
            return variant
        })

        const variant = variants[this['@@tagName']]
        return variant.call(variants, this)
    },
}

// Add hidden properties
Object.defineProperty(Result, '@@typeName', { value: 'Result' })
Object.defineProperty(Result, '@@tagNames', { value: ['Success', 'Failure'] })

ResultPrototype.constructor = Result
Result.prototype = ResultPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant Result.Success constructor
//
// -------------------------------------------------------------------------------------------------------------
const SuccessConstructor = function Success(value, status, message) {
    const constructorName = 'Result.Success(value, status, message)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateObject(constructorName, 'value', false, value)
    R.validateRegex(constructorName, /^(exists|created|updated)$/, 'status', false, status)
    R.validateString(constructorName, 'message', false, message)

    const result = Object.create(SuccessPrototype)
    result.value = value
    result.status = status
    result.message = message
    return result
}

Result.Success = SuccessConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Result.Success prototype
//
// -------------------------------------------------------------------------------------------------------------
const SuccessPrototype = Object.create(ResultPrototype)
Object.defineProperty(SuccessPrototype, '@@tagName', { value: 'Success' })
Object.defineProperty(SuccessPrototype, '@@typeName', { value: 'Result' })

SuccessPrototype.toString = function () {
    return `Result.Success(${R._toString(this.value)}, ${R._toString(this.status)}, ${R._toString(this.message)})`
}

SuccessPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

SuccessConstructor.prototype = SuccessPrototype
SuccessPrototype.constructor = SuccessConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Result.Success: static functions:
//
// -------------------------------------------------------------------------------------------------------------
SuccessConstructor.is = val => val && val.constructor === SuccessConstructor
SuccessConstructor.toString = () => 'Result.Success'
SuccessConstructor.from = o => Result.Success(o.value, o.status, o.message)

// -------------------------------------------------------------------------------------------------------------
//
// Variant Result.Failure constructor
//
// -------------------------------------------------------------------------------------------------------------
const FailureConstructor = function Failure(originalError, message) {
    const constructorName = 'Result.Failure(originalError, message)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateObject(constructorName, 'originalError', false, originalError)
    R.validateString(constructorName, 'message', false, message)

    const result = Object.create(FailurePrototype)
    result.originalError = originalError
    result.message = message
    return result
}

Result.Failure = FailureConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant Result.Failure prototype
//
// -------------------------------------------------------------------------------------------------------------
const FailurePrototype = Object.create(ResultPrototype)
Object.defineProperty(FailurePrototype, '@@tagName', { value: 'Failure' })
Object.defineProperty(FailurePrototype, '@@typeName', { value: 'Result' })

FailurePrototype.toString = function () {
    return `Result.Failure(${R._toString(this.originalError)}, ${R._toString(this.message)})`
}

FailurePrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

FailureConstructor.prototype = FailurePrototype
FailurePrototype.constructor = FailureConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant Result.Failure: static functions:
//
// -------------------------------------------------------------------------------------------------------------
FailureConstructor.is = val => val && val.constructor === FailureConstructor
FailureConstructor.toString = () => 'Result.Failure'
FailureConstructor.from = o => Result.Failure(o.originalError, o.message)

export { Result }
