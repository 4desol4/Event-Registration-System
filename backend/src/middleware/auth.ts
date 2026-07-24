import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError, asyncHandler } from "./errorHandler";

interface JwtPayload {
  userId: string;
}

// Verifies the Bearer token, loads the user, and attaches it to req.user.
// Any route using this must come after this middleware in the chain.
export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required. Please log in.");
  }

  const token = header.slice("Bearer ".length);
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  } catch {
    throw new ApiError(401, "Your session has expired or is invalid. Please log in again.");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) {
    throw new ApiError(401, "This account is no longer active.");
  }

  req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
  next();
});

// Role guard — use AFTER authenticate. Blocks on both the frontend (hidden UI)
// and here on the backend, since the frontend alone is never trustworthy.
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "You don't have permission to perform this action.");
    }
    next();
  };
}
