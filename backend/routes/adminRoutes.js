const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const { authenticateToken, authorize } = require("../middleware/auth");

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 180,
  standardHeaders: true,
  legacyHeaders: false,
});

function createAdminRoutes({ jwtSecret, adminController }) {
  const router = Router();

  router.get("/health", adminController.health);
  router.use(adminLimiter);
  router.use(authenticateToken(jwtSecret));
  router.use(authorize("admin", "manager"));

  router.get("/overview/stats", adminController.overview);
  router.get("/users", adminController.listUsers);
  router.post("/users", adminController.createUser);
  router.put("/users/:id", adminController.updateUser);
  router.delete("/users/:id", authorize("admin"), adminController.deleteUser);

  router.get("/devices", adminController.listDevices);
  router.post("/devices", adminController.createDevice);
  router.put("/devices/:id", adminController.updateDevice);
  router.delete("/devices/:id", authorize("admin"), adminController.deleteDevice);

  router.get("/plans", adminController.listPlans);
  router.get("/subscriptions", adminController.listSubscriptions);
  router.post("/subscriptions/renew", adminController.renewSubscription);

  router.get("/certificates", adminController.listCertificates);
  router.post("/certificates", adminController.createCertificate);
  router.put("/certificates/:id", adminController.updateCertificate);
  router.delete("/certificates/:id", authorize("admin"), adminController.deleteCertificate);

  router.get("/codes", adminController.listCodes);
  router.post("/codes", adminController.createCode);
  router.delete("/codes/:id", authorize("admin"), adminController.deleteCode);

  router.get("/activity-logs", adminController.listActivityLogs);

  return router;
}

module.exports = { createAdminRoutes };
