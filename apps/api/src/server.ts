import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import rateLimit from "express-rate-limit";
import { env, validateEnv } from "./config/env";
import { holderService } from "./services/holder.service";
import { gameService } from "./services/game.service";

// Routes
import holdersRoutes from "./routes/holders.routes";
import gameRoutes from "./routes/game.routes";
import submissionsRoutes from "./routes/submissions.routes";
import adminRoutes from "./routes/admin.routes";
import statsRoutes from "./routes/stats.routes";

// Validate environment variables
validateEnv();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/holders", holdersRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stats", statsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start holder sync with WebSocket broadcasting
holderService.startSync((holders) => {
  io.emit("holders:updated", {
    holders: holders.slice(0, 10),
    timestamp: new Date().toISOString(),
  });
});

// Start game round manager with WebSocket broadcasting
gameService.startManager((round, phase) => {
  if (phase === "started") {
    io.emit("round:started", { round });
  } else if (phase === "submission_window") {
    io.emit("round:submission_window", { round });
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  holderService.stopSync();
  gameService.stopManager();
  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Start server
const PORT = parseInt(env.PORT);
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});

export { app, httpServer, io };
