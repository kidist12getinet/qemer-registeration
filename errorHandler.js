const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.stack)

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found"
    return res.status(404).json({ message })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered"
    return res.status(400).json({ message })
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ")
    return res.status(400).json({ message })
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token"
    return res.status(401).json({ message })
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired"
    return res.status(401).json({ message })
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

module.exports = errorHandler
