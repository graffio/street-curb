# Phase 4: Multi-Tenant Data Model

**Goal**: Implement organization + project hierarchy with data isolation

## Deliverables
- [ ] Organization management (CRUD operations)
- [ ] Project management (CRUD operations)
- [ ] Materialized view generation from events
- [ ] Data isolation middleware
- [ ] Role-based permissions system

## Step 1: Organization Management

### 1.1 Organization Event Types
```javascript
// functions/src/events/organizationEvents.js
const { createUser, updateUser, forgetUser } = require('./queueEvents');

/**
 * Create organization via queue
 * @sig createOrganization :: (Object) -> Promise<String>
 */
const createOrganization = async (organizationData) => {
  return queueEvent('OrganizationCreated', {
    subject: { type: 'organization', id: organizationData.organizationId },
    name: organizationData.name,
    subscription: {
      tier: organizationData.tier || 'basic',
      annualAmount: organizationData.annualAmount || 0,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    },
    settings: {
      ssoEnabled: organizationData.ssoEnabled || false,
      ssoProvider: organizationData.ssoProvider,
      auditLogRetention: 2555 // 7 years
    }
  });
};

/**
 * Update organization via queue
 * @sig updateOrganization :: (String, Object) -> Promise<String>
 */
const updateOrganization = async (organizationId, changes) => {
  return queueEvent('OrganizationUpdated', {
    subject: { type: 'organization', id: organizationId },
    changes
  });
};

/**
 * Delete organization via queue
 * @sig deleteOrganization :: (String, String) -> Promise<String>
 */
const deleteOrganization = async (organizationId, reason) => {
  return queueEvent('OrganizationDeleted', {
    subject: { type: 'organization', id: organizationId },
    reason
  });
};

module.exports = { createOrganization, updateOrganization, deleteOrganization };
```

### 1.2 Organization API Endpoints
```javascript
// functions/src/api/organizations.js
const express = require('express');
const router = express.Router();
const { authenticateUser, requireAdmin } = require('../auth/authMiddleware');
const { createOrganization, updateOrganization, deleteOrganization } = require('../events/organizationEvents');

// Apply authentication to all routes
router.use(authenticateUser);

/**
 * Create new organization
 * @sig createOrganization :: (Request, Response) -> Promise<Void>
 */
router.post('/', async (req, res) => {
  try {
    const { name, tier, annualAmount, ssoEnabled, ssoProvider } = req.body;
    const organizationId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const organizationData = {
      organizationId,
      name,
      tier,
      annualAmount,
      ssoEnabled,
      ssoProvider
    };
    
    const queueId = await createOrganization(organizationData);
    
    // Add creator as admin
    await createUser(organizationId, 'default', {
      firebaseUid: req.user.uid,
      email: req.user.email,
      role: 'admin'
    });
    
    res.status(201).json({ 
      message: 'Organization creation queued',
      organizationId,
      queueId 
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get organization by ID
 * @sig getOrganization :: (Request, Response) -> Promise<Void>
 */
router.get('/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    
    // Check if user has access to this organization
    const hasAccess = await hasPermission(req.user.uid, organizationId, 'read');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const orgDoc = await admin.firestore()
      .collection('organizations')
      .doc(organizationId)
      .get();
    
    if (!orgDoc.exists) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    res.json({
      id: orgDoc.id,
      ...orgDoc.data()
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update organization
 * @sig updateOrganization :: (Request, Response) -> Promise<Void>
 */
router.put('/:organizationId', requireAdmin('organizationId'), async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { changes } = req.body;
    
    const queueId = await updateOrganization(organizationId, changes);
    
    res.json({ 
      message: 'Organization update queued',
      queueId 
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Delete organization
 * @sig deleteOrganization :: (Request, Response) -> Promise<Void>
 */
router.delete('/:organizationId', requireAdmin('organizationId'), async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { reason } = req.body;
    
    const queueId = await deleteOrganization(organizationId, reason);
    
    res.json({ 
      message: 'Organization deletion queued',
      queueId 
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * List user's organizations
 * @sig listOrganizations :: (Request, Response) -> Promise<Void>
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get user's organization roles
    const rolesSnapshot = await admin.firestore()
      .collection('user_organization_roles')
      .where('userId', '==', userId)
      .get();
    
    const organizationIds = rolesSnapshot.docs.map(doc => doc.data().organizationId);
    
    if (organizationIds.length === 0) {
      return res.json([]);
    }
    
    // Get organization details
    const organizationsSnapshot = await admin.firestore()
      .collection('organizations')
      .where(admin.firestore.FieldPath.documentId(), 'in', organizationIds)
      .get();
    
    const organizations = organizationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(organizations);
  } catch (error) {
    console.error('Error listing organizations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

## Step 2: Project Management

### 2.1 Project Event Types
```javascript
// functions/src/events/projectEvents.js
/**
 * Create project via queue
 * @sig createProject :: (String, Object) -> Promise<String>
 */
const createProject = async (organizationId, projectData) => {
  return queueEvent('ProjectCreated', {
    organizationId,
    subject: { type: 'project', id: projectData.projectId },
    name: projectData.name,
    description: projectData.description,
    status: 'active'
  });
};

/**
 * Update project via queue
 * @sig updateProject :: (String, String, Object) -> Promise<String>
 */
const updateProject = async (organizationId, projectId, changes) => {
  return queueEvent('ProjectUpdated', {
    organizationId,
    subject: { type: 'project', id: projectId },
    changes
  });
};

/**
 * Delete project via queue
 * @sig deleteProject :: (String, String, String) -> Promise<String>
 */
const deleteProject = async (organizationId, projectId, reason) => {
  return queueEvent('ProjectDeleted', {
    organizationId,
    subject: { type: 'project', id: projectId },
    reason
  });
};

module.exports = { createProject, updateProject, deleteProject };
```

### 2.2 Project API Endpoints
```javascript
// functions/src/api/projects.js
const express = require('express');
const router = express.Router();
const { authenticateUser, requireAdmin } = require('../auth/authMiddleware');
const { createProject, updateProject, deleteProject } = require('../events/projectEvents');

// Apply authentication to all routes
router.use(authenticateUser);

/**
 * Create new project
 * @sig createProject :: (Request, Response) -> Promise<Void>
 */
router.post('/', requireAdmin('organizationId'), async (req, res) => {
  try {
    const { organizationId, name, description } = req.body;
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const projectData = {
      projectId,
      name,
      description
    };
    
    const queueId = await createProject(organizationId, projectData);
    
    res.status(201).json({ 
      message: 'Project creation queued',
      projectId,
      queueId 
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get project by ID
 * @sig getProject :: (Request, Response) -> Promise<Void>
 */
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { organizationId } = req.query;
    
    // Check if user has access to this organization
    const hasAccess = await hasPermission(req.user.uid, organizationId, 'read');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const projectDoc = await admin.firestore()
      .collection('projects')
      .doc(projectId)
      .get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectData = projectDoc.data();
    
    // Verify project belongs to organization
    if (projectData.organizationId !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      id: projectDoc.id,
      ...projectData
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * List projects in organization
 * @sig listProjects :: (Request, Response) -> Promise<Void>
 */
router.get('/', async (req, res) => {
  try {
    const { organizationId } = req.query;
    
    // Check if user has access to this organization
    const hasAccess = await hasPermission(req.user.uid, organizationId, 'read');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const projectsSnapshot = await admin.firestore()
      .collection('projects')
      .where('organizationId', '==', organizationId)
      .get();
    
    const projects = projectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(projects);
  } catch (error) {
    console.error('Error listing projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update project
 * @sig updateProject :: (Request, Response) -> Promise<Void>
 */
router.put('/:projectId', requireAdmin('organizationId'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { organizationId, changes } = req.body;
    
    const queueId = await updateProject(organizationId, projectId, changes);
    
    res.json({ 
      message: 'Project update queued',
      queueId 
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Delete project
 * @sig deleteProject :: (Request, Response) -> Promise<Void>
 */
router.delete('/:projectId', requireAdmin('organizationId'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { organizationId, reason } = req.body;
    
    const queueId = await deleteProject(organizationId, projectId, reason);
    
    res.json({ 
      message: 'Project deletion queued',
      queueId 
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

## Step 3: Materialized View Generation

### 3.1 Organization View Updates
```javascript
// functions/src/events/organizationViews.js
/**
 * Update organization materialized view
 * @sig updateOrganizationView :: (Object) -> Promise<Void>
 */
const updateOrganizationView = async (event) => {
  const organizationId = event.subject.id;
  
  // Get current organization state from events
  const currentState = await getCurrentOrganizationState(organizationId);
  
  if (currentState) {
    // Update materialized view
    await admin.firestore()
      .collection('organizations')
      .doc(organizationId)
      .set(currentState, { merge: true });
  }
};

/**
 * Calculate current organization state from events
 * @sig getCurrentOrganizationState :: (String) -> Promise<Object|null>
 */
const getCurrentOrganizationState = async (organizationId) => {
  const orgEvents = await admin.firestore()
    .collection('events')
    .where('subject.type', '==', 'organization')
    .where('subject.id', '==', organizationId)
    .orderBy('timestamp', 'asc')
    .get();
    
  let state = null;
  
  for (const eventDoc of orgEvents.docs) {
    const event = eventDoc.data();
    
    switch (event.type) {
      case 'OrganizationCreated':
        state = {
          organizationId: organizationId,
          name: event.data.name,
          subscription: event.data.subscription,
          settings: event.data.settings,
          status: 'active',
          createdAt: event.timestamp
        };
        break;
        
      case 'OrganizationUpdated':
        if (state) {
          Object.keys(event.data.changes).forEach(field => {
            state[field] = event.data.changes[field].to;
          });
        }
        break;
        
      case 'OrganizationDeleted':
        if (state) state.status = 'deleted';
        break;
    }
  }
  
  return state?.status === 'active' ? state : null;
};

module.exports = { updateOrganizationView };
```

### 3.2 Project View Updates
```javascript
// functions/src/events/projectViews.js
/**
 * Update project materialized view
 * @sig updateProjectView :: (Object) -> Promise<Void>
 */
const updateProjectView = async (event) => {
  const projectId = event.subject.id;
  
  // Get current project state from events
  const currentState = await getCurrentProjectState(projectId);
  
  if (currentState) {
    // Update materialized view
    await admin.firestore()
      .collection('projects')
      .doc(projectId)
      .set(currentState, { merge: true });
  }
};

/**
 * Calculate current project state from events
 * @sig getCurrentProjectState :: (String) -> Promise<Object|null>
 */
const getCurrentProjectState = async (projectId) => {
  const projectEvents = await admin.firestore()
    .collection('events')
    .where('subject.type', '==', 'project')
    .where('subject.id', '==', projectId)
    .orderBy('timestamp', 'asc')
    .get();
    
  let state = null;
  
  for (const eventDoc of projectEvents.docs) {
    const event = eventDoc.data();
    
    switch (event.type) {
      case 'ProjectCreated':
        state = {
          projectId: projectId,
          organizationId: event.organizationId,
          name: event.data.name,
          description: event.data.description,
          status: 'active',
          createdAt: event.timestamp
        };
        break;
        
      case 'ProjectUpdated':
        if (state) {
          Object.keys(event.data.changes).forEach(field => {
            state[field] = event.data.changes[field].to;
          });
        }
        break;
        
      case 'ProjectDeleted':
        if (state) state.status = 'deleted';
        break;
    }
  }
  
  return state?.status === 'active' ? state : null;
};

module.exports = { updateProjectView };
```

## Step 4: Data Isolation Middleware

### 4.1 Organization Isolation Middleware
```javascript
// functions/src/middleware/organizationIsolation.js
/**
 * Middleware to ensure data isolation between organizations
 * @sig organizationIsolation :: (Request, Response, Function) -> Promise<Void>
 */
const organizationIsolation = async (req, res, next) => {
  try {
    const organizationId = req.headers['x-organization-id'] || req.params.organizationId || req.body.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }
    
    // Verify user has access to this organization
    const hasAccess = await hasPermission(req.user.uid, organizationId, 'read');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to organization' });
    }
    
    // Add organization context to request
    req.organizationId = organizationId;
    next();
  } catch (error) {
    console.error('Organization isolation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to ensure project belongs to organization
 * @sig projectIsolation :: (Request, Response, Function) -> Promise<Void>
 */
const projectIsolation = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const organizationId = req.organizationId;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }
    
    // Verify project belongs to organization
    const projectDoc = await admin.firestore()
      .collection('projects')
      .doc(projectId)
      .get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectData = projectDoc.data();
    if (projectData.organizationId !== organizationId) {
      return res.status(403).json({ error: 'Project does not belong to organization' });
    }
    
    // Add project context to request
    req.projectId = projectId;
    next();
  } catch (error) {
    console.error('Project isolation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { organizationIsolation, projectIsolation };
```

### 4.2 Data Access Patterns
```javascript
// functions/src/utils/dataAccess.js
/**
 * Get data scoped to organization and project
 * @sig getScopedData :: (String, String, String) -> Promise<Array>
 */
const getScopedData = async (organizationId, projectId, collection) => {
  const query = admin.firestore()
    .collection(collection)
    .where('organizationId', '==', organizationId);
  
  if (projectId && projectId !== 'default') {
    query = query.where('projectId', '==', projectId);
  }
  
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Create data scoped to organization and project
 * @sig createScopedData :: (String, String, String, Object) -> Promise<String>
 */
const createScopedData = async (organizationId, projectId, collection, data) => {
  const docData = {
    ...data,
    organizationId,
    projectId: projectId || 'default',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  const docRef = await admin.firestore()
    .collection(collection)
    .add(docData);
  
  return docRef.id;
};

/**
 * Update data scoped to organization and project
 * @sig updateScopedData :: (String, String, String, String, Object) -> Promise<Void>
 */
const updateScopedData = async (organizationId, projectId, collection, docId, updates) => {
  const docRef = admin.firestore()
    .collection(collection)
    .doc(docId);
  
  // Verify document belongs to organization and project
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error('Document not found');
  }
  
  const docData = doc.data();
  if (docData.organizationId !== organizationId || docData.projectId !== (projectId || 'default')) {
    throw new Error('Document does not belong to organization/project');
  }
  
  await docRef.update({
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
};

module.exports = { getScopedData, createScopedData, updateScopedData };
```

## Step 5: Role-Based Permissions System

### 5.1 Permission Definitions
```javascript
// functions/src/auth/permissions.js
const permissions = {
  // Organization-level permissions
  organization: {
    read: 'Read organization data',
    write: 'Modify organization settings',
    admin: 'Full organization administration',
    manage_users: 'Add/remove organization members',
    manage_projects: 'Create/delete projects',
    billing: 'Manage billing and subscriptions'
  },
  
  // Project-level permissions
  project: {
    read: 'Read project data',
    write: 'Modify project data',
    admin: 'Full project administration',
    manage_data: 'Create/update/delete project data'
  },
  
  // System-level permissions
  system: {
    impersonate: 'Impersonate other users',
    support: 'Access support tools',
    audit: 'View audit logs'
  }
};

const rolePermissions = {
  admin: [
    'organization.read', 'organization.write', 'organization.admin',
    'organization.manage_users', 'organization.manage_projects', 'organization.billing',
    'project.read', 'project.write', 'project.admin', 'project.manage_data',
    'system.impersonate', 'system.support', 'system.audit'
  ],
  member: [
    'organization.read',
    'project.read', 'project.write', 'project.manage_data'
  ],
  viewer: [
    'organization.read',
    'project.read'
  ]
};

/**
 * Get permissions for role
 * @sig getPermissionsForRole :: (String) -> Array
 */
const getPermissionsForRole = (role) => {
  return rolePermissions[role] || [];
};

/**
 * Check if user has specific permission
 * @sig hasPermission :: (String, String, String) -> Promise<Boolean>
 */
const hasPermission = async (userId, organizationId, permission) => {
  const claims = await getUserClaims(userId);
  const orgClaims = claims.organizations?.[organizationId];
  
  if (!orgClaims) return false;
  
  return orgClaims.permissions.includes(permission) || orgClaims.role === 'admin';
};

/**
 * Check if user has any of the specified permissions
 * @sig hasAnyPermission :: (String, String, Array) -> Promise<Boolean>
 */
const hasAnyPermission = async (userId, organizationId, permissions) => {
  const claims = await getUserClaims(userId);
  const orgClaims = claims.organizations?.[organizationId];
  
  if (!orgClaims) return false;
  
  if (orgClaims.role === 'admin') return true;
  
  return permissions.some(permission => orgClaims.permissions.includes(permission));
};

module.exports = { 
  permissions, 
  rolePermissions, 
  getPermissionsForRole, 
  hasPermission, 
  hasAnyPermission 
};
```

### 5.2 Permission Middleware
```javascript
// functions/src/middleware/permissions.js
/**
 * Require specific permission for organization
 * @sig requirePermission :: (String, String) -> Function
 */
const requirePermission = (organizationId, permission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.uid;
      const hasAccess = await hasPermission(userId, organizationId, permission);
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Require any of the specified permissions
 * @sig requireAnyPermission :: (String, Array) -> Function
 */
const requireAnyPermission = (organizationId, permissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.uid;
      const hasAccess = await hasAnyPermission(userId, organizationId, permissions);
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Require admin role for organization
 * @sig requireAdmin :: (String) -> Function
 */
const requireAdmin = (organizationId) => {
  return requirePermission(organizationId, 'organization.admin');
};

module.exports = { requirePermission, requireAnyPermission, requireAdmin };
```

## Success Criteria

### Technical
- [ ] Organization management (CRUD operations) working
- [ ] Project management (CRUD operations) working
- [ ] Materialized views generated from events
- [ ] Data isolation middleware functional
- [ ] Role-based permissions system working

### Functional
- [ ] Organizations can be created, updated, and deleted
- [ ] Projects can be created within organizations
- [ ] Data properly isolated between organizations
- [ ] Users can only access data from their organizations
- [ ] Role-based permissions enforced correctly

### Security
- [ ] Complete data isolation between organizations
- [ ] Project data scoped to parent organization
- [ ] Permission checks prevent unauthorized access
- [ ] All operations properly audited via events
- [ ] Materialized views stay in sync with events

## Next Phase
Once multi-tenant data model is complete, proceed to **Phase 5: Offline Queue Architecture** (`phase5-offline.md`).
