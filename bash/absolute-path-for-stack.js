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
//   at file:///Users/.../foo.js:10:5   ← file: URL

const PWD = process.cwd().replace(/\/$/, '')

// Matches “something.js:line:col)” even if color codes surround it.
const FILE_RE = /(?<file>(?:\.{0,2}\/)?(?:[\w.-]+\/)*[\w.-]+\.(?:js|jsx)):(?<line>\d+):(?<col>\d+)\)?/g

process.stdin.setEncoding('utf8')
// process.stdin.on('data', chunk => {
//     const out = chunk.replace(FILE_RE, (match, _file, _line, _col, offset, src) => {
//         // Peek just before the match; skip absolute or URL-like prefixes
//         const pre = src.slice(Math.max(0, offset - 6), offset)
//
//         const skipPrepend = /(^|[^\w:])(?:\/|node:|file:)$/.test(pre)
//         return skipPrepend ? match : `${PWD}/${match}`
//     })
//
//     process.stdout.write(out)
// })
process.stdin.on('data', chunk => {
    const out = chunk.replace(FILE_RE, (match, _file, _line, _col, offset, src) => {
        // Find the start of this stack-trace line
        const lineStart = src.lastIndexOf('\n', offset) + 1
        const pre = src.slice(lineStart, offset)

        // Skip already-absolute or URL-like paths
        if (/at\s+(?:\/|node:|file:)/.test(pre)) return match

        // Otherwise prefix relative path with $PWD
        return `${PWD}/${match}`
    })

    process.stdout.write(out)
})
