import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { authenticate, requireRole } from "../middleware/auth";
import { writeAuditLog } from "../lib/audit";

export const usersRouter = Router();

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "STAFF"]), // Super Admin accounts are never created via this endpoint
});

// Every route below requires a logged-in SUPER_ADMIN — this is the ONLY
// place accounts get created, by design (see planning notes: single
// Super Admin provisions all staff logins).
usersRouter.use(authenticate, requireRole("SUPER_ADMIN"));

usersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  })
);

usersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createUserSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, passwordHash, role: data.role },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });

    await writeAuditLog({
      userId: req.user!.id,
      action: "user.create",
      targetType: "User",
      targetId: user.id,
      details: { role: user.role, createdBy: req.user!.email },
    });

    res.status(201).json(user);
  })
);

// PATCH /users/:id — deactivate/reactivate, or change role
usersRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      isActive: z.boolean().optional(),
      role: z.enum(["ADMIN", "STAFF"]).optional(),
    });
    const data = schema.parse(req.body);

    if (req.params.id === req.user!.id) {
      throw new ApiError(400, "You can't modify your own account from this endpoint.");
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    await writeAuditLog({
      userId: req.user!.id,
      action: "user.update",
      targetType: "User",
      targetId: updated.id,
      details: data,
    });

    res.json(updated);
  })
);
