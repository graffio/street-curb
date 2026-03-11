// ABOUTME: Kahan compensated summation for float64 arrays
// ABOUTME: Eliminates accumulation drift that causes ~1 cent errors in financial sums

import { reduce } from '@graffio/functional'

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Kahan compensation step — recovers lost low-order bits from each addition.
 * @sig { sum: Number, compensation: Number } -> Number -> { sum: Number, compensation: Number }
 */
const T = {
    toNextAccumulation: ({ sum, compensation }, value) => {
        const adjusted = value - compensation
        const newSum = sum + adjusted
        return { sum: newSum, compensation: newSum - sum - adjusted }
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Sum an array of numbers using Kahan compensated summation.
 * Error stays O(ε) regardless of array length, vs O(n·ε) for naive addition.
 * @sig [Number] -> Number
 */
const sumCompensated = values => {
    const { sum } = reduce(T.toNextAccumulation, { sum: 0, compensation: 0 }, values)
    return sum
}

export { sumCompensated }
