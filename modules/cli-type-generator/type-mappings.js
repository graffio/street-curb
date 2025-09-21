// Simple mapping: source file -> array of target directories

const curbMap = 'modules/curb-map'
const typesGeneration = 'modules/cli-type-generator'

// prettier-ignore
export const typeMappings = {
    // curb-map
    [`${curbMap}/type-definitions/blockface.type.js`]              : [`${curbMap}/src/types`],
    [`${curbMap}/type-definitions/segment.type.js`]                : [`${curbMap}/src/types`],
    [`${curbMap}/type-definitions/audit-record.type.js`]           : [`${curbMap}/src/types`],
    [`${curbMap}/type-definitions/operation-details.type.js`]      : [`${curbMap}/src/types`],
    
    // for the cli-type-generator itself (all internal types)
    [`${typesGeneration}/type-definitions/field-type.type.js`]     : [`${typesGeneration}/src/types`],
    [`${typesGeneration}/type-definitions/import-info.type.js`]    : [`${typesGeneration}/src/types`],
    [`${typesGeneration}/type-definitions/parse-result.type.js`]   : [`${typesGeneration}/src/types`],
    [`${typesGeneration}/type-definitions/type-definition.type.js`]: [`${typesGeneration}/src/types`],
    [`${typesGeneration}/type-definitions/function-info.type.js`]  : [`${typesGeneration}/src/types`],
}
