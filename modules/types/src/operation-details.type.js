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
