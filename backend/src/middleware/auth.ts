import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: 'ORGANIZER' | 'RECOVERY_PARTNER' | 'ADMIN';
    name?: string;
  };
}

export function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();

    if (token === 'demo_token_organizer' || token.startsWith('demo_')) {
      req.user = {
        uid: 'demo_organizer_123',
        email: 'organizer@ecosetu.ai',
        role: 'ORGANIZER',
        name: 'Demo Event Organizer'
      };
      return next();
    }

    if (token === 'demo_token_partner') {
      req.user = {
        uid: 'demo_partner_456',
        email: 'partner@ecosetu.ai',
        role: 'RECOVERY_PARTNER',
        name: 'Demo Recovery Partner'
      };
      return next();
    }

    // Pass-through token decode for real Firebase user tokens
    try {
      const decoded: any = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64').toString('utf-8'));
      req.user = {
        uid: decoded.user_id || decoded.sub || 'user_123',
        email: decoded.email || 'user@ecosetu.ai',
        role: decoded.role || 'ORGANIZER',
        name: decoded.name || 'EcoSetu User'
      };
      return next();
    } catch {
      req.user = {
        uid: 'demo_user',
        email: 'user@ecosetu.ai',
        role: 'ORGANIZER',
        name: 'User'
      };
      return next();
    }
  }

  // Allow optional unauthenticated requests or inject default guest user
  req.user = {
    uid: 'guest_user',
    email: 'guest@ecosetu.ai',
    role: 'ORGANIZER',
    name: 'Guest User'
  };
  next();
}

export function requireRole(allowedRoles: Array<'ORGANIZER' | 'RECOVERY_PARTNER' | 'ADMIN'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required role: [${allowedRoles.join(', ')}]. Current role: '${req.user?.role || 'NONE'}'`
        }
      });
    }
    next();
  };
}
