export default {
    organizationId: '404973578720',
    developmentFolderId: '464059598701',
    billingAccountId: '0127B8-824540-F55374',
    firebaseProject: { projectId: 'curb-map-development', displayName: 'curb-map-development' },
    bootstrapServiceAccount: {
        projectId: 'curbmap-automation-admin',
        id: 'bootstrap-migrator',
        displayName: 'Bootstrap Migrator',
        keyEnvVar: 'BOOTSTRAP_SA_KEY_PATH',
        recommendedKeyPath: '$HOME/.config/curbmap/bootstrap-service-account.json',
        folders: ['464059598701'],
        roles: [
            'roles/resourcemanager.projectCreator',
            'roles/serviceusage.serviceUsageAdmin',
            'roles/billing.projectManager',
        ],
        impersonatorPrincipals: ['user:admin@curbmap.app'],
    },
    infrastructureServiceAccount: {
        id: 'firebase-infrastructure-sa',
        displayName: 'Firebase Infrastructure Management',
        roles: ['roles/firebase.admin', 'roles/datastore.owner', 'roles/serviceusage.serviceUsageConsumer'],
        keyDirectory: 'service-accounts',
        keyFileEnvVar: 'INFRA_SA_KEY_PATH',
    },
}
