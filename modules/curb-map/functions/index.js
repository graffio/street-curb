import admin from 'firebase-admin'
import { submitActionRequest } from './src/index.js'

if (!admin.apps.length) admin.initializeApp()

export { submitActionRequest }
