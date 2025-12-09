export const Transaction = {
    name: 'Transaction',
    kind: 'taggedSum',
    variants: {
        Bank: {
            // Required fields (alphabetical)
            accountId: /^acc_[a-f0-9]{12}$/,
            amount: 'Number',
            date: 'String',
            id: /^txn_[a-f0-9]{12}(-\d+)?$/,
            transactionType: /^bank$/,

            // Optional fields (alphabetical)
            address: 'String?',
            categoryId: 'String?', // cat_<hash> or null
            cleared: 'String?',
            memo: 'String?',
            number: 'String?',
            payee: 'String?',
        },
        Investment: {
            // Required fields (alphabetical)
            accountId: /^acc_[a-f0-9]{12}$/,
            date: 'String',
            id: /^txn_[a-f0-9]{12}(-\d+)?$/,
            transactionType: /^investment$/,

            // Optional fields (alphabetical)
            address: 'String?',
            amount: 'Number?',
            categoryId: 'String?', // cat_<hash> or null
            cleared: 'String?',
            commission: 'Number?',
            investmentAction:
                /^(Buy|BuyX|CGLong|CGShort|CvrShrt|Div|IntInc|MargInt|MiscExp|MiscInc|ReinvDiv|ReinvInt|ReinvLg|ReinvSh|Sell|SellX|ShrsIn|ShrsOut|ShtSell|StkSplit|XIn|XOut)$/,
            memo: 'String?',
            payee: 'String?',
            price: 'Number?',
            quantity: 'Number?',
            securityId: 'String?', // sec_<hash> or null
        },
    },
}
