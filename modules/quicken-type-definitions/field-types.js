// ABOUTME: Field type validators for quicken-type-definitions
// ABOUTME: Contains regex patterns for stable ID fields across all entity types

// prettier-ignore
const FieldTypes = {
    accountId       : /^acc_[a-f0-9]{12}$/,
    categoryId      : /^cat_[a-f0-9]{12}$/,
    lotAllocationId : /^la_[a-f0-9]{12}$/,
    lotId           : /^lot_[a-f0-9]{12}$/,
    priceId         : /^prc_[a-f0-9]{12}$/,
    securityId      : /^sec_[a-f0-9]{12}$/,
    tagId           : /^tag_[a-f0-9]{12}$/,
    transactionId   : /^txn_[a-f0-9]{12}(-\d+)?$/,
}

export { FieldTypes }
