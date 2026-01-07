// ABOUTME: Field type validators for quicken-web-app
// ABOUTME: Contains regex patterns for tagged type field validation

const viewIdRegex = /^(reg|rpt|rec|inv)_[a-z0-9_]+$/

// prettier-ignore
const FieldTypes = {
    direction          : /^(asc|desc|none)$/,
    columnDescriptorId : /^[a-zA-Z][a-zA-Z0-9_]*$/,      // matches TanStack column id directly (date, payee, amount)
    tableLayoutId      : /^cols_[a-z0-9_]+$/,            // allows semantic IDs like cols_bank_default
    viewId             : viewIdRegex,                    // derived from content: reg_acc_xxx, rpt_xxx, rec_acc_xxx
    keymapId           : /^(global|(reg|rpt|rec|inv)_[a-z0-9_]+)$/, // viewId or "global"
    tabGroupId         : /^tg_\d+$/,                     // monotonically increasing: tg_1, tg_2, ...
    tabLayoutId        : /^tl_[a-z0-9_]+$/,              // tab layout id: tl_main
}

export { FieldTypes }
