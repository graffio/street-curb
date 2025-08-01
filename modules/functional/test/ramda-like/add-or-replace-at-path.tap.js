import { tap } from '@qt/test-helpers'
import addOrReplaceAtPath from '../../src/ramda-like/add-or-replace-at-path.js'

const o = {
    top: {
        array: [
            { id: 'a', value: 'a' },
            { id: 'b', value: 'b' },
        ],
    },
}

const b1 = { id: 'b', value: 'b1' }
const c = { id: 'c', value: 'c' }

const expectedReplace = {
    top: {
        array: [
            { id: 'a', value: 'a' },
            { id: 'b', value: 'b1' },
        ],
    },
}

const expectedAdd = {
    top: {
        array: [
            { id: 'a', value: 'a' },
            { id: 'b', value: 'b' },
            { id: 'c', value: 'c' },
        ],
    },
}

const path = ['top', 'array']

const s = tap.stringify
tap.describeTests({
    addOrReplaceAtPath: {
        [`Given o = ${s(o)}`]: {
            [`When I addOrReplaceAtPath(${s(path)}, ${JSON.stringify(b1)}, o)`]: t => {
                t.sameR(`Then I should get ${s(expectedReplace)}`, addOrReplaceAtPath(path, b1, o), expectedReplace)
            },
            [`When I then addOrReplaceAtPath(${s(path)}, ${JSON.stringify(c)}, o)`]: t => {
                t.sameR(`Then I should get ${s(expectedAdd)}`, addOrReplaceAtPath(path, c, o), expectedAdd)
            },
        },
    },
})
