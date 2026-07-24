import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

// Custom error class so route handlers can throw with an explicit HTTP status.
export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Wrap async route handlers so thrown errors reach the error middleware
// instead of crashing the process or hanging the request.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Validation errors (zod) — return field-level detail, this is what powers
  // the "please correct these fields" behavior in the admin/attendee UI.
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "ValidationError",
      message: "One or more fields are invalid.",
      details: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  // Known Prisma errors — translate into readable responses instead of a raw stack trace
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: "ConflictError",
        message: `A record with this ${(err.meta?.target as string[])?.join(", ") ?? "value"} already exists.`,
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        error: "NotFoundError",
        message: "The requested record was not found.",
      });
    }
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    error: "InternalServerError",
    message: "Something went wrong on our end. Please try again.",
  });
}
