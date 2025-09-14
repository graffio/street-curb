// Simple mapping: source file -> array of target directories

const curbMap = 'modules/curb-map'
const orchestration = 'modules/orchestration'
const types = 'modules/types'
const typesGeneration = 'modules/types-generation'

// prettier-ignore
export const typeMappings = {
    // curb-map
    [`${curbMap}/types/blockface.type.js`]                  : [`${curbMap}/editor/src/types`],
    [`${curbMap}/types/segment.type.js`]                    : [`${curbMap}/editor/src/types`],
    
    // types
    [`${types}/src/audit-record.type.js`]                   : [`${curbMap}/editor/src/types`, `${orchestration}/src/types`],
    [`${types}/src/operation-details.type.js`]              : [`${curbMap}/editor/src/types`, `${orchestration}/src/types`],

    // types-generation (all internal types)
    [`${typesGeneration}/src/types/field-type.type.js`]     : [`${typesGeneration}/src/generated`],
    [`${typesGeneration}/src/types/import-info.type.js`]    : [`${typesGeneration}/src/generated`],
    [`${typesGeneration}/src/types/parse-result.type.js`]   : [`${typesGeneration}/src/generated`],
    [`${typesGeneration}/src/types/type-definition.type.js`]: [`${typesGeneration}/src/generated`],
    [`${typesGeneration}/src/types/function-info.type.js`]  : [`${typesGeneration}/src/generated`],
}
