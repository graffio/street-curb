export default {
    organizationId: '404973578720',
    developmentFolderId: '464059598701',
    billingAccountId: '0127B8-824540-F55374',
    firebaseProject: { projectId: 'temporary-20250922-114452', displayName: 'temporary-20250922-114452' },
    firebaseProjectNumber: '998682469532',
    bootstrapServiceAccount: {
        projectId: 'curbmap-automation-admin',
        id: 'bootstrap-migrator',
        displayName: 'Bootstrap Migrator',
        keyEnvVar: 'BOOTSTRAP_SA_KEY_PATH',
        recommendedKeyPath: '$HOME/.config/curbmap/bootstrap-service-account.json',
        roles: [
            'roles/resourcemanager.projectCreator',
            'roles/serviceusage.serviceUsageAdmin',
            'roles/billing.projectManager',
        ],
    },
}
