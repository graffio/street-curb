// ABOUTME: AST-based parser for .type.js files
// ABOUTME: Extracts type definitions, imports, and attached functions using acorn

import { compact } from '@graffio/functional'
import { parse } from 'acorn'
import { generate } from 'escodegen'
import { walk } from 'estree-walker'
import fs from 'fs'
import TypeDescriptor from './descriptors/type-descriptor.js'
import { ImportSpecifier } from './types/import-specifier.js'

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
 * ImportPlaceholder = { isImportPlaceholder: Boolean, source: String, localName: String }
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

/**
 * Parse a .type.js file using AST parsing and extract type definition + functions
 * @sig parseTypeDefinitionFile :: String -> ParseResult
 */
const parseTypeDefinitionFile = filePath => {
    /**
     * Validate a type definition object has required structure
     * @sig validateTypeDefinition :: TypeDefinition -> void | throws Error
     */
    const validateTypeDefinition = typeDefinition => {
        /**
         * Validate a single field name and type
         * @sig validateField :: (String, FieldType, String) -> void | throws Error
         */
        const validateField = (fieldName, fieldType, context) => {
            /**
             * Check if a value is a valid field type (string, regex, or import placeholder object)
             * @sig isValidFieldType :: Any -> Boolean
             */
            const isValidFieldType = ft =>
                typeof ft === 'string' || ft instanceof RegExp || (typeof ft === 'object' && ft !== null)

            if (!fieldName || typeof fieldName !== 'string')
                throw new Error(`Invalid field name in ${context}: ${fieldName}`)
            if (!isValidFieldType(fieldType))
                throw new Error(`Invalid field type for ${context}.${fieldName}: ${fieldType}`)
        }

        /**
         * Validate fields for a tagged type
         * @sig validateTaggedFields :: (FieldMap, String) -> void | throws Error
         */
        const validateTaggedFields = (fields, name) => {
            if (!fields || typeof fields !== 'object') throw new Error('Tagged type definition must have fields object')
            Object.entries(fields).map(([k, v]) => validateField(k, v, `${name}.fields`))
        }

        /**
         * Validate a single variant in a taggedSum type
         * @sig validateVariant :: (String, FieldMap, String) -> void | throws Error
         */
        const validateVariant = (variantName, variantFields, typeName) => {
            if (!variantName || typeof variantName !== 'string') throw new Error(`Invalid variant name: ${variantName}`)
            if (typeof variantFields !== 'object')
                throw new Error(`Variant ${typeName}.${variantName} must have fields object`)
            Object.entries(variantFields).forEach(([k, v]) => validateField(k, v, `${typeName}.${variantName}`))
        }

        /**
         * Validate variants for a taggedSum type
         * @sig validateTaggedSumVariants :: (VariantMap, String) -> void | throws Error
         */
        const validateTaggedSumVariants = (variants, name) => {
            if (!variants || typeof variants !== 'object')
                throw new Error('TaggedSum type definition must have variants object')
            const entries = Object.entries(variants)
            if (entries.length === 0) throw new Error(`TaggedSum type must have at least one variant`)
            entries.forEach(([variantName, variantFields]) => validateVariant(variantName, variantFields, name))
        }

        if (!typeDefinition || typeof typeDefinition !== 'object') throw new Error('Type definition must be an object')

        const { name, kind, fields, variants } = typeDefinition

        if (!name || typeof name !== 'string') throw new Error('Type definition must have a string name')
        if (kind === 'tagged') return validateTaggedFields(fields, name)
        if (kind === 'taggedSum') return validateTaggedSumVariants(variants, name)
        throw new Error(`Type definition kind must be 'tagged' or 'taggedSum', got: ${kind}`)
    }

    /**
     * Extract import information from ImportDeclaration AST node
     * @sig extractImportInfo :: ASTNode -> ImportInfo
     */
    const extractImportInfo = node => {
        /**
         * Convert AST import specifier to ImportSpecifier tagged type
         * @sig specifierToInfo :: ASTSpecifier -> ImportSpecifier
         */
        const specifierToInfo = spec => {
            const { type, local, imported } = spec
            const { name: localName } = local
            if (type === 'ImportDefaultSpecifier') return ImportSpecifier.Default(localName)
            if (type === 'ImportNamespaceSpecifier') return ImportSpecifier.Namespace(localName)
            return ImportSpecifier.Named(imported.name, localName)
        }

        return { source: node.source.value, specifiers: node.specifiers.map(specifierToInfo) }
    }

    /**
     * Extract type definition from export declaration, resolving imports
     * @sig extractTypeDefinition :: (ASTNode, [ImportInfo]) -> TypeDefinition | throws Error
     */
    const extractTypeDefinition = (exportNode, imps) => {
        const resolveImportValue = (localName, importInfo) => ({
            isImportPlaceholder: true,
            source: importInfo.source,
            localName,
        })

        /**
         * Assign a property from AST node to target object
         * @sig assignProperty :: Object -> ASTProperty -> void
         */
        const assignProperty = target => prop => {
            const { type, key, value } = prop
            const { type: keyType, name: keyName } = key
            if (type !== 'Property') throw new Error(`Expected Property, got ${type}`)
            if (keyType !== 'Identifier') throw new Error(`Computed property keys not supported: ${keyType}`)
            target[keyName] = resolvePropertyValue(value)
        }

        /**
         * Resolve AST property node to field type value
         * @sig resolvePropertyValue :: ASTNode -> FieldType
         */
        const resolvePropertyValue = propNode => {
            const resolveIdentifier = pn => {
                const importInfo = imps.find(i => i.specifiers.some(spec => spec.local === pn.name))
                return importInfo ? resolveImportValue(pn.name, importInfo) : pn.name
            }

            /**
             * Resolve member expression (e.g., FieldTypes.Id or importedObj.prop)
             * @sig resolveMemberExpression :: ASTNode -> FieldType
             */
            const resolveMemberExpression = pn => {
                const fieldType = { isFieldTypesReference: true, source: '@graffio/types' }
                const object = resolvePropertyValue(pn.object)
                const property = pn.property.name

                // special case: FieldTypes.x
                if (pn.object.name === 'FieldTypes')
                    return { ...fieldType, property, fullReference: `FieldTypes.${property}` }

                if (!object[property]) throw new Error(`Cannot resolve ${pn.object.name}.${property}`)
                return object[property]
            }

            const resolveObject = pn => {
                const result = {}
                pn.properties.map(assignProperty(result))
                return result
            }

            const { type, value } = propNode

            if (type === 'Literal') return value
            if (type === 'Identifier') return resolveIdentifier(propNode)
            if (type === 'MemberExpression') return resolveMemberExpression(propNode)
            if (type === 'ObjectExpression') return resolveObject(propNode)

            throw new Error(`Unsupported AST node type in type definition: ${type}`)
        }

        const declaration = exportNode.declaration.declarations[0]
        if (!declaration || declaration.type !== 'VariableDeclarator')
            throw new Error(`Expected VariableDeclarator, got ${declaration?.type}`)

        const typeDef = { name: declaration.id.name }
        declaration.init.properties.map(assignProperty(typeDef))
        return typeDef
    }

    /**
     * Extract function information for T.f = () => {}; if the typeName doesn't match T.f, skip it
     * @sig handlePotentialAddedFunction :: (ASTNode, String) -> FunctionInfo | null
     */
    const handlePotentialAddedFunction = (node, expectedTypeName) => {
        const { left } = node
        if (left.object?.type !== 'Identifier' || left.property?.type !== 'Identifier') return null

        const typeName = left.object.name
        return typeName === expectedTypeName // T.f = () => {} must match expectedTypeName T
            ? { typeName, functionName: left.property.name, node, sourceCode: generate(node) }
            : null
    }

    /**
     * Handle export declaration that may contain a type definition
     * @sig handleTypeDeclarationNode :: ASTNode -> void
     */
    const handleTypeDeclarationNode = node => {
        const init = node.declaration.declarations[0]?.init
        if (init?.type !== 'ObjectExpression') return
        if (typeDef) throw new Error(`Multiple type definitions found`)
        typeDef = extractTypeDefinition(node, imports)
    }

    /**
     * Route AST nodes to appropriate handlers during tree walk
     * @sig handleNode :: ASTNode -> void
     */
    const handleNode = node => {
        const { type } = node
        const isTypeDeclaration = type === 'ExportNamedDeclaration' && node.declaration?.type === 'VariableDeclaration'
        const mightBeAddedFunction = type === 'AssignmentExpression' && node.left?.type === 'MemberExpression'

        if (type === 'ImportDeclaration') imports.push(extractImportInfo(node))
        if (isTypeDeclaration) handleTypeDeclarationNode(node)
        if (mightBeAddedFunction && typeDef) functions.push(handlePotentialAddedFunction(node, typeDef.name))
    }

    let typeDef = null
    const imports = []
    const functions = []

    try {
        const sourceContent = fs.readFileSync(filePath, 'utf8')
        walk(parse(sourceContent, { ecmaVersion: 'latest', sourceType: 'module' }), { enter: handleNode })

        if (!typeDef) throw new Error(`No valid type definition export found in ${filePath}`)
        validateTypeDefinition(typeDef)

        // Normalize to TypeDescriptor with all fields converted to FieldDescriptor
        const parseResult = { typeDefinition: typeDef, imports, functions: compact(functions) }
        const descriptor = TypeDescriptor.normalize(parseResult)

        // Add sourceContent for backward compatibility (not part of TypeDescriptor schema)
        return { ...descriptor, sourceContent }
    } catch (error) {
        throw new Error(`Failed to parse ${filePath}: ${error.message}`)
    }
}

/**
 * Get list of standard functions that exist in the type definition
 * @sig getExistingStandardFunctions :: [FunctionInfo] -> [String]
 */
const getExistingStandardFunctions = functions => {
    /**
     * Check if a function name is a "standard" generated function
     * @sig isStandardFunction :: String -> Boolean
     */
    const isStandardFunction = functionName => {
        const standardFunctions = [
            'from',
            'is',
            'toString',
            'toFirestore',
            'fromFirestore',
            '_from',
            '_toFirestore',
            '_fromFirestore',
        ]
        return standardFunctions.includes(functionName)
    }

    return functions.filter(fn => isStandardFunction(fn.functionName)).map(fn => fn.functionName)
}

export { parseTypeDefinitionFile, getExistingStandardFunctions }
