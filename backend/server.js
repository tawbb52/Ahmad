const path = require("node:path");
const express = require("express");
const { loadEnv } = require("./config/env");
const { createDataStore } = require("./models/dataStore");
const { createAuthController } = require("./controllers/authController");
const { createAdminController } = require("./controllers/adminController");
const { createAuthRoutes } = require("./routes/authRoutes");
const { createAdminRoutes } = require("./routes/adminRoutes");

function createApp(overrides = {}) {
  const env = loadEnv(overrides);
  const store = createDataStore(env);
  const authController = createAuthController({ env, store });
  const adminController = createAdminController({ store });
  const app = express();
  const frontendPath = path.resolve(__dirname, "../frontend");

  app.use(express.json());
  app.use(express.static(frontendPath));

  app.use("/api/auth", createAuthRoutes(authController));
  app.use("/api", createAdminRoutes({ jwtSecret: env.jwtSecret, adminController }));

  app.get("/", (_req, res) => {
    res.sendFile(path.join(frontendPath, "login.html"));
  });

  app.use((err, _req, res, _next) => {
    return res.status(500).json({
      message: "Unexpected server error.",
      details: err.message,
    });
  });

  return app;
}

if (require.main === module) {
  const env = loadEnv();
  const app = createApp(env);
  app.listen(env.port, () => {
    console.log(`Ahmad Admin Dashboard listening on http://localhost:${env.port}`);
  });
}

module.exports = { createApp };
