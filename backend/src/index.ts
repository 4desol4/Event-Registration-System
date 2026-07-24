import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

import { eventsRouter } from "./routes/events";
import { formsRouter } from "./routes/forms";
import { buildSubmissionsRouter } from "./routes/submissions";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { errorHandler } from "./middleware/errorHandler";
import { prisma } from "./lib/prisma";

function runMigrations() {
  if (process.env.SKIP_DB_MIGRATIONS === "true") {
    console.log("Skipping Prisma migrations because SKIP_DB_MIGRATIONS=true");
    return;
  }

  console.log("Running Prisma database migrations...");
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: process.env,
    cwd: process.cwd(),
  });
}

runMigrations();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5174")
  .split(",")
  .map((o) => o.trim());

const io = new SocketIOServer(httpServer, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});

// Real-time submission data is the same sensitive data the REST endpoints
// protect — a socket connection must present a valid JWT too, or anyone
// could open a raw websocket and join a form's room without ever logging in.
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    next();
  } catch {
    next(new Error("Invalid or expired session"));
  }
});

// Admin dashboards join a room per form to receive only relevant live updates
io.on("connection", (socket) => {
  socket.on("join_form", (formId: string) => {
    socket.join(`form:${formId}`);
  });
  socket.on("leave_form", (formId: string) => {
    socket.leave(`form:${formId}`);
  });
});

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "2mb" }));

const frontendPath = path.resolve(process.cwd(), "../frontend/dist");
const serveFrontend = process.env.SERVE_FRONTEND === "true";

if (serveFrontend && fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath, { index: false }));

  app.get("*", (req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.includes(".")) return next();
    const apiPrefixes = [
      "/health",
      "/auth",
      "/users",
      "/events",
      "/forms",
      "/submissions",
      "/r",
    ];
    if (
      apiPrefixes.some(
        (prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`),
      )
    ) {
      return next();
    }
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Health check — used by deployment/monitoring and by Phase 7's load test
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

// Public short-link redirect: what the printed QR code actually points to.
// Redirects to the attendee form frontend, passing the slug along.
app.get("/r/:slug", (req, res) => {
  const frontendUrl =
    process.env.ATTENDEE_FRONTEND_URL ||
    process.env.FRONTEND_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:5174");
  res.redirect(`${frontendUrl.replace(/\/$/, "")}/r/${req.params.slug}`);
});

// Shorter typed-friendly path for hotspot stations and manual entry.
app.get("/go/:slug", (req, res) => {
  const frontendUrl =
    process.env.ATTENDEE_FRONTEND_URL ||
    process.env.FRONTEND_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:5174");
  res.redirect(`${frontendUrl.replace(/\/$/, "")}/r/${req.params.slug}`);
});

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/events", eventsRouter);
app.use("/forms", formsRouter);
app.use("/", buildSubmissionsRouter(io));

app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
httpServer.listen(PORT, () => {
  console.log(`✔ API + Socket.io server running on port ${PORT}`);
});

// Graceful shutdown — important once this is handling live event traffic
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
});
