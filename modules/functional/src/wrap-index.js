// ABOUTME: Wraps an index within a range, returning current, next, and previous positions
// ABOUTME: Supports -1 as "no selection" — next goes to first, prev goes to last

// Clamps index to [−1, count−1] and computes wraparound next/prev
// @sig wrapIndex :: (Number, Number) -> { index: Number, next: Number, prev: Number }
const wrapIndex = (index, count) => {
    if (count === 0) return { index: -1, next: -1, prev: -1 }

    const clamped = index < 0 ? -1 : Math.min(index, count - 1)
    const next = clamped < 0 ? 0 : clamped < count - 1 ? clamped + 1 : 0
    const prev = clamped < 0 ? count - 1 : clamped > 0 ? clamped - 1 : count - 1

    return { index: clamped, next, prev }
}

export { wrapIndex }
