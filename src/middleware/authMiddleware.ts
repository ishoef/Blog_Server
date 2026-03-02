import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";

// Role enum
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        emailVerified: boolean;
      };
    }
  }
}

const authMiddleware = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user session
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized",
        });
      }

      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Email Verification required!",
        });
      }

      const user = session.user;

      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as string,
        emailVerified: user.emailVerified,
      };

      if (roles.length && !roles.includes(req.user?.role as UserRole)) {
        return res.status(403).json({
          success: false,
          messages:
            "Forbidden! you don't have permission to access this resurces!",
        });
      }

      // console.log("Consoling From authMiddleware ", session);
      next();
    } catch (e) {
      res.status(400).json({
        success: false,
        message: "Failed",
      });
    }
  };
};

export default authMiddleware;
