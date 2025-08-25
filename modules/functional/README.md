# @graffio/functional #

This package defines generic functions for use elsewhere. They are all "functional" in the sense that
their parameters provide the entire context of each function and they don't mutate their inputs

## ramda-like ##

These functions are based on ramda.js -- without automatic currying, which is just too expensive.

## tagged-types ##

These functions define a meta-programming model that allows

- defining tagged and tagged-sum Types
- validating that when objects are created their types match the expected types
- tagged-sum types implement a "match" method that guarantees that every variant of a function is defined

# TODO #

- ditch metaprogramming in tagged/tagged-sum and just write out all the stuff by hand
