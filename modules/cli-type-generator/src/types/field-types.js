// ABOUTME: Field type patterns for cli-type-generator internal types
// ABOUTME: Regex patterns for validating JavaScript identifiers and module paths

// UUID v4 format
const Id = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// JavaScript identifier: starts with letter/underscore/$, continues with alphanumeric/_/$
// Note: Does not validate against reserved words
const jsIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

// Module path: relative (./ or ../) or package name (@scope/pkg or pkg)
const modulePath = /^(\.\.?\/[^\s]+|@[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+|[a-zA-Z0-9_-]+)$/

const FieldTypes = { Id, jsIdentifier, modulePath }

export { FieldTypes }
