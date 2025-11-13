/**
 * Splits a list into sub-lists stored in an object, based on the result of
 * calling a String-returning function on each element, and grouping the
 * results according to values returned.
 *
 * @func
 * @category List
 * @sig (a -> String) -> [a] -> {String: [a]}
 * @param {Function} f Function :: a -> String
 * @param {Array} list The array to group
 * @return {Object} An object with the output of `f` for keys, mapped to arrays of elements
 *         that produced that key when passed to `f`.
 * @example
 *
 *      const byGrade = R.groupBy(function(student) {
 *        const score = student.score;
 *        return score < 65 ? 'F' :
 *               score < 70 ? 'D' :
 *               score < 80 ? 'C' :
 *               score < 90 ? 'B' : 'A';
 *      });
 *      const students = [{name: 'Abby', score: 84},
 *                      {name: 'Eddy', score: 58},
 *                      // ...
 *                      {name: 'Jack', score: 69}];
 *      byGrade(students);
 *      // {
 *      //   'A': [{name: 'Dianne', score: 99}],
 *      //   'B': [{name: 'Abby', score: 84}]
 *      //   // ...,
 *      //   'F': [{name: 'Eddy', score: 58}]
 *      // }
 */
const groupBy = (f, list) => {
    const reducer = (acc, item) => {
        const key = f(item)
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
    }

    return list.reduce(reducer, {})
}

export default groupBy
