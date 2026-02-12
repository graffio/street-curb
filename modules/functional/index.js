// ABOUTME: Main entry point for @graffio/functional utilities
// ABOUTME: Re-exports Ramda-like helpers, date utils, LookupTable, and Tagged type utilities
// COMPLEXITY: Barrel file - many exports intentional to provide single import point for all utilities

import applySort from './src/apply-sort.js'
import { truncateWithCount } from './src/truncate-with-count.js'
import { wrapIndex } from './src/wrap-index.js'
import { PromiseCache, PromiseCacheWithCacheBusting } from './promise-cache.js'
import LookupTable from './src/lookup-table.js'
import addOrReplaceAtPath from './src/ramda-like/add-or-replace-at-path.js'
import anyFieldContains from './src/ramda-like/any-field-contains.js'
import aperture from './src/ramda-like/aperture.js'
import appendIfMissing from './src/ramda-like/append-if-missing.js'
import arrayToLookupTable from './src/ramda-like/array-to-lookup-table.js'
import assocPathIfDifferent from './src/ramda-like/assoc-path-if-different.js'
import assocPathString from './src/ramda-like/assoc-path-string.js'
import assocPath from './src/ramda-like/assoc-path.js'
import assoc from './src/ramda-like/assoc.js'
import asyncMapObject from './src/ramda-like/async-map-object.js'
import { aggregateTree, buildTree, flattenTree } from './src/ramda-like/tree.js'
import byFieldStringComparator from './src/ramda-like/by-field-string-comparator.js'
import clone from './src/ramda-like/clone.js'
import compactMap from './src/ramda-like/compact-map.js'
import compact from './src/ramda-like/compact.js'
import containsIgnoreCase from './src/ramda-like/contains-ignore-case.js'
import createSelector from './src/ramda-like/create-selector.js'
import debounce from './src/ramda-like/debounce.js'
import diffObjects from './src/ramda-like/diff-objects.js'
import dissocPath from './src/ramda-like/dissoc-path.js'
import dissoc from './src/ramda-like/dissoc.js'
import equals from './src/ramda-like/equals.js'
import evolve from './src/ramda-like/evolve.js'
import filterObject from './src/ramda-like/filter-object.js'
import filterValues from './src/ramda-like/filter-values.js'
import findInValues from './src/ramda-like/find-in-values.js'
import firstKey from './src/ramda-like/first-key.js'
import forEachObject from './src/ramda-like/for-each-object.js'
import groupBy from './src/ramda-like/group-by.js'
import groupByMulti from './src/ramda-like/group-by-multi.js'
import invertObj from './src/ramda-like/invertObject.js'
import isNil from './src/ramda-like/isNil.js'
import keys from './src/ramda-like/keys.js'
import mapAccum from './src/ramda-like/map-accum.js'
import mapObject from './src/ramda-like/map-object.js'
import mapReturningFirst from './src/ramda-like/map-returning-first.js'
import mapValues from './src/ramda-like/map-values.js'
import memoizeOnceWithIdenticalParams from './src/ramda-like/memoize-once-with-identical-params.js'
import memoizeOnce from './src/ramda-like/memoize-once.js'
import memoizeReduxState, { memoizeReduxStatePerKey } from './src/ramda-like/memoize-redux-state.js'
import mergeDeepRight from './src/ramda-like/merge-deep-right.js'
import mergeDeepWithKey from './src/ramda-like/merge-deep-with-key.js'
import mergeRight from './src/ramda-like/merge-right.js'
import mergeWithKey from './src/ramda-like/merge-with-key.js'
import moveArrayItem from './src/ramda-like/move-array-item.js'
import moveItemToEnd from './src/ramda-like/move-item-to-end.js'
import nonNilValues from './src/ramda-like/non-nil-values.js'
import nth from './src/ramda-like/nth.js'
import omit from './src/ramda-like/omit.js'
import path from './src/ramda-like/path.js'
import pick from './src/ramda-like/pick.js'
import pipe from './src/ramda-like/pipe.js'
import pluck from './src/ramda-like/pluck.js'
import pushToKey from './src/ramda-like/push-to-key.js'
import range from './src/ramda-like/range.js'
import reindent from './src/ramda-like/reindent.js'
import removeNilValues from './src/ramda-like/remove-nil-values.js'
import renameKeys from './src/ramda-like/rename-keys.js'
import sort from './src/ramda-like/sort.js'
import splitByKey from './src/ramda-like/split-by-key.js'
import splitEvery from './src/ramda-like/split-every.js'
import throttle from './src/ramda-like/throttle.js'
import type from './src/ramda-like/type.js'
import uniqBy from './src/ramda-like/uniq-by.js'
import uniq from './src/ramda-like/uniq.js'
import update from './src/ramda-like/update.js'
import { updateLookupTablePath } from './src/update-lookup-table-path.js'
import without from './src/ramda-like/without.js'
import zipObject from './src/ramda-like/zip-object.js'

export * from './src/ramda-like/list.js'
export {
    // Core utilities
    getDaysInMonth,
    startOfDay,
    endOfDay,
    addDays,
    subtractDays,

    // Period calculations
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfQuarter,
    endOfQuarter,
    startOfYear,
    endOfYear,

    // Parsing and formatting
    parseIsoDateFormat,
    parseSlashDateFormat,
    formatDateString,
    dateToDateParts,
    datePartsToDate,
    convertSlashToIso,
} from './src/date-utils.js'

export {
    PromiseCache,
    PromiseCacheWithCacheBusting,

    // functions
    addOrReplaceAtPath,
    applySort,
    aggregateTree,
    anyFieldContains,
    aperture,
    appendIfMissing,
    arrayToLookupTable,
    assoc,
    assocPath,
    assocPathIfDifferent,
    assocPathString,
    asyncMapObject,
    buildTree,
    byFieldStringComparator,
    clone,
    compact,
    containsIgnoreCase,
    createSelector,
    debounce,
    diffObjects,
    dissoc,
    dissocPath,
    equals,
    evolve,
    filterObject,
    filterValues,
    flattenTree,
    findInValues,
    firstKey,
    forEachObject,
    groupBy,
    groupByMulti,
    invertObj,
    isNil,
    keys,
    mapAccum,
    compactMap,
    mapObject,
    mapReturningFirst,
    mapValues,
    memoizeOnce,
    memoizeOnceWithIdenticalParams,
    memoizeReduxState,
    memoizeReduxStatePerKey,
    mergeDeepRight,
    mergeDeepWithKey,
    mergeRight,
    mergeWithKey,
    moveArrayItem,
    moveItemToEnd,
    nonNilValues,
    nth,
    omit,
    path,
    pick,
    pipe,
    pluck,
    pushToKey,
    range,
    reindent,
    removeNilValues,
    renameKeys,
    sort,
    splitByKey,
    splitEvery,
    throttle,
    type,
    uniq,
    uniqBy,
    update,
    updateLookupTablePath,
    without,
    zipObject,
    truncateWithCount,
    wrapIndex,

    //
    LookupTable,
}
