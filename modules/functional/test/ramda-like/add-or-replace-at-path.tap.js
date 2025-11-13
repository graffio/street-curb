import tap from 'tap'
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

const s = JSON.stringify

tap.test('addOrReplaceAtPath', t => {
    t.test(`Given o = ${s(o)}`, t => {
        t.test(`When I addOrReplaceAtPath(${s(path)}, ${JSON.stringify(b1)}, o)`, t => {
            const result = addOrReplaceAtPath(path, b1, o)
            t.same(result, expectedReplace, `Then I should get ${s(expectedReplace)}`)
            t.end()
        })

        t.test(`When I then addOrReplaceAtPath(${s(path)}, ${JSON.stringify(c)}, o)`, t => {
            const result = addOrReplaceAtPath(path, c, o)
            t.same(result, expectedAdd, `Then I should get ${s(expectedAdd)}`)
            t.end()
        })

        t.end()
    })

    t.end()
})
