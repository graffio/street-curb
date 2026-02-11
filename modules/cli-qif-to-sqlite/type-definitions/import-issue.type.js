export const ImportIssue = {
    name: 'ImportIssue',
    kind: 'taggedSum',
    variants: { SingleAccount: { accounts: '[String]' }, MissingAccounts: { missing: '[String]' } },
}
