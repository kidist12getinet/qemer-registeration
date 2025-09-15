const Course = require("./courseModel")
const Registration = require("../registrations/registrationModel")
const User = require("../users/userModel")

// @desc    Get all courses with search and filter
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const { status, search } = req.query

    // Build filter object
    const filter = {}
    if (status) {
      filter.status = status
    }

    // Add search functionality for title and CRN
    if (search) {
      filter.$or = [{ title: { $regex: search, $options: "i" } }, { crn: { $regex: search, $options: "i" } }]
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 })
    res.json(courses)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get dashboard statistics with detailed breakdown
// @route   GET /api/courses/stats
// @access  Private/Admin
const getStat = async (req, res) => {
  try {
    const TotalCourse = await Course.countDocuments({ status: "Active" })
    const TotalInactiveCourses = await Course.countDocuments({ status: "Inactive" })
    const TotalAllCourses = await Course.countDocuments()

    const TotalRegisteredStudent = await Registration.countDocuments()
    const TotalActiveRegistrations = await Registration.countDocuments({ status: "Active" })
    const TotalPendingRegistrations = await Registration.countDocuments({ status: "Pending" })
    const TotalInactiveRegistrations = await Registration.countDocuments({ status: "Inactive" })

    // Get courses that are full or nearly full
    const courses = await Course.find({})
    const fullCourses = courses.filter((course) => course.currentEnrollment >= course.maxEnrollment).length
    const nearlyFullCourses = courses.filter((course) => {
      const percentage = (course.currentEnrollment / course.maxEnrollment) * 100
      return percentage >= 80 && percentage < 100
    }).length

    res.json({
      TotalCourse,
      TotalInactiveCourses,
      TotalAllCourses,
      TotalRegisteredStudent,
      TotalActiveRegistrations,
      TotalPendingRegistrations,
      TotalInactiveRegistrations,
      fullCourses,
      nearlyFullCourses,
      coursesNeedingAttention: fullCourses + nearlyFullCourses,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single course
// @route   GET /api/courses/id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (course) {
      res.json(course)
    } else {
      res.status(404).json({ message: "Course not found" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
  try {
    const course = new Course(req.body)
    const createdCourse = await course.save()
    res.status(201).json(createdCourse)
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Course with this CRN already exists" })
    } else {
      res.status(500).json({ message: error.message })
    }
  }
}

// @desc    Update course with enrollment validation
// @route   PUT /api/courses/id
// @access  Private/Admin
const updateCourse = async (req, res) => {
  const { id } = req.params
  try {
    const course = await Course.findById(id)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if course has active registrations - prevent critical updates
    const activeRegistrations = await Registration.countDocuments({
      course: course._id,
      status: "Active",
    })

    if (activeRegistrations > 0) {
      // Only allow certain fields to be updated when students are enrolled
      const allowedUpdatesWithStudents = ["description", "maxEnrollment"]
      const requestedUpdates = Object.keys(req.body)
      const hasRestrictedUpdates = requestedUpdates.some((update) => !allowedUpdatesWithStudents.includes(update))

      if (hasRestrictedUpdates) {
        return res.status(400).json({
          message: `Cannot modify course details while ${activeRegistrations} student(s) are actively enrolled. Only description and maxEnrollment can be updated.`,
          activeStudents: activeRegistrations,
        })
      }
    }

    // Validate maxEnrollment if being updated
    if (req.body.maxEnrollment && req.body.maxEnrollment < course.currentEnrollment) {
      return res.status(400).json({
        message: `Cannot reduce max enrollment to ${req.body.maxEnrollment} below current enrollment (${course.currentEnrollment})`,
        currentEnrollment: course.currentEnrollment,
      })
    }

    // Update allowed fields
    Object.assign(course, req.body)
    const updatedCourse = await course.save()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete course with validation
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
  const { id } = req.params
  try {
    const course = await Course.findById(id)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if course has any registrations (active or pending)
    const registrations = await Registration.find({
      course: course._id,
      status: { $in: ["Active", "Pending"] },
    })

    if (registrations.length > 0) {
      const activeCount = registrations.filter((r) => r.status === "Active").length
      const pendingCount = registrations.filter((r) => r.status === "Pending").length

      return res.status(400).json({
        message: `Cannot delete course "${course.title}" because it has ${activeCount} active student(s) and ${pendingCount} pending registration(s). Please ensure all students are withdrawn before deleting.`,
        activeStudents: activeCount,
        pendingStudents: pendingCount,
        canDelete: false,
      })
    }

    await Course.findByIdAndDelete(id)
    res.json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getStat,
}
