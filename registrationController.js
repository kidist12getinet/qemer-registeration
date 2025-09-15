const Registration = require("./registrationModel")
const Course = require("../courses/courseModel")
const User = require("../users/userModel")
const RegistrationWindow = require("../registrationWindows/registrationWindowModel")

// @desc    Create new registration
// @route   POST /api/registrations
// @access  Private (Student)
const createRegistration = async (req, res) => {
  try {
    const {
      courseCrn, 
      phone,
      gender,
      schedule,
      mode,
      location,
      referral,
      hasPcDesktop,
    } = req.body

    // Validate required fields
    if (!courseCrn || !phone || !gender || !schedule || !mode || !location || !hasPcDesktop) {
      return res.status(400).json({
        message: "All required fields must be provided",
      })
    }

    // Find course by CRN instead of ID
    const course = await Course.findOne({ crn: courseCrn })
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    if (course.status !== "Active") {
      return res.status(400).json({ message: "Course is not available for registration" })
    }

    // Check course capacity
    if (course.currentEnrollment >= course.maxEnrollment) {
      return res.status(400).json({ message: "Course is full" })
    }

    // Check if user already registered for this course
    const existingRegistration = await Registration.findOne({
      student: req.user._id,
      course: course._id, // Use the found course's ObjectId
    })

    if (existingRegistration) {
      return res.status(400).json({
        message: "You are already registered for this course",
      })
    }

    // Create registration
    const registration = await Registration.create({
      student: req.user._id,
      course: course._id, // Use the found course's ObjectId
      phone,
      gender,
      schedule,
      mode,
      location,
      referral,
      hasPcDesktop,
      status: "Pending",
    })

    // Populate with student and course details
    await registration.populate([
      {
        path: "student",
        select: "firstName lastName email",
      },
      {
        path: "course",
        select: "crn title credits instructor price maxEnrollment currentEnrollment",
      },
    ])

    res.status(201).json({
      success: true,
      message: "Registration submitted successfully. Awaiting admin approval.",
      data: registration,
    })
  } catch (error) {
    console.error("Registration creation error:", error)

    // Handle duplicate registration error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You are already registered for this course",
      })
    }

    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    })
  }
}

// @desc    Get all registrations with filtering for admin reports
// @route   GET /api/registrations
// @access  Private (Admin)
const getAllRegistrations = async (req, res) => {
  try {
    const { status, courseCrn, startDate, endDate, student } = req.query

    // Build filter object
    const filter = {}
    if (status) filter.status = status
    if (student) filter.student = student

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate)
    }

    // If filtering by course CRN, find the course first
    if (courseCrn) {
      const course = await Course.findOne({ crn: courseCrn })
      if (course) {
        filter.course = course._id
      } else {
        return res.status(404).json({ message: "Course not found" })
      }
    }

    const registrations = await Registration.find(filter)
      .populate({
        path: "student",
        select: "firstName lastName email",
      })
      .populate({
        path: "course",
        select: "crn title credits instructor price",
      })
      .populate({
        path: "approvedBy",
        select: "firstName lastName",
      })
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    })
  } catch (error) {
    console.error("Get registrations error:", error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Get student's own registrations
// @route   GET /api/registrations/my-registrations
// @access  Private (Student)
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate({
        path: "course",
        select: "crn title credits instructor price schedule location",
      })
      .populate({
        path: "approvedBy",
        select: "firstName lastName",
      })
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    })
  } catch (error) {
    console.error("Get my registrations error:", error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Get student dashboard with comprehensive data
// @route   GET /api/registrations/dashboard
// @access  Private (Student)
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id

    const registrations = await Registration.find({ student: studentId })
      .populate({
        path: "course",
        select: "crn title credits instructor price description status maxEnrollment currentEnrollment",
      })
      .populate({
        path: "approvedBy",
        select: "firstName lastName",
      })
      .sort({ createdAt: -1 })

    // Calculate statistics
    const totalRegistrations = registrations.length
    const activeRegistrations = registrations.filter((reg) => reg.status === "Active")
    const pendingRegistrations = registrations.filter((reg) => reg.status === "Pending")
    const inactiveRegistrations = registrations.filter((reg) => reg.status === "Inactive")

    // Calculate total credit hours for active courses only
    const totalCreditHours = activeRegistrations.reduce((total, reg) => total + (reg.course?.credits || 0), 0)

    // Get registration window status
    const now = new Date()
    const registrationWindow = await RegistrationWindow.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isOpen: true,
    }).sort({ startDate: -1 })

    const isRegistrationOpen = !!registrationWindow

    res.json({
      success: true,
      data: {
        registrations,
        statistics: {
          totalRegistrations,
          activeRegistrations: activeRegistrations.length,
          pendingRegistrations: pendingRegistrations.length,
          inactiveRegistrations: inactiveRegistrations.length,
          totalCreditHours,
        },
        registrationWindow: registrationWindow
          ? {
              isOpen: isRegistrationOpen,
              startDate: registrationWindow.startDate,
              endDate: registrationWindow.endDate,
              description: registrationWindow.description,
            }
          : null,
      },
    })
  } catch (error) {
    console.error("Get student dashboard error:", error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
    })
  }
}

//admin
// @desc    Get single registration
// @route   GET /api/registrations/id
// @access  Private
const getRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate({
        path: "student",
        select: "firstName lastName email",
      })
      .populate({
        path: "course",
        select: "crn title credits instructor price description",
      })
      .populate({
        path: "approvedBy",
        select: "firstName lastName",
      })

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" })
    }

    // Check if user can access this registration
    if (req.user.role !== "admin" && registration.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json({
      success: true,
      data: registration,
    })
  } catch (error) {
    console.error("Get registration error:", error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Update registration status with validation (Admin)
// @route   PUT /api/registrations/:id/status
// @access  Private (Admin)
const updateRegistrationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body

    if (!["Pending", "Active", "Inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be Pending, Active, or Inactive" })
    }

    const registration = await Registration.findById(req.params.id)
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" })
    }

    const previousStatus = registration.status

    // Validate status transitions
    if (previousStatus === "Active" && status === "Pending") {
      return res.status(400).json({
        message: "Cannot change status from Active back to Pending. Use Inactive to withdraw student.",
      })
    }

    // Check course capacity when approving
    if (status === "Active" && previousStatus !== "Active") {
      const course = await Course.findById(registration.course)
      if (course && course.currentEnrollment >= course.maxEnrollment) {
        return res.status(400).json({
          message: `Cannot approve registration. Course is full (${course.currentEnrollment}/${course.maxEnrollment})`,
          courseFull: true,
        })
      }
    }

    // Update registration
    registration.status = status
    if (notes) registration.notes = notes

    // Handle enrollment count changes
    if (status === "Active" && previousStatus !== "Active") {
      registration.approvedBy = req.user._id
      registration.approvalDate = new Date()

      // Increase course enrollment
      await Course.findByIdAndUpdate(registration.course, { $inc: { currentEnrollment: 1 } })
    } else if (status === "Inactive" && previousStatus === "Active") {
      // Decrease course enrollment
      await Course.findByIdAndUpdate(registration.course, { $inc: { currentEnrollment: -1 } })
    }

    await registration.save()

    // Populate for response
    await registration.populate([
      { path: "student", select: "firstName lastName email" },
      { path: "course", select: "crn title credits instructor" },
      { path: "approvedBy", select: "firstName lastName" },
    ])

    res.json({
      success: true,
      message: `Registration ${status.toLowerCase()} successfully`,
      data: registration,
    })
  } catch (error) {
    console.error("Update registration status error:", error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Drop course (Student)
// @route   PUT /api/registrations/:id/drop
// @access  Private (Student)
const dropCourse = async (req, res) => {
  try {
    const { dropReason } = req.body

    const registration = await Registration.findById(req.params.id)
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" })
    }

    // Check if user owns this registration
    if (registration.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Check if registration can be dropped
    if (registration.status !== "Active") {
      return res.status(400).json({ message: "Only active registrations can be dropped" })
    }

    // Update registration
    registration.status = "Inactive"
    registration.dropReason = dropReason
    registration.dropDate = new Date()

    await registration.save()

    // Decrease course enrollment
    await Course.findByIdAndUpdate(registration.course, { $inc: { currentEnrollment: -1 } })

    res.json({
      success: true,
      message: "Course dropped successfully",
      data: registration,
    })
  } catch (error) {
    console.error("Drop course error:", error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Delete registration with validation (Admin)
// @route   DELETE /api/registrations/:id
// @access  Private (Admin)
const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" })
    }

    // Prevent deletion of active registrations
    if (registration.status === "Active") {
      return res.status(400).json({
        message:
          "Cannot delete active registration. Please change status to Inactive first or wait for student to drop the course.",
        canDelete: false,
        currentStatus: registration.status,
      })
    }

    // If registration was active, decrease course enrollment (shouldn't happen due to above check)
    if (registration.status === "Active") {
      await Course.findByIdAndUpdate(registration.course, { $inc: { currentEnrollment: -1 } })
    }

    await Registration.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Registration deleted successfully",
    })
  } catch (error) {
    console.error("Delete registration error:", error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
    })
  }
}

module.exports = {
  createRegistration,
  getAllRegistrations,
  getMyRegistrations,
  getStudentDashboard,
  getRegistration,
  updateRegistrationStatus,
  dropCourse,
  deleteRegistration,
}
