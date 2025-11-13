/*
 * Split the keys of o into two new objects 'a' and 'b,' where 'keys' defines which keys should go into output 'a'
 * @sig splitByKey = ([String], {k:v}) -> [{k:v}, {k:v}]
 */
const splitByKey = (keys, o) => {
    const a = {}
    const b = {}

    for (const k in o) {
        const target = keys.includes(k) ? a : b
        target[k] = o[k]
    }

    return [a, b]
}

export default splitByKey
