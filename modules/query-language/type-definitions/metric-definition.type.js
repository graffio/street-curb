// ABOUTME: MetricDefinition type for named metric computations
// ABOUTME: Represents a named metric with a string reference to a compute function and position/aggregate level

import { FieldTypes } from './field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export const MetricDefinition = {
    name: 'MetricDefinition',
    kind: 'tagged',
    fields: { name: 'String', compute: 'String', level: FieldTypes.metricLevel },
}
