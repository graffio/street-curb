// ABOUTME: Integration tests for role-based access control (RBAC)
// ABOUTME: Tests admin, member, viewer permissions and removed member access

import t from 'tap'
import { Action, FieldTypes } from '../../src/types/index.js'
import { asSignedInUser, asSignedInUserWithRole } from '../integration-test-helpers/auth-emulator.js'
import { submitActionRequest } from '../integration-test-helpers/http-submit-action.js'
import {
    addMember,
    createOrganization,
    createUser,
    readOrganization,
    removeMember,
} from '../integration-test-helpers/test-helpers.js'

const { test } = t

test('Given RBAC permissions', t => {
    t.test('When viewer tries admin action Then HTTP 401 unauthorized', async t => {
        await asSignedInUserWithRole('viewer-admin-action', 'viewer', async ctx => {
            const { namespace, token, organizationId } = ctx

            // Try to add a member (admin-only action)
            const newUserId = FieldTypes.newUserId()
            const action = Action.MemberAdded.from({ userId: newUserId, role: 'member', displayName: 'New Member' })
            const result = await submitActionRequest({ action, namespace, token, organizationId })

            t.equal(result.status, 401, 'Then HTTP status is 401')
            t.match(result.data, /may not perform/, 'Then error indicates insufficient permissions')
        })
        t.end()
    })

    t.test('When member tries admin action Then HTTP 401 unauthorized', async t => {
        await asSignedInUserWithRole('member-admin-action', 'member', async ctx => {
            const { namespace, token, organizationId } = ctx

            // Try to add a member (admin-only action)
            const newUserId = FieldTypes.newUserId()
            const action = Action.MemberAdded.from({ userId: newUserId, role: 'member', displayName: 'New Member' })
            const result = await submitActionRequest({ action, namespace, token, organizationId })

            t.equal(result.status, 401, 'Then HTTP status is 401')
            t.match(result.data, /may not perform/, 'Then error indicates insufficient permissions')
        })
        t.end()
    })

    t.test('When admin performs admin action Then succeeds', async t => {
        await asSignedInUserWithRole('admin-admin-action', 'admin', async ctx => {
            const { namespace, token, organizationId } = ctx

            // Create a new user first
            const newUserId = FieldTypes.newUserId()
            await createUser({ namespace, token, userId: newUserId, displayName: 'New User' })

            // Add member (admin-only action)
            const action = Action.MemberAdded.from({ userId: newUserId, role: 'member', displayName: 'New User' })
            const result = await submitActionRequest({ action, namespace, token, organizationId })

            t.equal(result.status, 200, 'Then HTTP status is 200')
            t.same(result.data, { status: 'completed' }, 'Then response is Success')

            const org = await readOrganization({ namespace, organizationId })
            t.ok(org.members[newUserId], 'Then member was added to organization')
        })
        t.end()
    })

    t.test('When removed member tries to access organization Then HTTP 401 unauthorized', async t => {
        await asSignedInUser('removed-member', async ctx => {
            const { namespace, token, actorUserId } = ctx

            // Create organization and add actor as member
            const { organizationId } = await createOrganization({ namespace, token, name: 'Test Org' })

            // Add a second admin so we can remove the first
            const secondAdminId = FieldTypes.newUserId()
            await createUser({ namespace, token, userId: secondAdminId, displayName: 'Second Admin' })
            await addMember({
                namespace,
                token,
                userId: secondAdminId,
                organizationId,
                role: 'admin',
                displayName: 'Second Admin',
            })

            // Remove the actor
            await removeMember({ namespace, token, userId: actorUserId, organizationId })

            // Try to access organization
            const action = Action.OrganizationUpdated.from({ name: 'Updated Name' })
            const result = await submitActionRequest({ action, namespace, token, organizationId })

            t.equal(result.status, 401, 'Then HTTP status is 401')
            t.match(result.data, /Access denied/, 'Then error indicates access denied')
        })
        t.end()
    })

    t.test('When viewer reads data Then succeeds', async t => {
        await asSignedInUserWithRole('viewer-read', 'viewer', async ctx => {
            const { namespace, projectId } = ctx

            // Viewer should be able to read organization data
            const org = await readOrganization({ namespace, organizationId: ctx.organizationId, projectId })
            t.ok(org, 'Then viewer can read organization')
            t.equal(org.id, ctx.organizationId, 'Then organization ID matches')
        })
        t.end()
    })

    t.test('When member edits data Then succeeds', async t => {
        await asSignedInUserWithRole('member-edit', 'member', async ctx => {
            const { namespace, token } = ctx

            // Member should be able to update their own user data
            const action = Action.UserUpdated.from({ userId: ctx.actorUserId, displayName: 'Updated Name' })
            const result = await submitActionRequest({ action, namespace, token })

            t.equal(result.status, 200, 'Then HTTP status is 200')
            t.same(result.data, { status: 'completed' }, 'Then response is Success')
        })
        t.end()
    })

    t.test('When admin changes member role Then member permissions update', async t => {
        await asSignedInUser('admin-role-change', async ctx => {
            const { namespace, token } = ctx

            // Create organization
            const { organizationId } = await createOrganization({ namespace, token, name: 'Test Org' })

            // Create a new member
            const memberId = FieldTypes.newUserId()
            await createUser({ namespace, token, userId: memberId, displayName: 'Member User' })
            await addMember({
                namespace,
                token,
                userId: memberId,
                organizationId,
                role: 'member',
                displayName: 'Member User',
            })

            // Change member to viewer
            const changeRoleAction = Action.RoleChanged.from({ userId: memberId, role: 'viewer' })
            const result = await submitActionRequest({ action: changeRoleAction, namespace, token, organizationId })

            t.equal(result.status, 200, 'Then HTTP status is 200')

            const org = await readOrganization({ namespace, organizationId })
            t.equal(org.members[memberId].role, 'viewer', 'Then member role updated to viewer')
        })
        t.end()
    })

    t.test('When non-member tries to access organization Then HTTP 401 unauthorized', async t => {
        await asSignedInUser('non-member-access', async ctx => {
            const { namespace, token } = ctx

            // Create organization by this user
            await createOrganization({ namespace, token, name: 'Org 1' })

            // Create a different organization ID that doesn't exist
            const nonExistentOrg = FieldTypes.newOrganizationId()

            // Try to access the non-existent organization
            const action = Action.OrganizationUpdated.from({ name: 'Hacked Name' })
            const result = await submitActionRequest({ action, namespace, token, organizationId: nonExistentOrg })

            t.equal(result.status, 401, 'Then HTTP status is 401')
            t.match(result.data, /Access denied/, 'Then error indicates access denied')
        })
        t.end()
    })

    t.test('When admin removes self Then cannot access organization', async t => {
        await asSignedInUser('admin-remove-self', async ctx => {
            const { namespace, token, actorUserId } = ctx

            // Create organization
            const { organizationId } = await createOrganization({ namespace, token, name: 'Test Org' })

            // Add a second admin so we can remove the first
            const secondAdminId = FieldTypes.newUserId()
            await createUser({ namespace, token, userId: secondAdminId, displayName: 'Second Admin' })
            await addMember({
                namespace,
                token,
                userId: secondAdminId,
                organizationId,
                role: 'admin',
                displayName: 'Second Admin',
            })

            // Admin removes themselves
            await removeMember({ namespace, token, userId: actorUserId, organizationId })

            // Try to access organization
            const action = Action.OrganizationUpdated.from({ name: 'Updated Name' })
            const result = await submitActionRequest({ action, namespace, token, organizationId })

            t.equal(result.status, 401, 'Then HTTP status is 401')
            t.match(result.data, /Access denied/, 'Then error indicates access denied')
        })
        t.end()
    })

    t.test('When viewer tries to edit organization Then HTTP 401 unauthorized', async t => {
        await asSignedInUserWithRole('viewer-edit-org', 'viewer', async ctx => {
            const { namespace, token, organizationId } = ctx

            // Try to update organization (admin-only)
            const action = Action.OrganizationUpdated.from({ name: 'Updated Name' })
            const result = await submitActionRequest({ action, namespace, token, organizationId })

            t.equal(result.status, 401, 'Then HTTP status is 401')
            t.match(result.data, /may not perform/, 'Then error indicates insufficient permissions')
        })
        t.end()
    })

    t.test('When member tries to change roles Then HTTP 401 unauthorized', async t => {
        await asSignedInUserWithRole('member-change-role', 'member', async ctx => {
            const { namespace, token, organizationId, actorUserId } = ctx

            // Member tries to promote themselves to admin
            const action = Action.RoleChanged.from({ userId: actorUserId, role: 'admin' })
            const result = await submitActionRequest({ action, namespace, token, organizationId })

            t.equal(result.status, 401, 'Then HTTP status is 401')
            t.match(result.data, /may not perform/, 'Then error indicates insufficient permissions')
        })
        t.end()
    })

    t.end()
})
