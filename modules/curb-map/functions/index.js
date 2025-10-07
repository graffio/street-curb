import admin from 'firebase-admin'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { handleQueueItemAdded } from './src/index.js'

if (!admin.apps.length) admin.initializeApp()

const processUpdateQueue = onDocumentWritten('tests/{namespace}/queueItems/{queueItemId}', handleQueueItemAdded)

export { processUpdateQueue }
