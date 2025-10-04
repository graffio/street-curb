/** @module OperationDetails */
/**
 * OperationDetails represents structured technical details for different types of infrastructure operations
 * @sig OperationDetails :: ShellExecution | FirestoreOperation | GcpProjectOperation
 */

// prettier-ignore
export const OperationDetails = {
    name: 'OperationDetails',
    kind: 'taggedSum',
    variants: {
        ShellExecution: {
            command      : 'String',
            duration     : 'Number?',
            outputPreview: 'String?'
        },
        FirestoreOperation: {
            operation    : 'String',
            collection   : 'String',
            documentId   : 'String?',
        },
        GcpProjectOperation: {
            projectId    : 'String',
            folderId     : 'String?',
            region       : 'String?'
        }
    }
}

OperationDetails.toFirestore = o =>
    o.match({
        ShellExecution: _ => JSON.stringify(o),
        FirestoreOperation: _ => JSON.stringify(o),
        GcpProjectOperation: _ => JSON.stringify(o),
    })

OperationDetails.fromFirestore = o => {
    if (o['@@tagName'] === 'ShellExecution') return OperationDetails.ShellExecution.from(o)
    if (o['@@tagName'] === 'FirestoreOperation') return OperationDetails.FirestoreOperation.from(o)
    if (o['@@tagName'] === 'GcpProjectOperation') return OperationDetails.GcpProjectOperation.from(o)

    throw new Error(`Unrecognized operation detail ${o['@@tagName']}`)
}
