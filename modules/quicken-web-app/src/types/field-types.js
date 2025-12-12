// ABOUTME: Field type validators and ID generators for quicken-web-app
// ABOUTME: Contains regex patterns for tagged type field validation

import cuid2 from '@paralleldrive/cuid2'

const cuid12 = cuid2.init({ length: 12 })

// prettier-ignore
const FieldTypes = {
    direction          : /^(asc|desc|none)$/,
    columnDescriptorId : /^col_[a-zA-Z][a-zA-Z0-9_]*$/,  // allows semantic IDs like col_date, col_runningBalance
    tableLayoutId      : /^cols_[a-z0-9_]+$/,            // allows semantic IDs like cols_bank_default
}

export { FieldTypes }
