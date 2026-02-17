// ABOUTME: Maps type definition files to their output directories
// ABOUTME: Used by type generator to know where to write generated types

// Simple mapping: source file -> array of target directories
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const REPO_ROOT = resolve(__dirname, '../..')

// prettier-ignore
const sources = {
    ast                     : `${REPO_ROOT}/modules/ast/type-definitions`,
    cliStyleValidator       : `${REPO_ROOT}/modules/cli-style-validator/type-definitions`,
    curbMap                 : `${REPO_ROOT}/modules/curb-map/type-definitions`,
    cliQifToSqlite          : `${REPO_ROOT}/modules/cli-qif-to-sqlite/type-definitions`,
    functional              : `${REPO_ROOT}/modules/functional/type-definitions`,
    quickenTypes            : `${REPO_ROOT}/modules/quicken-type-definitions`,
    quickenWebApp           : `${REPO_ROOT}/modules/quicken-web-app/type-definitions`,
    typesGeneration         : `${REPO_ROOT}/modules/cli-type-generator/type-definitions`
}

// prettier-ignore
const targets = {
    ast                     : `${REPO_ROOT}/modules/ast/src/types`,
    cliStyleValidator       : `${REPO_ROOT}/modules/cli-style-validator/src/types`,
    curbMap                 : `${REPO_ROOT}/modules/curb-map/src/types`,
    cliQifToSqlite          : `${REPO_ROOT}/modules/cli-qif-to-sqlite/src/types`,
    functional           : `${REPO_ROOT}/modules/functional/src/types`,
    quickenWebApp        : `${REPO_ROOT}/modules/quicken-web-app/src/types`,
    typesGeneration      : `${REPO_ROOT}/modules/cli-type-generator/src/types`
}

// Shorthand aliases for common multi-target combinations
const t = targets
const qifAndWeb = [t.quickenWebApp]

// prettier-ignore
export const typeMappings = {
    // ast
    [`${sources.ast}/ast-node.type.js`]                       : [targets.ast],

    // cli-style-validator
    [`${sources.cliStyleValidator}/named-location.type.js`]   : [targets.cliStyleValidator],
    [`${sources.cliStyleValidator}/function-info.type.js`]    : [targets.cliStyleValidator],
    [`${sources.cliStyleValidator}/violation.type.js`]        : [targets.cliStyleValidator],

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



    // functional
    [`${sources.functional}/filter-spec.type.js`]         : [targets.functional],


    // quicken shared domain types (from quicken-type-definitions)
    [`${sources.quickenTypes}/account.type.js`]           : qifAndWeb,
    [`${sources.quickenTypes}/category.type.js`]          : qifAndWeb,
    [`${sources.quickenTypes}/holding.type.js`]           : qifAndWeb,
    [`${sources.quickenTypes}/lot.type.js`]               : qifAndWeb,
    [`${sources.quickenTypes}/lot-allocation.type.js`]    : qifAndWeb,
    [`${sources.quickenTypes}/price.type.js`]             : qifAndWeb,
    [`${sources.quickenTypes}/security.type.js`]          : qifAndWeb,
    [`${sources.quickenTypes}/split.type.js`]             : qifAndWeb,
    [`${sources.quickenTypes}/tag.type.js`]               : qifAndWeb,
    [`${sources.quickenTypes}/transaction.type.js`]       : qifAndWeb,

    // cli-qif-to-sqlite
    [`${sources.cliQifToSqlite}/qif-entry.type.js`]       : [targets.cliQifToSqlite],
    [`${sources.cliQifToSqlite}/qif-split.type.js`]       : [targets.cliQifToSqlite],
    [`${sources.cliQifToSqlite}/import-issue.type.js`]     : [targets.cliQifToSqlite],

    // quicken-web-app (types must come before Action since Action references them)
    [`${sources.quickenWebApp}/field-types.js`]          : [targets.quickenWebApp],
    [`${sources.quickenWebApp}/column-descriptor.type.js`]: [targets.quickenWebApp],
    [`${sources.quickenWebApp}/sort-order.type.js`]      : [targets.quickenWebApp],
    [`${sources.quickenWebApp}/table-layout.type.js`]    : [targets.quickenWebApp],
    [`${sources.quickenWebApp}/view.type.js`]            : [targets.quickenWebApp],
    [`${sources.quickenWebApp}/tab-group.type.js`]       : [targets.quickenWebApp],
    [`${sources.quickenWebApp}/tab-layout.type.js`]      : [targets.quickenWebApp],
    [`${sources.quickenWebApp}/transaction-filter.type.js`]: [targets.quickenWebApp],
    [`${sources.quickenWebApp}/view-ui-state.type.js`]   : [targets.quickenWebApp],
    [`${sources.quickenWebApp}/sort-mode.type.js`]       : [targets.quickenWebApp],
    [`${sources.quickenWebApp}/enriched-account.type.js`]: [targets.quickenWebApp],
    [`${sources.quickenWebApp}/account-section.type.js`] : [targets.quickenWebApp],
    [`${sources.quickenWebApp}/holdings-aggregate.type.js`]: [targets.quickenWebApp],
    [`${sources.quickenWebApp}/holdings-tree-node.type.js`]: [targets.quickenWebApp],
    [`${sources.quickenWebApp}/register-row.type.js`]    : [targets.quickenWebApp],
    [`${sources.quickenWebApp}/action.type.js`]          : [targets.quickenWebApp],


    // for the cli-type-generator itself (all internal types)
    [`${sources.typesGeneration}/field-types.js`]          : [targets.typesGeneration],
    [`${sources.typesGeneration}/field-type.type.js`]      : [targets.typesGeneration],
    [`${sources.typesGeneration}/function-info.type.js`]   : [targets.typesGeneration],
    [`${sources.typesGeneration}/import-info.type.js`]     : [targets.typesGeneration],
    [`${sources.typesGeneration}/import-specifier.type.js`]: [targets.typesGeneration],
    [`${sources.typesGeneration}/parse-result.type.js`]    : [targets.typesGeneration],
    [`${sources.typesGeneration}/type-definition.type.js`] : [targets.typesGeneration],
}
