/*
 * Proof of concept for a TaggedType-based definition of a singly-linked list
 */

import { taggedSum } from '../../src/tagged-types/tagged-type.js'

const LinkedList = taggedSum('LinkedList', {
    Node: { head: 'Any', tail: 'LinkedList' }, // @sig Node :: [Any, List]
    Nil: {},
})

// concat :: ([x], [x]) -> [x]
const concat = (a, x) => a.concat(x)

/*
 * Insert x as the tail of node, where node was presumably the last Node in a LinkedList. Returns the new tail
 *
 * Impure: modifies node
 * @sig insertAfter :: (LinkedList.Node, x) -> LinkedList.Node
 */
LinkedList.insertAfter = (node, x) => (node.tail = LinkedList.Node(x, LinkedList.Nil))

/*
 * Add x as a Node with the given tail. Returns the new Node.
 * @sig insertBefore :: (LinkedList, x) -> LinkedList.Node
 */
LinkedList.insertBefore = (tail, x) => LinkedList.Node(x, tail)

/*
 * Iterate over a LinkedList calling reducer on each Node, patterned on Array.reduce.
 *
 * @sig reduce :: (Reducer, a, LinkedList b) -> a
 *   Reducer :: (a, b) -> a
 */
LinkedList.reduce = (reducer, initialValue, list) => {
    let result = initialValue

    while (LinkedList.Node.is(list)) {
        result = reducer(result, list.head)
        list = list.tail
    }

    return result
}

/*
 * Create a LinkedList from an array
 *
 * @sig fromArray :: [a] -> LinkedList a
 */
LinkedList.fromArray = a => {
    const head = LinkedList.Node('never used', LinkedList.Nil)
    a.reduce(LinkedList.insertAfter, head)
    return head.tail
}

/*
 * Create an Array from a LinkedList
 *
 * @sig toArray :: LinkedList a -> [a]
 */
LinkedList.toArray = list => LinkedList.reduce(concat, [], list)

/*
 * Reverse a LinkedList
 *
 * @sig reverse :: LinkedList a -> LinkedList a
 */
LinkedList.reverse = list => LinkedList.reduce(LinkedList.insertBefore, LinkedList.Nil, list)

export default LinkedList
