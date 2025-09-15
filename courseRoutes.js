const express = require("express")
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse, getStat } = require("./courseController")
const { protect, admin } = require("../middleware/auth")
const { validateCourse } = require("../middleware/validation")

const router = express.Router()

router.route("/").get(getCourses).post(protect, admin, validateCourse, createCourse)

router.get("/stats", protect, admin, getStat)

router
  .route("/:id")
  .get(getCourse)
  .put(protect, admin, updateCourse) // Partial validation handled in controller
  .delete(protect, admin, deleteCourse)

module.exports = router
