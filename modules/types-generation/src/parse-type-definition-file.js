import { parse } from 'acorn'
import { generate } from 'escodegen'
import { walk } from 'estree-walker'
import fs from 'fs'

/*
 * Type definition schema validation and AST parsing for compile-time type generation
 *
 * This module handles parsing .type.js files and extracting type definitions, imports,
 * and additional functions. It validates type definitions and resolves import references
 * during the parsing process.
 *
 * Core Types:
 * ----------
 * TypeDefinition = TaggedType | TaggedSumType
 * TaggedType = { name: String, kind: 'tagged', fields: FieldMap }
 * TaggedSumType = { name: String, kind: 'taggedSum', variants: VariantMap }
 * FieldMap = { [fieldName]: FieldType }
 * VariantMap = { [variantName]: FieldMap }
 * FieldType = String | RegExp | ImportPlaceholder
 *
 * AST Processing Types:
 * -------------------
 * ImportInfo = { source: String, specifiers: [ImportSpecifier] }
 * ImportSpecifier = { type: String, imported: String, local: String }
 * FunctionInfo = { typeName: String, functionName: String, node: ASTNode, sourceCode: String }
 * ImportPlaceholder = { __importPlaceholder: true, source: String, localName: String }
 *
 * Parse Result:
 * ------------
 * ParseResult = {
 *   typeDefinition: TypeDefinition,
 *   imports: [ImportInfo],
 *   functions: [FunctionInfo],
 *   sourceContent: String
 * }
 *
 * Proper Tagged Type Definitions:
 * ------------------------------
 * See ./types/ directory for the actual tagged type definitions of these types:
 * - ./types/TypeDefinition.type.js - TaggedSum for TypeDefinition union
 * - ./types/FieldType.type.js - TaggedSum for FieldType union
 * - ./types/ParseResult.type.js - Tagged type for ParseResult
 * - ./types/ImportInfo.type.js - Tagged type for ImportInfo
 * - ./types/FunctionInfo.type.js - Tagged type for FunctionInfo
 *
 * Generated types are available in ./generated/ for production use.
 * This is "eating our own dog food" - using our type system to define itself!
 */
const validateTypeDefinition = typeDefinition => {
    if (!typeDefinition || typeof typeDefinition !== 'object') throw new Error('Type definition must be an object')

    const { name, kind } = typeDefinition

    if (!name || typeof name !== 'string') throw new Error('Type definition must have a string name')
    if (!kind || !['tagged', 'taggedSum'].includes(kind))
        throw new Error(`Type definition kind must be 'tagged' or 'taggedSum', got: ${kind}`)
    if (kind === 'tagged') return validateTaggedType(typeDefinition)
    if (kind === 'taggedSum') return validateTaggedSumType(typeDefinition)

    return typeDefinition
}

/*
 * Validate tagged type definition
 * @sig validateTaggedType :: TypeDefinition -> TypeDefinition | throws Error
 */
const validateTaggedType = typeDefinition => {
    const { name, fields } = typeDefinition
    if (!fields || typeof fields !== 'object') throw new Error('Tagged type definition must have fields object')
    validateFieldMap(fields, `${name}.fields`)
    return typeDefinition
}

/*
 * Validate tagged sum type definition
 * @sig validateTaggedSumType :: TypeDefinition -> TypeDefinition | throws Error
 */
const validateTaggedSumType = typeDefinition => {
    const { name, variants } = typeDefinition
    if (!variants || typeof variants !== 'object')
        throw new Error('TaggedSum type definition must have variants object')
    validateVariantMap(variants, `${name}.variants`)
    return typeDefinition
}

/*
 * Validate a map of field names to field types
 * @sig validateFieldMap :: (FieldMap, String) -> void | throws Error
 */
const validateFieldMap = (fields, context) => {
    const fieldNames = Object.keys(fields)

    // Allow empty field maps for unit variants (e.g., Nil: {})
    if (fieldNames.length === 0) return

    fieldNames.map(fieldName => validateFieldInMap(fieldName, fields[fieldName], context))
}

/*
 * Validate a single field in a field map
 * @sig validateFieldInMap :: (String, FieldType, String) -> void | throws Error
 */
const validateFieldInMap = (fieldName, fieldType, context) => {
    if (!fieldName || typeof fieldName !== 'string') throw new Error(`Invalid field name in ${context}: ${fieldName}`)
    if (!isValidFieldType(fieldType)) throw new Error(`Invalid field type for ${context}.${fieldName}: ${fieldType}`)
}

/*
 * Validate a map of variant names to field maps
 * @sig validateVariantMap :: (VariantMap, String) -> void | throws Error
 */
const validateVariantMap = (variants, context) => {
    const variantNames = Object.keys(variants)

    if (variantNames.length === 0) throw new Error(`TaggedSum type must have at least one variant in ${context}`)

    variantNames.map(variantName => validateVariantInMap(variantName, variants[variantName], context))
}

/*
 * Validate a single variant in a variant map
 * @sig validateVariantInMap :: (String, FieldMap, String) -> void | throws Error
 */
const validateVariantInMap = (variantName, variantFields, context) => {
    if (!variantName || typeof variantName !== 'string')
        throw new Error(`Invalid variant name in ${context}: ${variantName}`)
    if (typeof variantFields !== 'object') throw new Error(`Variant ${context}.${variantName} must have fields object`)
    validateFieldMap(variantFields, `${context}.${variantName}`)
}

/*
 * Check if a value is a valid field type
 * @sig isValidFieldType :: Any -> Boolean
 */
const isValidFieldType = fieldType => {
    if (typeof fieldType === 'string') return true
    if (fieldType instanceof RegExp) return true
    if (typeof fieldType === 'object' && fieldType !== null) return true // Handle complex field type objects (from imports)
    return false
}

/*
 * Extract import information from ImportDeclaration AST node
 * @sig extractImportInfo :: ASTNode -> ImportInfo
 */
const extractImportInfo = node => ({
    source: node.source.value,
    specifiers: node.specifiers.map(spec => ({
        type: spec.type, // ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier
        imported: spec.imported?.name || 'default',
        local: spec.local.name,
    })),
})

/*
 * Extract type definition from export declaration
 * @sig extractTypeDefinition :: (ASTNode, [ImportInfo]) -> TypeDefinition | null
 */
const extractTypeDefinition = (node, imports) => {
    const declaration = node.declaration.declarations[0]
    if (!declaration || declaration.type !== 'VariableDeclarator') return null

    const typeName = declaration.id.name
    const init = declaration.init

    if (init?.type !== 'ObjectExpression') return null

    const typeDefinition = { name: typeName }

    // Convert AST object to plain object, resolving imports
    init.properties.map(prop => {
        if (prop.type === 'Property' && prop.key.type === 'Identifier')
            typeDefinition[prop.key.name] = resolvePropertyValue(prop.value, imports)
        return prop
    })

    return typeDefinition
}

/*
 * Extract function information from assignment expressions
 * @sig extractFunctionInfo :: (ASTNode, String) -> FunctionInfo | null
 */
const extractFunctionInfo = (node, expectedTypeName) => {
    const left = node.left
    if (left.object?.type === 'Identifier' && left.property?.type === 'Identifier') {
        const typeName = left.object.name

        // Only extract functions that belong to our type
        if (!expectedTypeName || typeName === expectedTypeName)
            return { typeName, functionName: left.property.name, node, sourceCode: generate(node) }
    }
    return null
}

/*
 * Extract information from standalone function declarations
 * @sig extractStandaloneFunctionInfo :: (ASTNode, String) -> FunctionInfo | null
 */
const extractStandaloneFunctionInfo = (node, expectedTypeName) =>
    // For now, we don't extract standalone functions unless they clearly reference the type
    // This could be enhanced to analyze the function body for type references
    null

/*
 * Resolve property values in type definitions, handling imports
 * @sig resolvePropertyValue :: (ASTNode, [ImportInfo]) -> Any
 */
const resolvePropertyValue = (node, imports) => {
    if (node.type === 'Literal') return node.value
    if (node.type === 'Identifier') return resolveIdentifierValue(node, imports)
    if (node.type === 'MemberExpression') return resolveMemberExpressionValue(node, imports)
    if (node.type === 'ObjectExpression') return resolveObjectExpressionValue(node, imports)

    return null
}

/*
 * Resolve identifier values from imports
 * @sig resolveIdentifierValue :: (ASTNode, [ImportInfo]) -> Any
 */
const resolveIdentifierValue = (node, imports) => {
    // Try to resolve from imports
    const importInfo = imports.find(imp => imp.specifiers.some(spec => spec.local === node.name))
    if (importInfo) return resolveImportValue(node.name, importInfo)
    return node.name
}

/*
 * Resolve member expression values
 * @sig resolveMemberExpressionValue :: (ASTNode, [ImportInfo]) -> Any
 */
const resolveMemberExpressionValue = (node, imports) => {
    const fieldType = { __fieldTypesReference: true, source: '@graffio/types' }

    const object = resolvePropertyValue(node.object, imports)
    const property = node.property.name

    // Special handling for FieldTypes.X; preserve FieldTypes.X in the output
    if (node.object.name === 'FieldTypes') return { ...fieldType, property, fullReference: `FieldTypes.${property}` }

    // special handling for A.B (eg. replace StringType.Id with the actual regex for UUID)
    if (object) return object?.[property]

    throw new Error(`Don't understand ${JSON.stringify(object)} node: ${JSON.stringify(node)}!`)
}

/*
 * Resolve object expression values
 * @sig resolveObjectExpressionValue :: (ASTNode, [ImportInfo]) -> Object
 */
const resolveObjectExpressionValue = (node, imports) => {
    const result = {}
    node.properties.map(prop => {
        if (prop.type === 'Property') {
            result[prop.key.name] = resolvePropertyValue(prop.value, imports)
        }
        return prop
    })
    return result
}

/*
 * Resolve import values for known modules
 * @sig resolveImportValue :: (String, ImportInfo) -> Any
 */
const resolveImportValue = (localName, importInfo) => {
    // Handle known imports
    if (importInfo.source === './string-types.js') {
        // For StringTypes, return regex objects for validation
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        return { Id: uuidRegex }
    }

    // For other imports, return a placeholder that will be handled during generation
    return { __importPlaceholder: true, source: importInfo.source, localName }
}

/*
 * Parse a .type.js file using AST parsing and extract type definition + functions
 * @sig parseTypeDefinitionFile :: String -> { typeDefinition: TypeDefinition, imports: [ImportInfo], functions: [FunctionInfo] }
 */
const parseTypeDefinitionFile = filePath => {
    try {
        const content = fs.readFileSync(filePath, 'utf8')
        const ast = parse(content, { ecmaVersion: 'latest', sourceType: 'module' })

        const result = { typeDefinition: null, imports: [], functions: [], sourceContent: content }

        // Walk the AST to extract information
        walk(ast, {
            enter(node) {
                // Extract imports
                if (node.type === 'ImportDeclaration') result.imports.push(extractImportInfo(node))

                // Extract type definition export
                if (node.type === 'ExportNamedDeclaration' && node.declaration?.type === 'VariableDeclaration') {
                    const typeDefinition = extractTypeDefinition(node, result.imports)
                    if (typeDefinition) result.typeDefinition = typeDefinition
                }

                // Extract functions that reference the type (property assignments)
                if (node.type === 'AssignmentExpression' && node.left?.type === 'MemberExpression') {
                    const functionInfo = extractFunctionInfo(node, result.typeDefinition?.name)
                    if (functionInfo) result.functions.push(functionInfo)
                }

                // Also extract standalone function declarations that might reference the type
                if (node.type === 'FunctionDeclaration') {
                    const functionInfo = extractStandaloneFunctionInfo(node, result.typeDefinition?.name)
                    if (functionInfo) result.functions.push(functionInfo)
                }
            },
        })

        if (!result.typeDefinition) throw new Error(`No valid type definition export found in ${filePath}`)

        return { ...result, typeDefinition: validateTypeDefinition(result.typeDefinition) }
    } catch (error) {
        throw new Error(`Failed to parse ${filePath}: ${error.message}`)
    }
}

export { parseTypeDefinitionFile }
