import { Request, Response, NextFunction } from 'express';
import { requestContextStorage } from '../utils/requestContext.utils';

export const requestContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  requestContextStorage.run({ req, res }, () => {
    next();
  });
};

export default requestContextMiddleware;
