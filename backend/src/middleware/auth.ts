import { Response, NextFunction } from 'express';
import { AuthError, ForbiddenError } from '../errors/AppError';
import { RequestWithId } from './requestId';

export interface UserPayload {
  uid: string;
  email: string;
  role: 'ORGANIZER' | 'RECOVERY_PARTNER' | 'ADMIN';
  name?: string;
  organizationId: string;
}

export interface AuthenticatedRequest extends RequestWithId {
  user?: UserPayload;
}

// Verified user metadata resolver map
const verifiedUserRolesStore: Record<string, { role: 'ORGANIZER' | 'RECOVERY_PARTNER' | 'ADMIN'; organizationId: string; name: string }> = {
  'demo_organizer_123': { role: 'ORGANIZER', organizationId: 'org_demo_1', name: 'Demo Event Organizer' },
  'demo_partner_456': { role: 'RECOVERY_PARTNER', organizationId: 'org_demo_2', name: 'Demo Recovery Partner' },
  'demo_admin_789': { role: 'ADMIN', organizationId: 'org_demo_admin', name: 'EcoSetu Administrator' }
};

let adminSdk: any = null;

function getFirebaseAdminInstance() {
  if (!adminSdk) {
    try {
      const admin = require('firebase-admin');
      if (admin.apps.length === 0) {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
        } else {
          admin.initializeApp();
        }
      }
      adminSdk = admin;
    } catch {
      adminSdk = null;
    }
  }
  return adminSdk;
}

export async function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Check if demo authentication is explicitly enabled for non-production environments
    const isDemoEnabled = process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEMO_AUTH === 'true';
    if (isDemoEnabled) {
      req.user = {
        uid: 'demo_organizer_123',
        email: 'organizer@ecosetu.ai',
        role: 'ORGANIZER',
        name: 'Demo Event Organizer',
        organizationId: 'org_demo_1'
      };
      return next();
    }

    return next(new AuthError('Authentication required. A valid Bearer token must be provided.'));
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // Allow explicit demo tokens strictly in non-production environments
  const isDemoAllowed = process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEMO_AUTH === 'true';
  if (isDemoAllowed) {
    if (token === 'demo_token_organizer' || token.startsWith('demo_organizer')) {
      req.user = {
        uid: 'demo_organizer_123',
        email: 'organizer@ecosetu.ai',
        role: 'ORGANIZER',
        name: 'Demo Event Organizer',
        organizationId: 'org_demo_1'
      };
      return next();
    }
    if (token === 'demo_token_partner' || token.startsWith('demo_partner')) {
      req.user = {
        uid: 'demo_partner_456',
        email: 'partner@ecosetu.ai',
        role: 'RECOVERY_PARTNER',
        name: 'Demo Recovery Partner',
        organizationId: 'org_demo_2'
      };
      return next();
    }
    if (token === 'demo_token_admin') {
      req.user = {
        uid: 'demo_admin_789',
        email: 'admin@ecosetu.ai',
        role: 'ADMIN',
        name: 'EcoSetu Administrator',
        organizationId: 'org_demo_admin'
      };
      return next();
    }
  }

  // Cryptographic token verification using Firebase Admin SDK
  try {
    const admin = getFirebaseAdminInstance();
    if (admin && admin.apps.length > 0) {
      const decodedToken = await admin.auth().verifyIdToken(token, true); // true = checkRevoked
      
      // Resolve role & organizationId from verified custom claims or database store (never client headers)
      const userMeta = verifiedUserRolesStore[decodedToken.uid] || {
        role: (decodedToken.role as any) || 'ORGANIZER',
        organizationId: (decodedToken.organizationId as any) || `org_${decodedToken.uid}`,
        name: decodedToken.name || 'EcoSetu User'
      };

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        role: userMeta.role,
        name: userMeta.name,
        organizationId: userMeta.organizationId
      };
      return next();
    }
    
    return next(new AuthError('Firebase Admin authentication service unavailable.'));
  } catch (error: any) {
    return next(new AuthError(`Cryptographic token verification failed: ${error.message || 'Invalid or revoked token'}`));
  }
}

export function requireRole(allowedRoles: Array<'ORGANIZER' | 'RECOVERY_PARTNER' | 'ADMIN'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(`Access denied. Required role: [${allowedRoles.join(', ')}]. Your role: '${req.user.role}'`));
    }

    next();
  };
}

// Resource Ownership & Multi-tenant Organization Isolation Middleware
export function authorizeResourceAccess(options: {
  getResourceOwnerId?: (req: AuthenticatedRequest) => string | undefined;
  getResourceOrgId?: (req: AuthenticatedRequest) => string | undefined;
}) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthError());
    }

    // Admins bypass resource & tenant checks
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // 1. Organization / Tenant Isolation Check
    if (options.getResourceOrgId) {
      const resourceOrgId = options.getResourceOrgId(req);
      if (resourceOrgId && resourceOrgId !== req.user.organizationId) {
        return next(new ForbiddenError('Forbidden. Resource belongs to another organization tenant.'));
      }
    }

    // 2. Resource Owner Check
    if (options.getResourceOwnerId) {
      const ownerId = options.getResourceOwnerId(req);
      if (ownerId && ownerId !== req.user.uid) {
        return next(new ForbiddenError('Forbidden. You do not own this resource.'));
      }
    }

    next();
  };
}
