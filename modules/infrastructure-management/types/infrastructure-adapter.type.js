/*
 * Infrastructure Adapter Type
 */

// prettier-ignore
export const InfrastructureAdapter = {
    name: 'InfrastructureAdapter',
    kind: 'taggedSum',
    variants: {
        Alice: {
            name: /alice/
        },
        
        Bob: {
            name: /bob/
        },
    }
}
