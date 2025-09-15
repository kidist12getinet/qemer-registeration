"use client"

import type React from "react"
import { useState, useContext, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UserContext } from "../App"
import qemerLogo from "../assets/qemer.webp"
import { FaSignOutAlt, FaTrashAlt, FaBook, FaChartLine, FaUser, FaEdit, FaClock, FaCheckCircle } from "react-icons/fa"
import Footer from "./Footer"
import ProfileEditModal from "./student/ProfileEditModal"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  getStudentDashboard,
  dropCourse,
  type StudentDashboardData,
  type Registration,
} from "../services/registrationService"
import { logout } from "../services/authService"

// Zod schema for course drop confirmation
const dropCourseSchema = z.object({
  confirmDrop: z.boolean().refine((val) => val === true, {
    message: "You must confirm to drop the course",
  }),
  reason: z.string().optional(),
})

type DropCourseFormValues = z.infer<typeof dropCourseSchema>

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, setUser } = useContext(UserContext)

  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showDropConfirm, setShowDropConfirm] = useState<string | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // React Hook Form for drop course confirmation
  const {
    register: registerDrop,
    handleSubmit: handleDropSubmit,
    formState: { errors: dropErrors, isSubmitting: isDropSubmitting },
    reset: resetDropForm,
    watch: watchDrop,
  } = useForm<DropCourseFormValues>({
    resolver: zodResolver(dropCourseSchema),
    defaultValues: {
      confirmDrop: false,
      reason: "",
    },
  })

  const confirmDropValue = watchDrop("confirmDrop")

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (user.isAdmin) {
      navigate("/admin-dashboard")
      return
    }

    fetchDashboardData()
  }, [user, navigate])

  const fetchDashboardData = async () => {
    if (!user || user.isAdmin) return

    try {
      setLoading(true)
      const response = await getStudentDashboard()
      setDashboardData(response.data!)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleDropCourse = (registrationId: string) => {
    setShowDropConfirm(registrationId)
    resetDropForm()
  }

  const onDropSubmit = async (data: DropCourseFormValues) => {
    if (!showDropConfirm) return

    try {
      await dropCourse(showDropConfirm, data.reason)

      // Refresh dashboard data
      await fetchDashboardData()

      setShowDropConfirm(null)
      resetDropForm()
      alert("Course dropped successfully!")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to drop course")
    }
  }

  const cancelDropCourse = () => {
    setShowDropConfirm(null)
    resetDropForm()
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate("/")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getRegistrationToDropName = () => {
    if (!showDropConfirm || !dashboardData) return ""
    const registration = dashboardData.registrations.find((reg) => reg._id === showDropConfirm)
    return registration?.course?.title || "Unknown Course"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#424747]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!user || !dashboardData) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  const displayName = `${user.firstName} ${user.lastName}`
  const firstName = user.firstName

  // Separate active and pending registrations
  const activeRegistrations = dashboardData.registrations.filter((reg: Registration) => reg.status === "Active")
  const pendingRegistrations = dashboardData.registrations.filter((reg: Registration) => reg.status === "Pending")

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={qemerLogo || "/placeholder.svg"} alt="Qemer Logo" className="h-10 w-auto" />
            <span className="text-lg font-semibold text-[#424747]">Qemer Training Hub</span>
          </div>

          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-[#424747] hover:text-[#424747CC] transition-colors">
              Home
            </Link>
            <Link to="/courses" className="text-[#424747] hover:text-[#424747CC] transition-colors">
              Courses
            </Link>
            <Link to="/student-dashboard" className="text-[#424747] font-medium flex items-center gap-1">
              <FaUser className="inline" /> Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className="text-[#424747] hidden sm:inline">Hi, {firstName}</span>
              <button
                onClick={() => setShowProfileModal(true)}
                className="ml-2 text-[#424747] hover:text-[#424747CC] p-1 rounded-full hover:bg-gray-100"
                title="Edit Profile"
              >
                <FaEdit size={14} />
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="bg-[#424747] text-white px-3 py-1.5 rounded text-sm flex items-center gap-2 hover:bg-[#424747CC] transition-colors"
            >
              <FaSignOutAlt size={12} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 flex-grow mt-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#424747] mb-8">Student Dashboard</h1>

        {/* Welcome Section */}
        <section className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#424747] mb-2">Welcome, {displayName}!</h2>
              <p className="text-lg text-[#424747CC]">Here's an overview of your current courses</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaCheckCircle className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#424747] mb-1">Total Registrations</h3>
                <p className="text-3xl font-bold text-[#424747]">{dashboardData.statistics.totalRegistrations}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#424747] mb-1">Active Courses</h3>
                <p className="text-3xl font-bold text-[#424747]">{dashboardData.statistics.activeRegistrations}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-6 flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#424747] mb-1">Pending Approvals</h3>
                <p className="text-3xl font-bold text-[#424747]">{dashboardData.statistics.pendingRegistrations}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FaChartLine className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#424747] mb-1">Total Credits</h3>
                <p className="text-3xl font-bold text-[#424747]">{dashboardData.statistics.totalCreditHours}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Registration Window Status */}
        {dashboardData.registrationWindow && (
          <div
            className={`mb-8 p-4 rounded-lg border ${
              dashboardData.registrationWindow.isOpen ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className={`font-semibold ${dashboardData.registrationWindow.isOpen ? "text-green-800" : "text-red-800"}`}
                >
                  Registration Status: {dashboardData.registrationWindow.isOpen ? "OPEN" : "CLOSED"}
                </h3>
                <p className={`text-sm ${dashboardData.registrationWindow.isOpen ? "text-green-600" : "text-red-600"}`}>
                  Registration Period: {formatDate(dashboardData.registrationWindow.startDate)} -{" "}
                  {formatDate(dashboardData.registrationWindow.endDate)}
                </p>
                {dashboardData.registrationWindow.description && (
                  <p className="text-sm mt-1">{dashboardData.registrationWindow.description}</p>
                )}
              </div>
              {dashboardData.registrationWindow.isOpen && (
                <Link
                  to="/courses"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Browse Courses
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Active Courses Section */}
        <section className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#424747] mb-2">Your Active Courses</h2>
              <p className="text-[#424747CC]">Courses you're currently enrolled in</p>
            </div>
          </div>

          {activeRegistrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#424747]/10">
                    <th className="text-left py-3 px-4 font-semibold text-[#424747]">Course</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#424747] hidden sm:table-cell">CRN</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#424747]">Credits</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#424747] hidden md:table-cell">
                      Instructor
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-[#424747]">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#424747]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRegistrations.map((registration) => (
                    <tr key={registration._id} className="border-b border-[#424747]/10 hover:bg-[#F8F9FF]">
                      <td className="py-4 px-4 font-medium text-[#424747]">
                        <div className="font-medium">{registration.course.title}</div>
                        <div className="text-sm text-[#424747CC] sm:hidden">CRN: {registration.course.crn}</div>
                      </td>
                      <td className="py-4 px-4 text-[#424747] hidden sm:table-cell">{registration.course.crn}</td>
                      <td className="py-4 px-4 text-[#424747]">{registration.course.credits}</td>
                      <td className="py-4 px-4 text-[#424747] hidden md:table-cell">
                        {registration.course.instructor}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaCheckCircle className="mr-1" size={12} />
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded flex items-center gap-1 hover:bg-red-200 transition-colors"
                          title="Drop Course"
                          onClick={() => handleDropCourse(registration._id)}
                        >
                          <FaTrashAlt size={12} />
                          <span>Drop</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-[#F8F9FF] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FaBook className="text-[#424747] text-2xl" />
              </div>
              <h3 className="text-xl font-medium text-[#424747] mb-2">No Active Courses</h3>
              <p className="text-[#424747CC] mb-6">You don't have any active course enrollments.</p>
              <Link
                to="/courses"
                className="inline-block bg-[#424747] text-white px-6 py-2 rounded-lg hover:bg-[#424747CC] transition-colors"
              >
                Browse Available Courses
              </Link>
            </div>
          )}
        </section>

        {/* Pending Registrations Section */}
        <section className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#424747] mb-2">Pending Course Registrations</h2>
              <p className="text-[#424747CC]">Courses waiting for admin approval</p>
            </div>
          </div>

          {pendingRegistrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#424747]/10">
                    <th className="text-left py-3 px-4 font-semibold text-[#424747]">Course</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#424747] hidden sm:table-cell">CRN</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#424747] hidden md:table-cell">
                      Registration Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-[#424747]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRegistrations.map((registration) => (
                    <tr key={registration._id} className="border-b border-[#424747]/10 hover:bg-[#F8F9FF]">
                      <td className="py-4 px-4 font-medium text-[#424747]">
                        <div className="font-medium">{registration.course.title}</div>
                        <div className="text-sm text-[#424747CC] sm:hidden">CRN: {registration.course.crn}</div>
                        <div className="text-xs text-[#424747CC] md:hidden mt-1">
                          Registered: {formatDate(registration.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#424747] hidden sm:table-cell">{registration.course.crn}</td>
                      <td className="py-4 px-4 text-[#424747] hidden md:table-cell">
                        {formatDate(registration.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <FaClock className="mr-1" size={12} />
                          Pending Approval
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-[#F8F9FF] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FaClock className="text-[#424747] text-2xl" />
              </div>
              <h3 className="text-xl font-medium text-[#424747] mb-2">No Pending Registrations</h3>
              <p className="text-[#424747CC] mb-6">You don't have any course registrations awaiting approval.</p>
            </div>
          )}
        </section>

        {/* Drop Course Confirmation Modal */}
        {showDropConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-xl font-bold text-[#424747] mb-4">Confirm Course Drop</h3>

              <form onSubmit={handleDropSubmit(onDropSubmit)} className="space-y-4">
                <div>
                  <p className="text-[#424747] mb-4">
                    Are you sure you want to drop <strong>{getRegistrationToDropName()}</strong>? This action cannot be
                    undone.
                  </p>

                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="confirmDrop"
                      {...registerDrop("confirmDrop")}
                      className="mr-2 h-4 w-4 text-[#424747] focus:ring-[#424747] border-gray-300 rounded"
                    />
                    <label htmlFor="confirmDrop" className="text-sm text-[#424747]">
                      I confirm that I want to drop this course
                    </label>
                  </div>
                  {dropErrors.confirmDrop && <p className="text-red-500 text-sm">{dropErrors.confirmDrop.message}</p>}
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-[#424747] mb-1">
                    Reason for dropping (optional)
                  </label>
                  <textarea
                    id="reason"
                    {...registerDrop("reason")}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#424747] focus:border-[#424747]"
                    placeholder="Please provide a reason for dropping this course..."
                  />
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 border border-[#424747] text-[#424747] rounded hover:bg-gray-100 transition-colors"
                    onClick={cancelDropCourse}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDropSubmitting || !confirmDropValue}
                    className={`px-4 py-2 rounded transition-colors ${
                      confirmDropValue && !isDropSubmitting
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isDropSubmitting ? "Dropping..." : "Drop Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Profile Edit Modal */}
        <ProfileEditModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default StudentDashboard
