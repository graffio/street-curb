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
            runningBalance: 'Number?',
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
                /^(Buy|BuyX|Cash|CGLong|CGShort|ContribX|CvrShrt|Div|DivX|Exercise|Expire|Grant|IntInc|MargInt|MiscExp|MiscInc|MiscIncX|ReinvDiv|ReinvInt|ReinvLg|ReinvMd|ReinvSh|Reminder|RtrnCapX|Sell|SellX|ShrsIn|ShrsOut|ShtSell|StkSplit|Vest|WithdrwX|XIn|XOut)$/,
            memo: 'String?',
            payee: 'String?',
            price: 'Number?',
            quantity: 'Number?',
            runningBalance: 'Number?',
            securityId: 'String?', // sec_<hash> or null
        },
    },
}
