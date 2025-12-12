// ABOUTME: Field type validators for quicken-web-app
// ABOUTME: Contains regex patterns for tagged type field validation

// prettier-ignore
const FieldTypes = {
    direction          : /^(asc|desc|none)$/,
    columnDescriptorId : /^col_[a-zA-Z][a-zA-Z0-9_]*$/,  // allows semantic IDs like col_date, col_runningBalance
    tableLayoutId      : /^cols_[a-z0-9_]+$/,            // allows semantic IDs like cols_bank_default
}

export { FieldTypes }
