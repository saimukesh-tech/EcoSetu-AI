import { Response, NextFunction } from 'express';
import { AuthError, ForbiddenError } from '../errors/AppError';
import { RequestWithId } from './requestId';
import { ENV } from '../config/environment';

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
        if (ENV.FIREBASE_PROJECT_ID && ENV.FIREBASE_CLIENT_EMAIL && ENV.FIREBASE_PRIVATE_KEY) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: ENV.FIREBASE_PROJECT_ID,
              clientEmail: ENV.FIREBASE_CLIENT_EMAIL,
              privateKey: ENV.FIREBASE_PRIVATE_KEY
            })
          });
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
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
    // Demo mode strictly restricted to non-production environments with explicit ENABLE_DEMO_AUTH=true flag
    if (ENV.ENABLE_DEMO_AUTH) {
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

  // Allow explicit demo tokens strictly in non-production environments with explicit ENABLE_DEMO_AUTH=true flag
  if (ENV.ENABLE_DEMO_AUTH) {
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
      
      const userMeta = verifiedUserRolesStore[decodedToken.uid];
      const role = (decodedToken.role as any) || userMeta?.role;

      if (!role) {
        return next(new ForbiddenError('Forbidden. User profile role is unassigned. Please complete onboarding.'));
      }

      const organizationId = (decodedToken.organizationId as any) || userMeta?.organizationId || `org_${decodedToken.uid}`;
      const name = decodedToken.name || userMeta?.name || 'EcoSetu User';

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        role,
        name,
        organizationId
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

export function authorizeResourceAccess(options: {
  getResourceOwnerId?: (req: AuthenticatedRequest) => string | undefined;
  getResourceOrgId?: (req: AuthenticatedRequest) => string | undefined;
}) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthError());
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (options.getResourceOrgId) {
      const resourceOrgId = options.getResourceOrgId(req);
      if (resourceOrgId && resourceOrgId !== req.user.organizationId) {
        return next(new ForbiddenError('Forbidden. Resource belongs to another organization tenant.'));
      }
    }

    if (options.getResourceOwnerId) {
      const ownerId = options.getResourceOwnerId(req);
      if (ownerId && ownerId !== req.user.uid) {
        return next(new ForbiddenError('Forbidden. You do not own this resource.'));
      }
    }

    next();
  };
}
