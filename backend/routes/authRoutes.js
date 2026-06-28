const { Router } = require("express");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

function createAuthRoutes(authController) {
  const router = Router();
  router.post("/login", authLimiter, authController.login);
  return router;
}

module.exports = { createAuthRoutes };
