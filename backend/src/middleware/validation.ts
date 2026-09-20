import { Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/AppError';
import { RequestWithId } from './requestId';

export function validateBody(schema: ZodSchema) {
  return (req: RequestWithId, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new ValidationError('Invalid request payload', error.flatten()));
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: RequestWithId, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new ValidationError('Invalid request query parameters', error.flatten()));
      }
      next(error);
    }
  };
}
