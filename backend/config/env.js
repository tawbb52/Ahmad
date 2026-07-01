const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function loadEnv(overrides = {}) {
  return {
    port: Number(overrides.port || process.env.PORT || 3000),
    jwtSecret:
      overrides.jwtSecret || process.env.JWT_SECRET || "change-me-in-production",
    adminEmail:
      overrides.adminEmail || process.env.ADMIN_EMAIL || "admin@ahmad.local",
    adminPassword:
      overrides.adminPassword || process.env.ADMIN_PASSWORD || "Admin123!",
    databaseUrl: overrides.databaseUrl || process.env.DATABASE_URL || "",
  };
}

module.exports = { loadEnv };
