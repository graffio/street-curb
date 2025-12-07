export const Category = {
    name: 'Category',
    kind: 'tagged',
    fields: {
        id: 'Number',
        name: 'String',
        description: 'String?',
        budgetAmount: 'Number?',
        isIncomeCategory: 'Boolean?',
        isTaxRelated: 'Boolean?',
        taxSchedule: 'String?',
    },
}
