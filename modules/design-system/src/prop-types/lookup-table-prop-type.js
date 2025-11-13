// ABOUTME: PropTypes validator for LookupTable type
// ABOUTME: Validates that a prop is a LookupTable instance from @graffio/functional

import { LookupTable } from '@graffio/functional'

/**
 * PropTypes validator for LookupTable
 * @sig lookupTable :: (Props, String, String) -> Error?
 */
const lookupTablePropType = (props, propName, componentName) => {
    const message = () =>
        `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Expected a LookupTable, but received ${typeof value}.`

    // Allow null/undefined if not required; otherwise check it's a LookupTable
    const value = props[propName]
    return value == null || LookupTable.is(value) ? null : new Error(message())
}

/**
 * Create a validator for LookupTable of specific type
 * @sig lookupTable.of :: TaggedType -> PropTypesValidator
 */
lookupTablePropType.of = ExpectedType => {
    const validator = (props, propName, componentName) => {
        const value = props[propName]
        if (value == null) return null // optional value can be missing

        // First check it's a LookupTable
        const basicError = lookupTablePropType(props, propName, componentName)
        if (basicError) return basicError

        // Then check ItemType matches
        if (value.ItemType !== ExpectedType)
            return new Error(
                `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Expected LookupTable<${ExpectedType.toString()}>, but received LookupTable<${value.ItemType?.toString() || 'unknown'}>.`,
            )

        return null
    }

    validator.isRequired = (props, propName, componentName) => {
        if (props[propName] == null)
            return new Error(`Required prop \`${propName}\` was not supplied to \`${componentName}\`.`)
        return validator(props, propName, componentName)
    }

    return validator
}

/**
 * Required LookupTable validator
 */
lookupTablePropType.isRequired = (props, propName, componentName) =>
    props[propName] == null
        ? new Error(`Required prop \`${propName}\` was not supplied to \`${componentName}\`.`)
        : lookupTablePropType(props, propName, componentName)

export { lookupTablePropType }
