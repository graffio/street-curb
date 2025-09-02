# Phase 3: Authentication System

**Goal**: Implement passcode-only authentication with organization roles

## Deliverables
- [ ] Firebase Auth configured for passcode-only
- [ ] Custom claims for organization roles
- [ ] Impersonation feature for support
- [ ] Security middleware for API endpoints
- [ ] User management API endpoints

## Step 1: Firebase Auth Configuration

### 1.1 Passcode-Only Authentication Setup
```javascript
// functions/src/auth/firebaseAuth.js
const admin = require('firebase-admin');

/**
 * Configure Firebase Auth for passcode-only
 * @sig configurePasscodeAuth :: () -> Promise<Void>
 */
const configurePasscodeAuth = async () => {
  // Enable phone authentication for passcodes
  await admin.auth().updateConfig({
    phoneNumberSignInEnabled: true,
    emailSignInEnabled: false,
    passwordSignInEnabled: false,
    anonymousSignInEnabled: false
  });
  
  // Configure SMS settings
  await admin.auth().updateConfig({
    smsCodeSettings: {
      smsCodeLength: 6,
      smsCodeValidity: 300 // 5 minutes
    }
  });
};

/**
 * Send passcode to user
 * @sig sendPasscode :: (String) -> Promise<Void>
 */
const sendPasscode = async (phoneNumber) => {
  try {
    await admin.auth().generateSignInWithPhoneNumberToken(phoneNumber);
  } catch (error) {
    console.error('Failed to send passcode:', error);
    throw error;
  }
};

/**
 * Verify passcode and create session
 * @sig verifyPasscode :: (String, String) -> Promise<Object>
 */
const verifyPasscode = async (phoneNumber, passcode) => {
  try {
    const userCredential = await admin.auth().signInWithPhoneNumber(phoneNumber, passcode);
    return userCredential.user;
  } catch (error) {
    console.error('Failed to verify passcode:', error);
    throw error;
  }
};

module.exports = { configurePasscodeAuth, sendPasscode, verifyPasscode };
```

### 1.2 Custom Claims Management
```javascript
// functions/src/auth/customClaims.js
/**
 * Set custom claims for user organization roles
 * @sig setUserClaims :: (String, String, String, Array) -> Promise<Void>
 */
const setUserClaims = async (userId, organizationId, role, permissions) => {
  const claims = {
    [`organization_${organizationId}_role`]: role,
    [`organization_${organizationId}_permissions`]: permissions,
    organizations: {
      [organizationId]: {
        role,
        permissions,
        lastAccess: new Date().toISOString()
      }
    }
  };
  
  await admin.auth().setCustomUserClaims(userId, claims);
  
  // Log claim update event
  await createEvent({
    type: 'UserClaimsUpdated',
    organizationId,
    projectId: 'default',
    actor: { type: 'system', id: 'auth-service' },
    subject: { type: 'user', id: userId },
    data: { role, permissions }
  });
};

/**
 * Get user claims
 * @sig getUserClaims :: (String) -> Promise<Object>
 */
const getUserClaims = async (userId) => {
  const user = await admin.auth().getUser(userId);
  return user.customClaims || {};
};

/**
 * Check if user has permission for organization
 * @sig hasPermission :: (String, String, String) -> Promise<Boolean>
 */
const hasPermission = async (userId, organizationId, permission) => {
  const claims = await getUserClaims(userId);
  const orgClaims = claims.organizations?.[organizationId];
  
  if (!orgClaims) return false;
  
  return orgClaims.permissions.includes(permission) || orgClaims.role === 'admin';
};

module.exports = { setUserClaims, getUserClaims, hasPermission };
```

## Step 2: Impersonation Feature

### 2.1 Impersonation API
```javascript
// functions/src/auth/impersonation.js
/**
 * Start impersonation session
 * @sig startImpersonation :: (String, String, String) -> Promise<Object>
 */
const startImpersonation = async (impersonatorId, targetUserId, reason) => {
  // Verify impersonator has permission
  const canImpersonate = await hasPermission(impersonatorId, 'impersonate');
  if (!canImpersonate) {
    throw new Error('Insufficient permissions for impersonation');
  }
  
  // Get target user's claims
  const targetClaims = await getUserClaims(targetUserId);
  
  // Create impersonation session
  const sessionId = crypto.randomUUID();
  const impersonationSession = {
    sessionId,
    impersonatorId,
    targetUserId,
    reason,
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    targetClaims
  };
  
  // Store session
  await admin.firestore()
    .collection('impersonation_sessions')
    .doc(sessionId)
    .set(impersonationSession);
  
  // Log impersonation start event
  await createEvent({
    type: 'ImpersonationStarted',
    organizationId: 'system',
    projectId: 'default',
    actor: { type: 'user', id: impersonatorId },
    subject: { type: 'user', id: targetUserId },
    data: { reason, sessionId }
  });
  
  return impersonationSession;
};

/**
 * End impersonation session
 * @sig endImpersonation :: (String, String) -> Promise<Void>
 */
const endImpersonation = async (sessionId, impersonatorId) => {
  const sessionDoc = await admin.firestore()
    .collection('impersonation_sessions')
    .doc(sessionId)
    .get();
  
  if (!sessionDoc.exists) {
    throw new Error('Impersonation session not found');
  }
  
  const session = sessionDoc.data();
  
  if (session.impersonatorId !== impersonatorId) {
    throw new Error('Only the impersonator can end the session');
  }
  
  // Mark session as ended
  await sessionDoc.ref.update({
    endedAt: new Date().toISOString(),
    status: 'ended'
  });
  
  // Log impersonation end event
  await createEvent({
    type: 'ImpersonationEnded',
    organizationId: 'system',
    projectId: 'default',
    actor: { type: 'user', id: impersonatorId },
    subject: { type: 'user', id: session.targetUserId },
    data: { sessionId }
  });
};

/**
 * Get current impersonation session
 * @sig getCurrentImpersonation :: (String) -> Promise<Object|null>
 */
const getCurrentImpersonation = async (userId) => {
  const sessionsSnapshot = await admin.firestore()
    .collection('impersonation_sessions')
    .where('impersonatorId', '==', userId)
    .where('status', '==', 'active')
    .where('expiresAt', '>', new Date().toISOString())
    .get();
  
  if (sessionsSnapshot.empty) return null;
  
  const session = sessionsSnapshot.docs[0].data();
  return session;
};

module.exports = { startImpersonation, endImpersonation, getCurrentImpersonation };
```

### 2.2 Impersonation Middleware
```javascript
// functions/src/auth/impersonationMiddleware.js
/**
 * Middleware to handle impersonation in API requests
 * @sig impersonationMiddleware :: (Request, Response, Function) -> Promise<Void>
 */
const impersonationMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const sessionId = req.headers['x-impersonation-session'];
    
    if (sessionId) {
      // Verify impersonation session
      const session = await getCurrentImpersonation(userId);
      
      if (session && session.sessionId === sessionId) {
        // Set target user's claims for this request
        req.user = {
          ...req.user,
          uid: session.targetUserId,
          customClaims: session.targetClaims
        };
        
        // Add impersonation context
        req.impersonation = {
          sessionId,
          impersonatorId: userId,
          targetUserId: session.targetUserId,
          reason: session.reason
        };
      } else {
        return res.status(403).json({ error: 'Invalid impersonation session' });
      }
    }
    
    next();
  } catch (error) {
    console.error('Impersonation middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { impersonationMiddleware };
```

## Step 3: Security Middleware

### 3.1 Authentication Middleware
```javascript
// functions/src/auth/authMiddleware.js
/**
 * Verify Firebase Auth token
 * @sig authenticateUser :: (Request, Response, Function) -> Promise<Void>
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

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
 * Require admin role for organization
 * @sig requireAdmin :: (String) -> Function
 */
const requireAdmin = (organizationId) => {
  return requirePermission(organizationId, 'admin');
};

module.exports = { authenticateUser, requirePermission, requireAdmin };
```

### 3.2 Rate Limiting Middleware
```javascript
// functions/src/auth/rateLimiting.js
const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // Number of requests
  duration: 15 * 60, // Per 15 minutes
});

/**
 * Rate limiting middleware
 * @sig rateLimit :: (Request, Response, Function) -> Promise<Void>
 */
const rateLimit = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many requests' });
  }
};

module.exports = { rateLimit };
```

## Step 4: User Management API

### 4.1 User CRUD Operations
```javascript
// functions/src/api/users.js
const express = require('express');
const router = express.Router();
const { authenticateUser, requireAdmin } = require('../auth/authMiddleware');
const { createUser, updateUser, forgetUser } = require('../events/queueEvents');

// Apply authentication to all routes
router.use(authenticateUser);

/**
 * Create new user
 * @sig createUser :: (Request, Response) -> Promise<Void>
 */
router.post('/', requireAdmin('organizationId'), async (req, res) => {
  try {
    const { organizationId, projectId, userData } = req.body;
    const queueId = await createUser(organizationId, projectId, userData);
    
    res.status(201).json({ 
      message: 'User creation queued',
      queueId 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update user
 * @sig updateUser :: (Request, Response) -> Promise<Void>
 */
router.put('/:userId', requireAdmin('organizationId'), async (req, res) => {
  try {
    const { organizationId, projectId } = req.body;
    const { userId } = req.params;
    const { changes } = req.body;
    
    const queueId = await updateUser(organizationId, projectId, userId, changes);
    
    res.json({ 
      message: 'User update queued',
      queueId 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Forget user (CCPA/GDPR compliance)
 * @sig forgetUser :: (Request, Response) -> Promise<Void>
 */
router.delete('/:userId', requireAdmin('organizationId'), async (req, res) => {
  try {
    const { organizationId, projectId } = req.body;
    const { userId } = req.params;
    const { reason } = req.body;
    
    const queueId = await forgetUser(organizationId, projectId, userId, reason);
    
    res.json({ 
      message: 'User forget request queued',
      queueId 
    });
  } catch (error) {
    console.error('Error forgetting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get user by ID
 * @sig getUser :: (Request, Response) -> Promise<Void>
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { organizationId } = req.query;
    
    // Check if user has access to this organization
    const hasAccess = await hasPermission(req.user.uid, organizationId, 'read');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(userDoc.data());
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * List users in organization
 * @sig listUsers :: (Request, Response) -> Promise<Void>
 */
router.get('/', async (req, res) => {
  try {
    const { organizationId } = req.query;
    
    // Check if user has access to this organization
    const hasAccess = await hasPermission(req.user.uid, organizationId, 'read');
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('organizationId', '==', organizationId)
      .get();
    
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(users);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

### 4.2 Authentication API
```javascript
// functions/src/api/auth.js
const express = require('express');
const router = express.Router();
const { sendPasscode, verifyPasscode, setUserClaims } = require('../auth/firebaseAuth');
const { startImpersonation, endImpersonation } = require('../auth/impersonation');

/**
 * Send passcode to phone number
 * @sig sendPasscode :: (Request, Response) -> Promise<Void>
 */
router.post('/send-passcode', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    await sendPasscode(phoneNumber);
    
    res.json({ message: 'Passcode sent' });
  } catch (error) {
    console.error('Error sending passcode:', error);
    res.status(500).json({ error: 'Failed to send passcode' });
  }
});

/**
 * Verify passcode and create session
 * @sig verifyPasscode :: (Request, Response) -> Promise<Void>
 */
router.post('/verify-passcode', async (req, res) => {
  try {
    const { phoneNumber, passcode } = req.body;
    
    const user = await verifyPasscode(phoneNumber, passcode);
    
    // Get user's custom claims
    const claims = await getUserClaims(user.uid);
    
    res.json({
      user: {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        claims
      },
      token: await user.getIdToken()
    });
  } catch (error) {
    console.error('Error verifying passcode:', error);
    res.status(401).json({ error: 'Invalid passcode' });
  }
});

/**
 * Start impersonation session
 * @sig startImpersonation :: (Request, Response) -> Promise<Void>
 */
router.post('/impersonate', async (req, res) => {
  try {
    const { targetUserId, reason } = req.body;
    const impersonatorId = req.user.uid;
    
    const session = await startImpersonation(impersonatorId, targetUserId, reason);
    
    res.json({
      message: 'Impersonation started',
      sessionId: session.sessionId,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('Error starting impersonation:', error);
    res.status(500).json({ error: 'Failed to start impersonation' });
  }
});

/**
 * End impersonation session
 * @sig endImpersonation :: (Request, Response) -> Promise<Void>
 */
router.post('/end-impersonation', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const impersonatorId = req.user.uid;
    
    await endImpersonation(sessionId, impersonatorId);
    
    res.json({ message: 'Impersonation ended' });
  } catch (error) {
    console.error('Error ending impersonation:', error);
    res.status(500).json({ error: 'Failed to end impersonation' });
  }
});

module.exports = router;
```

## Step 5: Frontend Authentication

### 5.1 Authentication Service
```javascript
// src/services/auth.js
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Send passcode to phone number
 * @sig sendPasscode :: (String) -> Promise<Void>
 */
export const sendPasscode = async (phoneNumber) => {
  const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
  }, auth);
  
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error) {
    console.error('Error sending passcode:', error);
    throw error;
  }
};

/**
 * Verify passcode
 * @sig verifyPasscode :: (ConfirmationResult, String) -> Promise<User>
 */
export const verifyPasscode = async (confirmationResult, passcode) => {
  try {
    const result = await confirmationResult.confirm(passcode);
    return result.user;
  } catch (error) {
    console.error('Error verifying passcode:', error);
    throw error;
  }
};

/**
 * Sign out user
 * @sig signOut :: () -> Promise<Void>
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Get current user
 * @sig getCurrentUser :: () -> Promise<User>
 */
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};
```

### 5.2 Impersonation UI Component
```javascript
// src/components/ImpersonationBanner.jsx
import React, { useState } from 'react';
import { endImpersonation } from '../services/auth';

const ImpersonationBanner = ({ session, onEndImpersonation }) => {
  const [ending, setEnding] = useState(false);
  
  const handleEndImpersonation = async () => {
    setEnding(true);
    try {
      await endImpersonation(session.sessionId);
      onEndImpersonation();
    } catch (error) {
      console.error('Error ending impersonation:', error);
    } finally {
      setEnding(false);
    }
  };
  
  return (
    <div className="impersonation-banner">
      <div className="impersonation-content">
        <span className="impersonation-icon">🎭</span>
        <span className="impersonation-text">
          Acting as {session.targetUserId} - {session.reason}
        </span>
        <button 
          onClick={handleEndImpersonation}
          disabled={ending}
          className="end-impersonation-btn"
        >
          {ending ? 'Ending...' : 'End Impersonation'}
        </button>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
```

## Success Criteria

### Technical
- [ ] Firebase Auth configured for passcode-only authentication
- [ ] Custom claims system working for organization roles
- [ ] Impersonation feature functional with proper audit logging
- [ ] Security middleware protecting API endpoints
- [ ] User management API endpoints working

### Functional
- [ ] Users can authenticate with phone numbers and passcodes
- [ ] Role-based permissions working correctly
- [ ] Impersonation sessions can be started and ended
- [ ] API endpoints properly secured with authentication
- [ ] User CRUD operations working via queue system

### Security
- [ ] Passcode-only authentication prevents password attacks
- [ ] Custom claims provide proper role-based access control
- [ ] Impersonation feature has proper audit trail
- [ ] Rate limiting prevents abuse
- [ ] All API endpoints require authentication

## Next Phase
Once authentication system is complete, proceed to **Phase 4: Multi-Tenant Data Model** (`phase4-multitenant.md`).
