// Simple mapping: source file -> array of target directories
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const REPO_ROOT = resolve(__dirname, '../..')

// prettier-ignore
const sources = {
    curbMap        : `${REPO_ROOT}/modules/curb-map/type-definitions`,
    typesGeneration: `${REPO_ROOT}/modules/cli-type-generator/type-definitions`
}

// prettier-ignore
const targets = {
    curbMap        : `${REPO_ROOT}/modules/curb-map/src/types`,
    typesGeneration: `${REPO_ROOT}/modules/cli-type-generator/src/types`
}

// prettier-ignore
export const typeMappings = {
    // curb-map
    [`${sources.curbMap}/action.type.js`]                 : [targets.curbMap],
    [`${sources.curbMap}/audit-record.type.js`]           : [targets.curbMap],
    [`${sources.curbMap}/blockface.type.js`]              : [targets.curbMap],
    [`${sources.curbMap}/operation-details.type.js`]      : [targets.curbMap],
    [`${sources.curbMap}/segment.type.js`]                : [targets.curbMap],
    [`${sources.curbMap}/queue-item.type.js`]             : [targets.curbMap],
    
   
    // special case: source is just copied verbatim to target
    [`${sources.curbMap}/field-types.js`]                 : [targets.curbMap],
    
    // for the cli-type-generator itself (all internal types)
    [`${sources.typesGeneration}/field-type.type.js`]     : [targets.typesGeneration],
    [`${sources.typesGeneration}/function-info.type.js`]  : [targets.typesGeneration],
    [`${sources.typesGeneration}/import-info.type.js`]    : [targets.typesGeneration],
    [`${sources.typesGeneration}/parse-result.type.js`]   : [targets.typesGeneration],
    [`${sources.typesGeneration}/type-definition.type.js`]: [targets.typesGeneration],
}
