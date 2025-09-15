const jwt = require("jsonwebtoken")
const User = require("../users/userModel")

const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]

      // Verify token with automatic expiration check
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Find user by the correct field (should be 'id' not 'userId' based on your decode)
      req.user = await User.findById(decoded.id).select("-password")

      if (!req.user) {
        return res.status(401).json({ message: "User not found, token invalid" })
      }

      console.log(req.user)
      next()
    } catch (error) {
      console.error("Token verification error:", error.message)

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired, please login again",
          expired: true,
        })
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" })
      } else {
        return res.status(401).json({ message: "Not authorized, token failed" })
      }
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" })
  }
}

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      })
    }
    next()
  }
}

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(401).json({ message: "Not authorized as admin" })
  }
}

module.exports = { protect, authorize, admin }
