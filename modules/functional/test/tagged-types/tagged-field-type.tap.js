import { tap } from '@graffio/test-helpers'
import TypeDefinition from '../../src/tagged-types/tagged-field-type.js'
import Generator from '../../src/tagged-types/tagged-type-function-generators.js'

// prettier-ignore
const toStringExamples = [
    [{ baseType: 'String'                                               } , 'String'],
    [{ baseType: 'Number'                                               } , 'Number'],
    [{ baseType: 'Boolean'                                              } , 'Boolean'],
    [{ baseType: 'Any'                                                  } , 'Any'],
    [{ baseType: 'Tagged', taggedType: 'Coord'                          } , 'Coord'],

    [{ baseType: 'String',  optional: true                              } , 'String?'],
    [{ baseType: 'Number',  optional: true                              } , 'Number?'],
    [{ baseType: 'Boolean', optional: true                              } , 'Boolean?'],
    [{ baseType: 'Any',     optional: true                              } , 'Any?'],
    [{ baseType: 'Tagged',  optional: true , taggedType: 'Coord'        } , 'Coord?'],

    // String
    [{ baseType: 'String', regex: /abc/                                 } , '/abc/'],
    [{ baseType: 'String', regex: /abc/, optional: true                 } , '/abc/?'],

    [{ baseType: 'String',  arrayDepth: 1                               } , '[String]'],
    [{ baseType: 'String',  arrayDepth: 2                               } , '[[String]]'],
    [{ baseType: 'Number',  arrayDepth: 1                               } , '[Number]'],
    [{ baseType: 'Boolean', arrayDepth: 1                               } , '[Boolean]'],
    [{ baseType: 'Any',     arrayDepth: 1                               } , '[Any]'],
    [{ baseType: 'Tagged',  arrayDepth: 1, taggedType: 'Coord'          } , '[Coord]'],
    [{ baseType: 'String',  arrayDepth: 1, optional: true               } , '[String]?'],
    [{ baseType: 'String',  arrayDepth: 1, regex: /abc/, optional: true } , '[/abc/]?']
]

const base = { arrayDepth: 0, optional: false, regex: false }

const m = o => Object.assign({}, base, o)

// prettier-ignore
const fromStringExamples = [
    ['String',       m({ baseType: 'String' })],
    ['Number',       m({ baseType: 'Number' })],
    ['Boolean',      m({ baseType: 'Boolean' })],
    ['Object',       m({ baseType: 'Object' })],
    ['Any',          m({ baseType: 'Any' })],
    ['Coord',        m({ baseType: 'Tagged', taggedType: 'Coord' })],

    ['String?',      m({ baseType: 'String',  optional: true })],
    ['Number?',      m({ baseType: 'Number',  optional: true })],
    ['Boolean?',     m({ baseType: 'Boolean', optional: true })],
    ['Object?',      m({ baseType: 'Object',  optional: true })],
    ['Any?',         m({ baseType: 'Any',     optional: true })],
    ['Coord?',       m({ baseType: 'Tagged',  optional: true, taggedType: 'Coord' })],

    // String
    ['/abc/',        m({ baseType: 'String', regex: /abc/ })],
    ['/abc/?',       m({ baseType: 'String', regex: /abc/, optional: true })],

    // Array
    ['[String]',     m({ baseType: 'String',  arrayDepth: 1 })],
    ['[[Boolean]]',  m({ baseType: 'Boolean', arrayDepth: 2 })],
    ['[[[Number]]]', m({ baseType: 'Number',  arrayDepth: 3 })],

    ['[Number]',     m({ baseType: 'Number',  arrayDepth: 1 })],
    ['[Boolean]',    m({ baseType: 'Boolean', arrayDepth: 1 })],
    ['[Object]',     m({ baseType: 'Object',  arrayDepth: 1 })],
    ['[Any]',        m({ baseType: 'Any',     arrayDepth: 1 })],
    ['[Coord]',      m({ baseType: 'Tagged',  arrayDepth: 1, taggedType: 'Coord' })],

    ['[String]?',    m({ baseType: 'String', optional: true, arrayDepth: 1 })],
    ['[/abc/]?',     m({ baseType: 'String', optional: true, arrayDepth: 1, regex: /abc/ })]

]

const generateToStringTests = t => {
    const one = ([params, expected]) => {
        t.same(
            TypeDefinition.toString(params),
            expected,
            `${JSON.stringify(params).replace(/"/g, '').padEnd(60)} --> '${expected}'`,
        )
    }

    toStringExamples.map(one)
}

const generateFromStringTests = t => {
    const one = ([params, expected]) => {
        t.same(TypeDefinition.fromString(params), expected, `${params.padEnd(20)}--> ${JSON.stringify(expected)}`)
    }

    fromStringExamples.map(one)
}

tap.describeTests({
    'Type Definition': {
        'toString: When I convert...': t => generateToStringTests(t),
        'fromString: When I convert... ': t => generateFromStringTests(t),
    },
})

const expectedRequired = {}
const expectedOptional = {}
const expectedRegex = {}
const expectedArray = {}

const e = expectedRequired
const eo = expectedOptional
const er = expectedRegex
const ea = expectedArray

// required
e.string = `if (typeof p !== 'string') { debugger; throw new TypeError('In constructor Foo(p): expected p to have type String; found ' + wrap(p)) }`
e.number = `if (typeof p !== 'number') { debugger; throw new TypeError('In constructor Foo(p): expected p to have type Number; found ' + wrap(p)) }`
e.boolean = `if (typeof p !== 'boolean') { debugger; throw new TypeError('In constructor Foo(p): expected p to have type Boolean; found ' + wrap(p)) }`
e.object = `if (typeof p !== 'object') { debugger; throw new TypeError('In constructor Foo(p): expected p to have type Object; found ' + wrap(p)) }`
e.coord = `if (p['@@typeName'] !== 'Coord') { debugger; throw new TypeError('In constructor Foo(p): expected p to have type Coord; found ' + wrap(p)) }`

// optional
eo.string = `if ((p != null) && typeof p !== 'string') { debugger; throw new TypeError('In constructor Foo(p): expected p to have type String; found ' + wrap(p)) }`
eo.number = `if ((p != null) && typeof p !== 'number') { debugger; throw new TypeError('In constructor Foo(p): expected p to have type Number; found ' + wrap(p)) }`
eo.boolean = `if ((p != null) && typeof p !== 'boolean') { debugger; throw new TypeError('In constructor Foo(p): expected p to have type Boolean; found ' + wrap(p)) }`
eo.object = `if ((p != null) && typeof p !== 'object') { debugger; throw new TypeError('In constructor Foo(p): expected p to have type Object; found ' + wrap(p)) }`
eo.coord = `if ((p != null) && p['@@typeName'] !== 'Coord') { debugger; throw new TypeError('In constructor Foo(p): expected p to have type Coord; found ' + wrap(p)) }`

// regex
er.required = `
    if (typeof p !== 'string') { debugger; throw new TypeError('In constructor Foo(p): expected p to have type String; found ' + wrap(p)) }
    if (!p.match(/abc/)) { debugger; throw new TypeError('In constructor Foo(p): expected p to match /abc/; found ' + wrap(p)) }`
er.optional = `
    if ((p != null) && typeof p !== 'string') { debugger; throw new TypeError('In constructor Foo(p): expected p to have type String; found ' + wrap(p)) }
    if ((p != null) && !p.match(/abc/)) { debugger; throw new TypeError('In constructor Foo(p): expected p to match /abc/; found ' + wrap(p)) }
`

// array
ea.string = `
    if (!Array.isArray(p)) { debugger; throw new TypeError('In constructor Foo(p): expected p to have type [String]; found ' + wrap(p)) }
    
    if (p.length) {
        if (typeof p[0] !== 'string') { debugger; throw new TypeError('In constructor Foo(p): expected p[0] to have type String; found ' + wrap(p[0])) }
    }`
ea.string2d = `
    if (!Array.isArray(p) || !Array.isArray(p[0])) { debugger; throw new TypeError('In constructor Foo(p): expected p to have type [[String]]; found ' + wrap(p)) }
    
    if (p.length) {
        if (typeof p[0][0] !== 'string') { debugger; throw new TypeError('In constructor Foo(p): expected p[0][0] to have type String; found ' + wrap(p[0][0])) }
    }`
ea.string3d = `
    if (!Array.isArray(p) || !Array.isArray(p[0]) || !Array.isArray(p[0][0])) { debugger; throw new TypeError('In constructor Foo(p): expected p to have type [[[String]]]; found ' + wrap(p)) }
    
    if (p.length) {
        if (typeof p[0][0][0] !== 'string') { debugger; throw new TypeError('In constructor Foo(p): expected p[0][0][0] to have type String; found ' + wrap(p[0][0][0])) }
    }`
ea.regex3d = `
    if (!Array.isArray(p) || !Array.isArray(p[0]) || !Array.isArray(p[0][0])) { debugger; throw new TypeError('In constructor Foo(p): expected p to have type [[[/abc/]]]; found ' + wrap(p)) }
    
    if (p.length) {
        if (typeof p[0][0][0] !== 'string') { debugger; throw new TypeError('In constructor Foo(p): expected p[0][0][0] to have type String; found ' + wrap(p[0][0][0])) }
        if (!p[0][0][0].match(/abc/)) { debugger; throw new TypeError('In constructor Foo(p): expected p[0][0][0] to match /abc/; found ' + wrap(p[0][0][0])) }
    }`
ea.any = `if (!Array.isArray(p) || !Array.isArray(p[0]) || !Array.isArray(p[0][0])) { debugger; throw new TypeError('In constructor Foo(p): expected p to have type [[[Any]]]; found ' + wrap(p)) }`

const requiredExamples = {
    "Given: { p: 'String' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('String') })
        t.matchR('The constructor should check that p is a string', actual, e.string)
    },
    "Given: { p: 'Number' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('Number') })
        t.matchR(`The constructor should check that p is a number`, actual, e.number)
    },
    "Given: { p: 'Boolean' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('Boolean') })
        t.matchR(`The constructor should check that p is a boolean`, actual, e.boolean)
    },
    "Given: { p: 'Object' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('Object') })
        t.matchR(`The constructor should check that p is an object`, actual, e.object)
    },
    "Given: { p: 'Any' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('Any') })
        t.matchR(`The constructor should check that it adds no type checking`, actual, '    ')
    },
    "Given: { p: 'Coord' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('Coord') })
        t.matchR(`The constructor should check that p is a Coord`, actual, e.coord)
    },
}

const optionalExamples = {
    "Given: { p: 'String?' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('String?') })
        t.matchR(`The constructor should check that if p exists, it's a string`, actual, eo.string)
    },
    "Given: { p: 'Number?' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('Number?') })
        t.matchR(`The constructor should check that if p exists, it's a number`, actual, eo.number)
    },

    "Given: { p: 'Boolean?' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('Boolean?') })
        t.matchR(`The constructor should check that if p exists, it's a boolean`, actual, eo.boolean)
    },
    "Given: { p:'Any?' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('Any?') })
        t.matchR(`The constructor should check that it adds no type checking`, actual, '    ')
    },
    "Given: { p: 'Object?' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('Object?') })
        t.matchR(`The constructor should check that if p exists, it's an object`, actual, eo.object)
    },
    "Given: { p: 'Coord?' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('Coord?') })
        t.matchR(`The constructor should check that if p exists it's a Coord`, actual, eo.coord)
    },
}

const regexExamples = {
    "Given: { p: '/abc/' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('/abc/') })
        t.matchR(`The constructor should check that p is a string that matches /abc/`, actual, er.required)
    },
    "Given: { p: '/abc/? }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('/abc/?') })
        t.matchR(`The constructor should check that if p exists, it's a string that matches /abc/`, actual, er.optional)
    },
}

const arrayExamples = {
    "Given: { p: '[String]' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('[String]') })
        t.matchR(`The constructor should check that p is an array and each element is a String`, actual, ea.string)
    },
    "Given: { p: '[[String]]' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('[[String]]') })
        t.matchR(`The constructor should check that p is a 2d array and each element is a String`, actual, ea.string2d)
    },
    "Given: { p: '[[[String]]]' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('[[[String]]]') })
        t.matchR(`The constructor should check that p is a 3d array and each element is a String`, actual, ea.string3d)
    },
    "Given: { p: '[[[/abc/]]]' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('[[[/abc/]]]') })
        t.matchR(`The constructor should check that p is a 3d array and each element matches /abc/`, actual, ea.regex3d)
    },
    "Given: { p: '[[[Any]]]' }": t => {
        const actual = Generator.generateTypeConstructor('Foo', 'Foo', { p: TypeDefinition.fromString('[[[Any]]]') })
        t.matchR(`The constructor should check that p is a 3d array`, actual, ea.any)
    },
}

const generateConstructors = {
    Required: requiredExamples,
    Optional: optionalExamples,
    Regex: regexExamples,
    Array: arrayExamples,
}

tap.describeTests({ 'Generate Tagged constructors': generateConstructors })
