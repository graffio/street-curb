// ABOUTME: Pre-compiles an IRFilter boolean tree into an entity => Boolean predicate
// ABOUTME: In values become Sets, Matches patterns become RegExps — compiled once, evaluated per entity

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Compile a Matches pattern into a RegExp, throwing on invalid syntax
    // @sig toRegex :: String -> RegExp
    toRegex: pattern => {
        try {
            return new RegExp(pattern, 'i')
        } catch (e) {
            throw new Error(`Invalid regex pattern '${pattern}': ${e.message}`)
        }
    },

    // Compile combinator children into an array of predicate functions
    // @sig toChildPredicates :: ([IRFilter], Number) -> [(Object -> Boolean)]
    toChildPredicates: (filters, depth) => {
        if (filters.length === 0) throw new Error('IRFilter combinator cannot have empty filters array')
        return filters.map(child => T.toCompiledPredicate(child, depth + 1))
    },

    // Compile a leaf or combinator IRFilter node into a predicate function at a given depth
    // @sig toCompiledPredicate :: (IRFilter, Number) -> (Object -> Boolean)
    toCompiledPredicate: (node, depth) => {
        if (depth > MAX_FILTER_DEPTH) throw new Error(`IRFilter tree exceeds maximum depth of ${MAX_FILTER_DEPTH}`)

        // prettier-ignore
        return node.match({
            Equals     : ({ field, value })     => entity => entity[field] === value,
            OlderThan  : ({ field, days })      => entity => entity[field] > days,
            GreaterThan: ({ field, value })     => entity => entity[field] > value,
            LessThan   : ({ field, value })     => entity => entity[field] < value,
            Between    : ({ field, low, high }) => entity => entity[field] >= low && entity[field] <= high,
            In         : ({ field, values })    => entity => new Set(values).has(entity[field]),
            Matches    : ({ field, pattern })   => entity => T.toRegex(pattern).test(entity[field]),
            And        : ({ filters })          => entity => T.toChildPredicates(filters, depth).every(f => f(entity)),
            Or         : ({ filters })          => entity => T.toChildPredicates(filters, depth).some(f => f(entity)),
            Not        : ({ filter })           => entity => !T.toCompiledPredicate(filter, depth + 1)(entity),
        })
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const MAX_FILTER_DEPTH = 20

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Compile an IRFilter tree into a predicate function (entity => Boolean)
// Pre-compiles Set for In, RegExp for Matches — call once, apply to many entities
// @sig buildFilterPredicate :: IRFilter -> (Object -> Boolean)
const buildFilterPredicate = rootFilter => T.toCompiledPredicate(rootFilter, 0)

export { buildFilterPredicate }
