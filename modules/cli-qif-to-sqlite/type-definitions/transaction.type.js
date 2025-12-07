export const Transaction = {
    name: 'Transaction',
    kind: 'taggedSum',
    variants: {
        Bank: {
            // Required fields (alphabetical)
            accountId: 'Number',
            amount: 'Number',
            date: 'String',
            id: 'Number',
            transactionType: /^bank$/,

            // Optional fields (alphabetical)
            address: 'String?',
            categoryId: 'Number?',
            cleared: 'String?',
            memo: 'String?',
            number: 'String?',
            payee: 'String?',
        },
        Investment: {
            // Required fields (alphabetical)
            accountId: 'Number',
            date: 'String',
            id: 'Number',
            transactionType: /^investment$/,

            // Optional fields (alphabetical)
            address: 'String?',
            amount: 'Number?',
            categoryId: 'Number?',
            cleared: 'String?',
            commission: 'Number?',
            investmentAction:
                /^(Buy|BuyX|CGLong|CGShort|CvrShrt|Div|IntInc|MargInt|MiscExp|MiscInc|ReinvDiv|ReinvInt|ReinvLg|ReinvSh|Sell|SellX|ShrsIn|ShrsOut|ShtSell|StkSplit|XIn|XOut)$/,
            memo: 'String?',
            payee: 'String?',
            price: 'Number?',
            quantity: 'Number?',
            securityId: 'Number?',
        },
    },
}
