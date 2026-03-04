// ABOUTME: MetricDefinition type for named metric computations
// ABOUTME: Hand-written (not generated) because compute field is a Function, which the type generator can't validate

// @sig MetricDefinition :: (String, Function, String) -> MetricDefinition
const MetricDefinition = (name, compute, level) => {
    if (typeof name !== 'string') throw new Error(`MetricDefinition: name must be String, got ${typeof name}`)
    if (typeof compute !== 'function')
        throw new Error(`MetricDefinition: compute must be Function, got ${typeof compute}`)
    if (!/^(position|aggregate)$/.test(level))
        throw new Error(`MetricDefinition: level must be position|aggregate, got ${level}`)
    return Object.freeze({ '@@typeName': 'MetricDefinition', name, compute, level })
}

MetricDefinition.is = v => v && v['@@typeName'] === 'MetricDefinition'
MetricDefinition.from = ({ name, compute, level }) => MetricDefinition(name, compute, level)

export { MetricDefinition }
