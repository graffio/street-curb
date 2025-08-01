import { tap } from '@qt/test-helpers'
import { reindent } from '../../index.js'

const s = `
            function organizationMember() { return exists(/databases/$(database)/documents/organizations/$(organizationId)/participants/$(request.auth.token.userId)); }
        
            function canCreateOrganization() {
                let organizationAlreadyExists = exists(/databases/$(database)/documents/organizations/$(organizationId));
                let isPlanBasic = 'Basic' == request.resource.data.get('plan', '');
                let hasNoProjects = request.resource.data.get('projects', []).size() == 0;
                let userIsVerified =  request.auth.token.email_verified && ('userId' in request.auth.token);
        
                return true
                    && userIsVerified
                    && (!organizationAlreadyExists)
                    && isPlanBasic
                    && hasNoProjects
                    ;
            }
        
            function canRead()   { return organizationMember();    }
            function canCreate() { return canCreateOrganization(); }
            function canUpdate() { return organizationMember();    }`

const expected = `--
--function organizationMember() { return exists(/databases/$(database)/documents/organizations/$(organizationId)/participants/$(request.auth.token.userId)); }
--
--function canCreateOrganization() {
--    let organizationAlreadyExists = exists(/databases/$(database)/documents/organizations/$(organizationId));
--    let isPlanBasic = 'Basic' == request.resource.data.get('plan', '');
--    let hasNoProjects = request.resource.data.get('projects', []).size() == 0;
--    let userIsVerified =  request.auth.token.email_verified && ('userId' in request.auth.token);
--
--    return true
--        && userIsVerified
--        && (!organizationAlreadyExists)
--        && isPlanBasic
--        && hasNoProjects
--        ;
--}
--
--function canRead()   { return organizationMember();    }
--function canCreate() { return canCreateOrganization(); }
--function canUpdate() { return organizationMember();    }`

const tests = {
    [`Given multiline string s with minimum 12 character indentations`]: {
        [`When I call reindent('--', s)`]: t => {
            const actual = reindent('--', s)
            t.sameR(`Then I should get each line of the output should be prefixed with only '--'`, actual, expected)
        },
    },
}

tap.describeTests({ reindent: tests })
