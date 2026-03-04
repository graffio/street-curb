export const AccountSection = {
    name: 'AccountSection',
    kind: 'tagged',
    fields: {
        id: 'String',
        label: 'String',
        isCollapsible: 'Boolean',
        accounts: '{EnrichedAccount:id}',
        children: '{AccountSection:id}',
        totalBalance: 'Number?',
        totalCount: 'Number?',
    },
}
