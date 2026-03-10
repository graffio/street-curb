// ABOUTME: MetricDefinition type for named metric computations
// ABOUTME: Represents a named metric with a compute function and position/aggregate level

import { FieldTypes } from './field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export const MetricDefinition = {
    name: 'MetricDefinition',
    kind: 'tagged',
    fields: {
        name: 'String',
        compute: 'Any', // it's not an object, it's a function, I promise not to serialize it
        level: FieldTypes.metricLevel,
    },
}
