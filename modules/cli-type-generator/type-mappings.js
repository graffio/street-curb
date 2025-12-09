// Simple mapping: source file -> array of target directories
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const REPO_ROOT = resolve(__dirname, '../..')

// prettier-ignore
const sources = {
    curbMap        : `${REPO_ROOT}/modules/curb-map/type-definitions`,
    cliQifToSqlite : `${REPO_ROOT}/modules/cli-qif-to-sqlite/type-definitions`,
    quickenWebApp  : `${REPO_ROOT}/modules/quicken-web-app/type-definitions`,
    typesGeneration: `${REPO_ROOT}/modules/cli-type-generator/type-definitions`
}

// prettier-ignore
const targets = {
    curbMap        : `${REPO_ROOT}/modules/curb-map/src/types`,
    cliQifToSqlite : `${REPO_ROOT}/modules/cli-qif-to-sqlite/src/types`,
    quickenWebApp  : `${REPO_ROOT}/modules/quicken-web-app/src/types`,
    typesGeneration: `${REPO_ROOT}/modules/cli-type-generator/src/types`
}

// prettier-ignore
export const typeMappings = {
    // curb-map infrastructure
    [`${sources.curbMap}/action.type.js`]                 : [targets.curbMap],
    [`${sources.curbMap}/action-request.type.js`]         : [targets.curbMap],
    [`${sources.curbMap}/audit-record.type.js`]           : [targets.curbMap],
    [`${sources.curbMap}/operation-details.type.js`]      : [targets.curbMap],
    
    // curb-map domain
    [`${sources.curbMap}/blockface.type.js`]              : [targets.curbMap],
    [`${sources.curbMap}/member.type.js`]                 : [targets.curbMap],
    [`${sources.curbMap}/organization.type.js`]           : [targets.curbMap],
    [`${sources.curbMap}/organization-member.type.js`]    : [targets.curbMap],
    [`${sources.curbMap}/project.type.js`]                : [targets.curbMap],
    [`${sources.curbMap}/segment.type.js`]                : [targets.curbMap],
    [`${sources.curbMap}/user.type.js`]                   : [targets.curbMap],
   
    // special case: source is just copied verbatim to target
    [`${sources.curbMap}/field-types.js`]                 : [targets.curbMap],
    
    
    // quicken-tools domain
    [`${sources.cliQifToSqlite}/account.type.js`]         : [targets.cliQifToSqlite],
    [`${sources.cliQifToSqlite}/category.type.js`]        : [targets.cliQifToSqlite],
    [`${sources.cliQifToSqlite}/daily-portfolio.type.js`] : [targets.cliQifToSqlite],
    [`${sources.cliQifToSqlite}/entry.type.js`]           : [targets.cliQifToSqlite],
    [`${sources.cliQifToSqlite}/holding.type.js`]         : [targets.cliQifToSqlite],
    [`${sources.cliQifToSqlite}/lot.type.js`]             : [targets.cliQifToSqlite],
    [`${sources.cliQifToSqlite}/price.type.js`]           : [targets.cliQifToSqlite],
    [`${sources.cliQifToSqlite}/security.type.js`]        : [targets.cliQifToSqlite],
    [`${sources.cliQifToSqlite}/split.type.js`]           : [targets.cliQifToSqlite],
    [`${sources.cliQifToSqlite}/tag.type.js`]             : [targets.cliQifToSqlite],
    [`${sources.cliQifToSqlite}/transaction.type.js`]     : [targets.cliQifToSqlite],


    // quicken-web-app
    [`${sources.quickenWebApp}/action.type.js`]          : [targets.quickenWebApp],


    // for the cli-type-generator itself (all internal types)
    [`${sources.typesGeneration}/field-type.type.js`]     : [targets.typesGeneration],
    [`${sources.typesGeneration}/function-info.type.js`]  : [targets.typesGeneration],
    [`${sources.typesGeneration}/import-info.type.js`]    : [targets.typesGeneration],
    [`${sources.typesGeneration}/parse-result.type.js`]   : [targets.typesGeneration],
    [`${sources.typesGeneration}/type-definition.type.js`]: [targets.typesGeneration],
}
