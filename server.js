const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const connectDB = require("./config/db.js")
const errorHandler = require("./middleware/errorHandler.js")

dotenv.config()
const app = express()

connectDB()

// Middleware
app.use( cors(
  //{
  //   origin: process.env.FRONTEND_URL || "http://localhost:3000",
  //   credentials: true,
  // }
  ),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: false, limit: "10mb" }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`)
  next()
})

// Routes
app.use("/api/users", require("./users/userRoutes"))
app.use("/api/courses", require("./courses/courseRoutes"))
app.use("/api/registrations", require("./registrations/registrationRoutes"))
app.use("/api/registration-windows", require("./registrationWindows/registrationWindowRoutes"))

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Training Registration API is running...",
    endpoints: {
      users: "/api/users",
      courses: "/api/courses",
      registrations: "/api/registrations",
      registrationWindows: "/api/registration-windows",
    },
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`API Base URL: http://localhost:${PORT}/api`)
})
