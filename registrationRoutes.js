const express = require("express")
const router = express.Router()
const {
  createRegistration,
  getAllRegistrations,
  getMyRegistrations,
  getStudentDashboard,
  getRegistration,
  updateRegistrationStatus,
  dropCourse,
  deleteRegistration,
} = require("./registrationController")

const { protect, authorize } = require("../middleware/auth")
const { validateRegistration } = require("../middleware/validation")

// Student routes
router.post("/", protect, authorize("student"), validateRegistration, createRegistration)
router.get("/my-registrations", protect, authorize("student"), getMyRegistrations)
router.get("/dashboard", protect, authorize("student"), getStudentDashboard)
router.put("/:id/drop", protect, authorize("student"), dropCourse)

// Admin routes
router.get("/", protect, authorize("admin"), getAllRegistrations)
router.put("/:id/status", protect, authorize("admin"), updateRegistrationStatus)
router.delete("/:id", protect, authorize("admin"), deleteRegistration)

// Shared routes (both student and admin)
router.get("/:id", protect, getRegistration)

module.exports = router
