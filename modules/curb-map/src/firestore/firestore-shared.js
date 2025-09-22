const CollectionPaths = { AuditRecord: { InfrastructurePath: 'infrastructure-audit-logs' } }

/*
 * Throw an error wrapping another error
 *
 * { message: String, wrappedException: Error, additionaData: * }
 */
// @sig throwWithOriginal :: (String, Error, Any) -> throws
const throwWithOriginal = (message, wrappedException, additionalData) => {
    const e = new Error(message)
    e.wrappedException = wrappedException
    e.additionalData = additionalData
    throw e
}

export { CollectionPaths, throwWithOriginal }
