// ABOUTME: Manages Firestore listener lifecycle for real-time data synchronization
// ABOUTME: Handles User bootstrap, Organization listener, and Project-scoped Blockfaces listener

import { getAuth } from 'firebase/auth'
import { post } from '../commands/index.js'
import { possiblyAutoLogin } from '../config/index.js'
import { Action, Blockface, Organization, Project, User } from '../types/index.js'
import { FirestoreClientFacade } from './firestore-client-facade.js'

// Module-level state: only cleanup functions and last-known projectId for change detection
let organizationUnsubscribe = null
let blockfacesUnsubscribe = null
let lastProjectId = null

// Unsubscribe from organization listener and clear reference
// @sig cleanupOrganizationListener :: () -> void
const cleanupOrganizationListener = () => {
    if (organizationUnsubscribe) {
        organizationUnsubscribe()
        organizationUnsubscribe = null
    }
}

// Unsubscribe from blockfaces listener and clear reference
// @sig cleanupBlockfacesListener :: () -> void
const cleanupBlockfacesListener = () => {
    if (blockfacesUnsubscribe) {
        blockfacesUnsubscribe()
        blockfacesUnsubscribe = null
    }
}

// Handle blockfaces collection updates from Firestore listener
// Dispatches BlockfacesSynced action to Redux
// @sig handleBlockfacesUpdate :: ([Blockface], Error?) -> void
const handleBlockfacesUpdate = (blockfaces, error) => {
    if (error) return console.error('Blockfaces listener error:', error)
    post(Action.BlockfacesSynced(blockfaces))
}

// Set up real-time listener for blockfaces collection
// Cleans up previous listener, creates new facade for nested path, starts listening
// @sig setupBlockfacesListener :: (String, String) -> void
const setupBlockfacesListener = (organizationId, projectId) => {
    cleanupBlockfacesListener()

    const blockfacesFacade = FirestoreClientFacade(Organization)
        .descendant(organizationId, Project)
        .descendant(projectId, Blockface)

    blockfacesUnsubscribe = blockfacesFacade.listenToCollection([], handleBlockfacesUpdate)
    lastProjectId = projectId
}

// Handle organization document updates from Firestore listener
// Dispatches OrganizationSynced and sets up blockfaces listener if project changed
// @sig handleOrganizationUpdate :: (Organization, Error?) -> void
const handleOrganizationUpdate = (organization, error) => {
    if (error) return console.error('Organization listener error:', error)

    const newProjectId = organization.defaultProjectId

    // Only setup new blockfaces listener if project changed (or first time)
    if (newProjectId !== lastProjectId) {
        post(Action.OrganizationSynced(organization))
        setupBlockfacesListener(organization.id, newProjectId)
    }
}

// Set up real-time listener for organization document
// Cleans up previous listener, starts listening to organization changes
// @sig setupOrganizationListener :: String -> void
const setupOrganizationListener = organizationId => {
    cleanupOrganizationListener()

    const organizationFacade = FirestoreClientFacade(Organization)
    organizationUnsubscribe = organizationFacade.listenToDocument(organizationId, handleOrganizationUpdate)
}

// Bootstrap: authenticate, load user, dispatch UserLoaded, return organizationId
// One-time read to get user document and extract organization membership
// @sig loadUserAndSelectAnOrganization :: () -> Promise String
const loadUserAndSelectAnOrganization = async () => {
    await possiblyAutoLogin()

    const { currentUser: authUser } = getAuth()
    if (!authUser) throw new Error('No authenticated user')

    const currentUser = await FirestoreClientFacade(User).read(authUser.uid)
    const organizationId = currentUser.organizations?.[0].organizationId
    if (!organizationId) throw new Error('User has no organizations')

    post(Action.UserLoaded(currentUser))

    return organizationId
}

// Initialize all Firestore listeners for the application
// Loads user, sets up organization listener (which triggers blockfaces listener)
// @sig initializeListeners :: () -> Promise void
const initializeListeners = async () => {
    const organizationId = await loadUserAndSelectAnOrganization()
    setupOrganizationListener(organizationId)
}

// Clean up all active Firestore listeners
// Called on app unmount to prevent memory leaks
// @sig cleanupListeners :: () -> void
const cleanupListeners = () => {
    cleanupOrganizationListener()
    cleanupBlockfacesListener()
}

export { initializeListeners, cleanupListeners }
