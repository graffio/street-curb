// ABOUTME: OperationDetails TaggedSum type definition for curb-map
// ABOUTME: Structured technical details for infrastructure ops: shell, Firestore, or GCP project operations
/** @module OperationDetails */
/**
 * OperationDetails represents structured technical details for different types of infrastructure operations
 * @sig OperationDetails :: ShellExecution | FirestoreOperation | GcpProjectOperation
 */

// prettier-ignore
export const OperationDetails = {
    name: 'OperationDetails',
    kind: 'taggedSum',
    firestore: true,
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
