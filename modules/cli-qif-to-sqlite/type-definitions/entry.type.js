// Import dependencies needed for attached functions

export const Entry = {
    name: 'Entry',
    kind: 'taggedSum',
    variants: {
        Account: {
            /* N */ name: 'String',
            /* T */ type: /^(Bank|Cash|Credit Card|Investment|Mutual|Other Asset|Other Liability|Portfolio|401.k..403.b.)$/,

            /* D */ description: 'String?',
            /* L */ creditLimit: 'Number?',
        },
        Category: {
            /* N */ name: 'String',

            /* B */ budgetAmount: 'Number?',
            /* D */ description: 'String?',
            /* E */ excluded: 'Boolean?',
            /* I */ isIncomeCategory: 'Boolean?',
            /* T */ isTaxRelated: 'Boolean?',
            /* R */ taxSchedule: 'String?',
        },
        Class: {
            /* N */ name: 'String',

            /* C */ subclass: 'String?',
            /* D */ description: 'String?',
        },
        Payee: {
            /* N */ name: 'String',

            /* A */ address: '[String]?',
            /* M */ memo: 'String?',
            /* T */ defaultCategory: 'String?',
        },
        Price: { symbol: 'String', price: 'Number', date: 'Object' },
        Security: {
            /* N */ name: 'String',

            /* G */ goal: 'String?',
            /* S */ symbol: 'String?',
            /* T */ type: 'String?',
        },
        Tag: {
            /* N */ name: 'String',

            /* C */ color: 'String?',
            /* D */ description: 'String?',
        },
        TransactionBank: {
            /*     */ account: 'String', // from the currentAccount, not the record itself
            /* TU  */ amount: 'Number',
            /* D   */ date: 'Object',
            /* N   */ transactionType: /^(Bank|Cash|Credit Card|Invoice|Other Asset|Other Liability)$/,

            /* A   */ address: '[String]?',
            /* L   */ category: 'String?',
            /* C   */ cleared: 'String?',
            /* M   */ memo: 'String?',
            /* N   */ number: 'String?',
            /* P   */ payee: 'String?',
            /* SE$ */ splits: '[Split]?',
        },
        TransactionInvestment: {
            /*     */ account: 'String', // from the currentAccount, not the record itself
            /* D   */ date: 'Object',
            /* N   */ transactionType:
                /^(Buy|BuyX|Cash|CGLong|CGShort|ContribX|CvrShrt|Div|DivX|Exercise|Expire|Grant|IntInc|MargInt|MiscExp|MiscInc|MiscIncX|ReinvDiv|ReinvInt|ReinvLg|ReinvMd|ReinvSh|Reminder|RtrnCapX|Sell|SellX|ShrsIn|ShrsOut|ShtSell|StkSplit|Vest|XIn|XOut|WithdrwX)$/,

            /* #   */ number: 'String?',
            /* A   */ address: '[String]?',
            /* TU$ */ amount: 'Number?',
            /* L   */ category: 'String?',
            /* C   */ cleared: 'String?',
            /* O   */ commission: 'Number?',
            /* M   */ memo: 'String?',
            /* P   */ payee: 'String?',
            /* I   */ price: 'Number?',
            /* Q   */ quantity: 'Number?',
            /* Y   */ security: 'String?',
        },
    },
}
