// ABOUTME: Field type patterns for cli-type-generator internal types
// ABOUTME: Regex patterns for validating JavaScript identifiers and module paths

// JavaScript identifier: starts with letter/underscore/$, continues with alphanumeric/_/$
// Note: Does not validate against reserved words
const jsIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

// Module path: relative (./ or ../) or package name (@scope/pkg or pkg)
const modulePath = /^(\.\.?\/[^\s]+|@[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+)$/

const FieldTypes = { jsIdentifier, modulePath }

export { FieldTypes }
