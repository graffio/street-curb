export const Category = {
    name: 'Category',
    kind: 'tagged',
    fields: {
        id: /^cat_[a-f0-9]{12}$/,
        name: 'String',
        description: 'String?',
        budgetAmount: 'Number?',
        isIncomeCategory: 'Boolean?',
        isTaxRelated: 'Boolean?',
        taxSchedule: 'String?',
    },
}
