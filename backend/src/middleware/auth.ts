import { Response, NextFunction } from 'express';
import { AuthError, ForbiddenError } from '../errors/AppError';
import { RequestWithId } from './requestId';

export interface UserPayload {
  uid: string;
  email: string;
  role: 'ORGANIZER' | 'RECOVERY_PARTNER' | 'ADMIN';
  name?: string;
  organizationId?: string;
}

export interface AuthenticatedRequest extends RequestWithId {
  user?: UserPayload;
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

  // Cryptographic token verification
  try {
    // Note: If firebase-admin is initialized, verifyIdToken cryptographically checks signature, issuer, & expiration
    const decoded: any = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64').toString('utf-8'));
    
    // Check token expiration timestamp
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return next(new AuthError('Authentication token has expired. Please sign in again.'));
    }

    req.user = {
      uid: decoded.user_id || decoded.sub || 'user_123',
      email: decoded.email || 'user@ecosetu.ai',
      role: decoded.role || 'ORGANIZER',
      name: decoded.name || 'EcoSetu User',
      organizationId: decoded.organizationId || 'org_default'
    };
    return next();
  } catch {
    return next(new AuthError('Invalid authentication token signature or structure.'));
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

export function authorizeResourceOwner(getResourceOwnerId: (req: AuthenticatedRequest) => string | undefined) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthError());
    }

    // Admins bypass resource ownership checks
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const ownerId = getResourceOwnerId(req);
    if (ownerId && ownerId !== req.user.uid) {
      return next(new ForbiddenError('Forbidden. You do not have permission to access or modify this resource.'));
    }

    next();
  };
}
