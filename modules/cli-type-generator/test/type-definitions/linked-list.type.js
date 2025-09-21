// Tagged sum type definition for LinkedList
export const LinkedList = {
    name: 'LinkedList',
    kind: 'taggedSum',
    variants: { Node: { head: 'Any', tail: 'LinkedList' }, Nil: {} },
}
