// Prefix $PWD onto relative stack paths so WebStorm linkifies them.
//
// Transforms stack-trace lines like:
//   at test/integration/foo.js:12:5
//   at ../common/util.mjs:88:17
// → into absolute paths like:
//   at /Users/you/project/modules/curb-map/test/integration/foo.js:12:5
//
// ✅ MATCHES (prefixed):
//   at foo.js:10:5
//   at ./foo.js:10:5
//   at ../bar/baz.ts:33:12
//   at someFunc (test/integration/foo.jsx:22:3)
//
// 🚫 DOES NOT MATCH (left untouched):
//   at /Users/.../foo.js:10:5          ← already absolute
//   at node:internal/modules/...       ← Node internals

const PWD = process.cwd().replace(/\/$/, '')

// Matches “something.js:line:col)” even if color codes surround it.
const STACK_TRACE_LINE = /(?<=\n)(.*?)(js|jsx):(?<line>\d+):(?<col>\d+)\)?/g

process.stdin.setEncoding('utf8')
process.stdin.on('data', chunk => {
    const out = chunk.replace(STACK_TRACE_LINE, (match, _file, _line, _col, offset, src) => {
        // the relative path is preceded by a space, paren or colon and ends in js(x):number:number
        const regex = /[ (:][a-zA-Z_/.-]*(js|jsx):(?<line>\d+):(?<col>\d+)/
        const [submatch] = regex.exec(match)

        // the replacement puts PWD between the space, paren or color and the path
        const initialCharacter = submatch[0]
        const path = submatch.slice(1)
        const replacement = `${initialCharacter}${PWD}/${path}`

        // 1. substitute the submatch we found with the replacement that includes PWD
        // 2. substitute `async file:<absolute-path>` => `async foo (absolute-path)` -- who knows why this is necessary?
        const result = match.replace(submatch, replacement)
        return result.replace(/file:(.*)$/, 'foo ($1)')
    })

    process.stdout.write(out)
})
