// ABOUTME: Category selectors for Redux state
// ABOUTME: Memoized derived selectors for category data

import memoizeReduxState from '@graffio/functional/src/ramda-like/memoize-redux-state.js'
import { Category } from '../../types/category.js'

// All category names including generated parent categories
// @sig allNames :: ReduxState -> [String]
const allNames = memoizeReduxState(['categories'], state => Category.collectAllNames(state.categories))

const Categories = { allNames }

export { Categories }
