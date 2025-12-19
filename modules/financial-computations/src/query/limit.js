// ABOUTME: Pagination and limiting operations
// ABOUTME: Take, skip, and paginate

// Take first n items
// @sig take :: (Number, [a]) -> [a]
const take = (n, items) => items.slice(0, n)

// Skip first n items
// @sig skip :: (Number, [a]) -> [a]
const skip = (n, items) => items.slice(n)

// Paginate: skip + take for a specific page
// @sig paginate :: (Number, Number, [a]) -> [a]
const paginate = (page, pageSize, items) => items.slice(page * pageSize, (page + 1) * pageSize)

export { take, skip, paginate }
