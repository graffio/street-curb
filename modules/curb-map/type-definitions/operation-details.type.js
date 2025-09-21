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

OperationDetails.fromFirestore = o =>
    o.match({
        ShellExecution: _ => OperationDetails.from(o),
        FirestoreOperation: _ => OperationDetails.from(o),
        GcpProjectOperation: _ => OperationDetails.from(o),
    })
