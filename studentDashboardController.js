const Registration = require("./registrationModel")
const Course = require("../courses/courseModel")

// @desc    Get student dashboard data
// @route   GET /api/registrations/dashboard
// @access  Private (Student)
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id

    // Get all registrations for the student
    const registrations = await Registration.find({ student: studentId })
      .populate({
        path: "course",
        select: "crn title credits instructor price description",
      })
      .sort({ createdAt: -1 })

    // Calculate statistics
    const totalRegistrations = registrations.length
    const activeRegistrations = registrations.filter((reg) => reg.status === "Active").length
    const pendingRegistrations = registrations.filter((reg) => reg.status === "Pending").length
    const inactiveRegistrations = registrations.filter((reg) => reg.status === "Inactive").length

    // Calculate total credit hours for active courses
    const totalCreditHours = registrations
      .filter((reg) => reg.status === "Active")
      .reduce((total, reg) => total + (reg.course?.credits || 0), 0)

    res.json({
      success: true,
      data: {
        registrations,
        statistics: {
          totalRegistrations,
          activeRegistrations,
          pendingRegistrations,
          inactiveRegistrations,
          totalCreditHours,
        },
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

module.exports = {
  getStudentDashboard,
}
