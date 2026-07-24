import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { writeAuditLog } from "../lib/audit";
import { authenticate } from "../middleware/auth";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /auth/login — the ONLY way to obtain an account. There is intentionally
// no public registration endpoint; accounts are provisioned by a Super Admin
// (see /users routes) or via the seed script for the first account.
authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: (process.env.JWT_EXPIRES_IN || "12h") as jwt.SignOptions["expiresIn"],
    });

    await writeAuditLog({ userId: user.id, action: "auth.login", targetType: "User", targetId: user.id });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  })
);

// GET /auth/me — lets the frontend verify a stored token is still valid on load
authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);
