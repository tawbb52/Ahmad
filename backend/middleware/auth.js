const jwt = require("jsonwebtoken");

function authenticateToken(secret) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing authentication token." });
    }

    try {
      req.user = jwt.verify(token, secret);
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  };
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission." });
    }

    return next();
  };
}

module.exports = { authenticateToken, authorize };
