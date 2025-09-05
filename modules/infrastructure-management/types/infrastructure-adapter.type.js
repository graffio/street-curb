/*
 * Infrastructure Adapter Type
 */

// prettier-ignore
export const InfrastructureAdapter = {
    name: 'InfrastructureAdapter',
    kind: 'taggedSum',
    variants: {
        Firebase: {
            name: /firebase/
        },
        
        Alice: {
            name: /alice/
        },
        
        Bob: {
            name: /bob/
        },
    }
}
