import admin from 'firebase-admin'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { handleActionRequestAdded } from './src/index.js'

if (!admin.apps.length) admin.initializeApp()

const processActionRequests = onDocumentWritten(
    'tests/{namespace}/actionRequests/{actionRequestId}',
    handleActionRequestAdded,
)

export { processActionRequests }
