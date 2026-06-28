const path = require("node:path");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { loadEnv } = require("./config/env");
const { createDataStore } = require("./models/dataStore");
const { createAuthController } = require("./controllers/authController");
const { createAdminController } = require("./controllers/adminController");
const { createAuthRoutes } = require("./routes/authRoutes");
const { createAdminRoutes } = require("./routes/adminRoutes");

const rootLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

function createApp(overrides = {}) {
  const env = loadEnv(overrides);
  const store = createDataStore(env);
  const authController = createAuthController({ env, store });
  const adminController = createAdminController({ store });
  const app = express();
  const frontendPath = path.resolve(__dirname, "../frontend");

  // تفعيل CORS لدعم الجوال
  app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.*", "http://*:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(express.static(frontendPath));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", createAuthRoutes(authController));
  app.use("/api", createAdminRoutes({ jwtSecret: env.jwtSecret, adminController }));

  app.get("/", rootLimiter, (_req, res) => {
    res.sendFile(path.join(frontendPath, "login.html"));
  });

  // Fallback لجميع الطلبات
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });

  app.use((err, _req, res, _next) => {
    console.error("Server error:", err);
    return res.status(500).json({
      message: "خطأ في الخادم",
      details: err.message,
    });
  });

  return app;
}

if (require.main === module) {
  const env = loadEnv();
  const app = createApp(env);
  const host = "0.0.0.0"; // للاستماع من أي جهاز على الشبكة
  app.listen(env.port, host, () => {
    console.log(`🚀 Ahmad Admin Dashboard`);
    console.log(`📱 الجوال: http://<your-ip>:${env.port}`);
    console.log(`💻 الويب: http://localhost:${env.port}`);
  });
}

module.exports = { createApp };
