// ABOUTME: Mock member data for user management component testing
// ABOUTME: Generates LookupTable of Member objects with various roles and states

import { LookupTable } from '@graffio/functional'
import { Member } from '../../src/types/member.js'

/**
 * Generate mock member data for testing
 * @sig generateMockMembers :: () -> LookupTable<Member>
 */

// prettier-ignore
const generateMockMembers = () =>
    LookupTable(
        [
            Member.from({ userId: 'usr_alice0000001', displayName: 'Alice Admin'      , role: 'admin' , addedAt: new Date('2024-01-01'), addedBy: 'usr_system000000', }),
            Member.from({ userId: 'usr_bob000000002', displayName: 'Bob Member'       , role: 'member', addedAt: new Date('2024-01-15'), addedBy: 'usr_alice0000001', }),
            Member.from({ userId: 'usr_carol0000003', displayName: 'Carol Viewer'     , role: 'viewer', addedAt: new Date('2024-02-01'), addedBy: 'usr_alice0000001', }),
            Member.from({ userId: 'usr_dave00000004', displayName: 'Dave Former-Admin', role: 'admin' , addedAt: new Date('2023-12-01'), addedBy: 'usr_system000000', removedAt: new Date('2024-03-01'), removedBy: 'usr_alice0000001', }),
            Member.from({ userId: 'usr_eve000000005', displayName: 'Eve Former-Member', role: 'member', addedAt: new Date('2024-01-20'), addedBy: 'usr_alice0000001', removedAt: new Date('2024-02-15'), removedBy: 'usr_alice0000001', }),
            Member.from({ userId: 'usr_frank0000006', displayName: 'Frank Admin'      , role: 'admin' , addedAt: new Date('2024-02-10'), addedBy: 'usr_alice0000001', }),
            Member.from({ userId: 'usr_grace0000007', displayName: 'Grace Member'     , role: 'member', addedAt: new Date('2024-02-20'), addedBy: 'usr_alice0000001', }),
            Member.from({ userId: 'usr_hank00000008', displayName: 'Hank Viewer'      , role: 'viewer', addedAt: new Date('2024-03-01'), addedBy: 'usr_frank0000006', }),
            Member.from({ userId: 'usr_ivy000000009', displayName: 'Ivy Member'       , role: 'member', addedAt: new Date('2024-03-05'), addedBy: 'usr_alice0000001', }),
            Member.from({ userId: 'usr_jack00000010', displayName: 'Jack Forgotten'   , role: 'member', addedAt: new Date('2024-01-10'), addedBy: 'usr_alice0000001', removedAt: new Date('2024-03-10'), removedBy: 'usr_jack00000010', }),
        ],
        Member,
        'userId',
    )

export { generateMockMembers }
