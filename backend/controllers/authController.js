const jwt = require("jsonwebtoken");
const { timingSafeEqual } = require("node:crypto");

function safeEquals(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function createAuthController({ env, store }) {
  return {
    login(req, res) {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }

      if (!safeEquals(email.toLowerCase(), env.adminEmail.toLowerCase()) || !safeEquals(password, env.adminPassword)) {
        return res.status(401).json({ message: "Incorrect login credentials." });
      }

      const user = store.getAdminProfile();
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        },
        env.jwtSecret,
        { expiresIn: "8h" }
      );

      return res.json({
        token,
        user,
      });
    },
  };
}

module.exports = { createAuthController };
