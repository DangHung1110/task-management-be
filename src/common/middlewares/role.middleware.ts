
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest} from "./auth.middlewares";
import { ForbiddenException, UnauthorizedException} from "../exceptions";

export const checkRole = (required: string | string[]) => {
    const allowed = Array.isArray(required) ? required : [required];

    return (req: AuthenticatedRequest | Request, res: Response, next: NextFunction) => {
        try {
            const r = req as AuthenticatedRequest;
            const user = r.user;

                    if (!user) {
                        return next(new UnauthorizedException('Authentication required'));
                    }

                    if (!allowed.includes(user.role)) {
                        return next(new ForbiddenException('You do not have permission to access this resource'));
                    }

                    return next();
        } catch (err) {
            return next(new ForbiddenException('You do not have permission to access this resource'));
        }
    };
};

export const checkAuth = checkRole("admin");