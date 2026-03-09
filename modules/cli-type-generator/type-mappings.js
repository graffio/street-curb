// ABOUTME: Maps type definition files to their output directories
// ABOUTME: Used by type generator to know where to write generated types

// Simple mapping: source file -> array of target directories

import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const REPO_ROOT = resolve(__dirname, '../..')

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const sources = {
    ast                     : `${REPO_ROOT}/modules/ast/type-definitions`,
    cliStyleValidator       : `${REPO_ROOT}/modules/cli-style-validator/type-definitions`,
    curbMap                 : `${REPO_ROOT}/modules/curb-map/type-definitions`,
    cliQifToSqlite          : `${REPO_ROOT}/modules/cli-qif-to-sqlite/type-definitions`,
    functional              : `${REPO_ROOT}/modules/functional/type-definitions`,
    quickenWebApp           : `${REPO_ROOT}/modules/quicken-web-app/type-definitions`,
    quickenEntities         : `${REPO_ROOT}/modules/quicken-web-app/type-definitions/entities`,
    quickenDerived          : `${REPO_ROOT}/modules/quicken-web-app/type-definitions/derived`,
    quickenUiState          : `${REPO_ROOT}/modules/quicken-web-app/type-definitions/ui-state`,
    quickenWebAppIR         : `${REPO_ROOT}/modules/quicken-web-app/type-definitions/ir`,
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
    queryLanguage        : `${REPO_ROOT}/modules/quicken-web-app/src/query-language/types`,
    typesGeneration      : `${REPO_ROOT}/modules/cli-type-generator/src/types`
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

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


    // cli-qif-to-sqlite
    [`${sources.cliQifToSqlite}/qif-entry.type.js`]       : [targets.cliQifToSqlite],
    [`${sources.cliQifToSqlite}/qif-split.type.js`]       : [targets.cliQifToSqlite],
    [`${sources.cliQifToSqlite}/import-issue.type.js`]     : [targets.cliQifToSqlite],

    // quicken-web-app — field-types must come before all other types
    [`${sources.quickenWebApp}/field-types.js`]               : [targets.quickenWebApp, targets.queryLanguage],

    // entities — domain concepts (account, transaction, etc.)
    [`${sources.quickenEntities}/account.type.js`]            : [targets.quickenWebApp],
    [`${sources.quickenEntities}/transaction.type.js`]        : [targets.quickenWebApp],
    [`${sources.quickenEntities}/split.type.js`]              : [targets.quickenWebApp],
    [`${sources.quickenEntities}/category.type.js`]           : [targets.quickenWebApp],
    [`${sources.quickenEntities}/tag.type.js`]                : [targets.quickenWebApp],
    [`${sources.quickenEntities}/security.type.js`]           : [targets.quickenWebApp],
    [`${sources.quickenEntities}/price.type.js`]              : [targets.quickenWebApp],
    [`${sources.quickenEntities}/lot.type.js`]                : [targets.quickenWebApp],
    [`${sources.quickenEntities}/lot-allocation.type.js`]     : [targets.quickenWebApp],
    [`${sources.quickenEntities}/position.type.js`]           : [targets.quickenWebApp],

    // derived — computed types for display and type safety
    [`${sources.quickenDerived}/enriched-account.type.js`]    : [targets.quickenWebApp],
    [`${sources.quickenDerived}/account-section.type.js`]     : [targets.quickenWebApp],
    [`${sources.quickenDerived}/position-aggregate.type.js`]  : [targets.quickenWebApp],
    [`${sources.quickenDerived}/position-tree-node.type.js`]  : [targets.quickenWebApp],
    [`${sources.quickenDerived}/category-aggregate.type.js`]  : [targets.quickenWebApp],
    [`${sources.quickenDerived}/category-tree-node.type.js`]  : [targets.quickenWebApp],
    [`${sources.quickenDerived}/register-row.type.js`]        : [targets.quickenWebApp],
    [`${sources.quickenDerived}/query-result.type.js`]        : [targets.quickenWebApp],
    [`${sources.quickenDerived}/query-result-tree.type.js`]   : [targets.quickenWebApp],

    // ui-state — view/layout/filter configuration
    [`${sources.quickenUiState}/view.type.js`]                : [targets.quickenWebApp],
    [`${sources.quickenUiState}/tab-group.type.js`]           : [targets.quickenWebApp],
    [`${sources.quickenUiState}/tab-layout.type.js`]          : [targets.quickenWebApp],
    [`${sources.quickenUiState}/table-layout.type.js`]        : [targets.quickenWebApp],
    [`${sources.quickenUiState}/column-descriptor.type.js`]   : [targets.quickenWebApp],
    [`${sources.quickenUiState}/column-definition.type.js`]   : [targets.quickenWebApp],
    [`${sources.quickenUiState}/sort-order.type.js`]          : [targets.quickenWebApp],
    [`${sources.quickenUiState}/sort-mode.type.js`]           : [targets.quickenWebApp],
    [`${sources.quickenUiState}/transaction-filter.type.js`]  : [targets.quickenWebApp],
    [`${sources.quickenUiState}/view-ui-state.type.js`]       : [targets.quickenWebApp],

    // query-language IR types (internal to query-language)
    [`${sources.quickenWebAppIR}/ir-date-range.type.js`]      : [targets.queryLanguage],
    [`${sources.quickenWebAppIR}/ir-filter.type.js`]          : [targets.queryLanguage],
    [`${sources.quickenWebAppIR}/financial-query.type.js`]    : [targets.queryLanguage],
    [`${sources.quickenWebAppIR}/ir-grouping.type.js`]        : [targets.queryLanguage],
    [`${sources.quickenWebAppIR}/pivot-expression.type.js`]   : [targets.queryLanguage],
    [`${sources.quickenWebAppIR}/computed-row.type.js`]       : [targets.queryLanguage],

    // cross-cutting (Action must come after entity types it references)
    [`${sources.quickenWebApp}/action.type.js`]               : [targets.quickenWebApp],


    // for the cli-type-generator itself (all internal types)
    [`${sources.typesGeneration}/field-types.js`]          : [targets.typesGeneration],
    [`${sources.typesGeneration}/field-type.type.js`]      : [targets.typesGeneration],
    [`${sources.typesGeneration}/function-info.type.js`]   : [targets.typesGeneration],
    [`${sources.typesGeneration}/import-info.type.js`]     : [targets.typesGeneration],
    [`${sources.typesGeneration}/import-specifier.type.js`]: [targets.typesGeneration],
    [`${sources.typesGeneration}/parse-result.type.js`]    : [targets.typesGeneration],
    [`${sources.typesGeneration}/type-definition.type.js`] : [targets.typesGeneration],
}
