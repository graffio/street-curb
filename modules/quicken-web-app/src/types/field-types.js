// ABOUTME: Field type validators for quicken-web-app
// ABOUTME: Contains regex patterns for tagged type field validation

const viewIdRegex = /^(reg|rpt|rec|inv)_[a-z0-9_]+$/

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const FieldTypes = {
    accountId          : /^acc_[a-f0-9]{12}$/,           // stable account id: acc_000000000001
    categoryId         : /^cat_[a-f0-9]{12}$/,           // stable category id: cat_000000000001
    lotAllocationId    : /^la_[a-f0-9]{12}$/,            // stable lot allocation id: la_000000000001
    lotId              : /^lot_[a-f0-9]{12}$/,           // stable lot id: lot_000000000001
    priceId            : /^prc_[a-f0-9]{12}$/,           // stable price id: prc_000000000001
    securityId         : /^sec_[a-f0-9]{12}$/,           // stable security id: sec_000000000001
    tagId              : /^tag_[a-f0-9]{12}$/,           // stable tag id: tag_000000000001
    transactionId      : /^txn_[a-f0-9]{12}(-\d+)?$/,   // stable transaction id: txn_000000000001 or txn_000000000001-2
    direction          : /^(asc|desc|none)$/,
    columnDescriptorId : /^[a-zA-Z][a-zA-Z0-9_]*$/,      // matches TanStack column id directly (date, payee, amount)
    tableLayoutId      : /^cols_[a-z0-9_]+$/,            // allows semantic IDs like cols_bank_default
    viewId             : viewIdRegex,                    // derived from content: reg_acc_xxx, rpt_xxx, rec_acc_xxx
    tabGroupId         : /^tg_\d+$/,                     // monotonically increasing: tg_1, tg_2, ...
    tabLayoutId        : /^tl_[a-z0-9_]+$/,              // tab layout id: tl_main
    sourceName         : /^[a-z_][a-z0-9_]*$/,           // query source name: food, income_q1
    groupDimension     : /^(month|quarter|year|category|account|security)$/,
    arithmeticOp       : /^[/+*-]$/,                     // binary expression operators
    timeUnit           : /^(months|days|weeks|years)$/,  // relative date range units
    namedPeriod        : /^(last_quarter|last_month|last_year|this_quarter|this_month|this_year|year_to_date)$/,
    accountType           : /^(Bank|Cash|Credit Card|Investment|Other Asset|Other Liability|401\(k\)\/403\(b\))$/,
    sortDirection         : /^(asc|desc)$/,
    timeSeriesInterval    : /^(daily|weekly|monthly|quarterly|yearly)$/,
}

export { FieldTypes }
