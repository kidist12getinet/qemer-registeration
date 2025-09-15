"use client"

import type React from "react"
import { useState, useContext, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UserContext } from "../App"
import qemerLogo from "../assets/qemer.webp"
import coursesHero from "../assets/courses-hero.png"
import { FaCode } from "react-icons/fa"
import Footer from "./Footer"
import { motion } from "framer-motion"
import { getAllCourses } from "../services/courseService"
import { getMyRegistrations } from "../services/registrationService"
import { logout } from "../services/authService"
import type { Course } from "../services/api"

const Courses: React.FC = () => {
  const { user, setUser } = useContext(UserContext)
  const navigate = useNavigate()

  const [courses, setCourses] = useState<Course[]>([])
  const [userRegistrations, setUserRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fetch courses and user registrations
  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch all courses
      const coursesData = await getAllCourses()
      setCourses(coursesData)

      // Fetch user registrations if logged in
      if (user && !user.isAdmin) {
        try {
          const registrationsResponse = await getMyRegistrations()
          setUserRegistrations(registrationsResponse.data || [])
        } catch (regError) {
          console.error("Error fetching registrations:", regError)
          setUserRegistrations([])
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch courses")
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.crn.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "open" && course.status === "Active" && course.currentEnrollment < course.maxEnrollment) ||
      (selectedStatus === "full" && (course.status === "Inactive" || course.currentEnrollment >= course.maxEnrollment))

    return matchesSearch && matchesStatus
  })

  const isLoggedIn = !!user

  const getCourseAvailability = (course: Course) => {
    if (course.status === "Inactive") {
      return { status: "Inactive", canRegister: false, reason: "Course is inactive" }
    }

    if (course.currentEnrollment >= course.maxEnrollment) {
      return { status: "Full", canRegister: false, reason: "This course is full!" }
    }

    // Check if user is already registered for this course
    if (user && !user.isAdmin) {
      const userRegistration = userRegistrations.find(
        (reg) => reg.course?.crn === course.crn && (reg.status === "Active" || reg.status === "Pending"),
      )
      if (userRegistration) {
        const status = userRegistration.status === "Active" ? "Enrolled" : "Pending"
        return {
          status,
          canRegister: false,
          reason:
            userRegistration.status === "Active"
              ? "You are already enrolled in this course"
              : "Your registration is pending approval",
        }
      }
    }

    return { status: "Open", canRegister: true, reason: "" }
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate("/")
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
          <button onClick={fetchData} className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#F8F9FF] min-h-screen flex flex-col">
      {/* Header with animation */}
      <motion.header
        className={`bg-white shadow-sm py-6 px-6 fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "py-4 shadow-md" : "py-6"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img src={qemerLogo || "/placeholder.svg"} alt="Qemer Logo" className="h-16 w-auto" />
            <span className="text-xl font-semibold text-[#424747]">Qemer Training Hub</span>
          </motion.div>

          <nav className="hidden md:flex space-x-8">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/" className="text-[#424747] hover:text-[#424747CC] transition-colors">
                Home
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/courses" className="text-[#424747] font-medium">
                Courses
              </Link>
            </motion.div>
            {isLoggedIn && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to={user?.isAdmin ? "/admin-dashboard" : "/student-dashboard"}
                  className="text-[#424747] hover:text-[#424747CC] transition-colors"
                >
                  Dashboard
                </Link>
              </motion.div>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <span className="text-[#424747]">Hi, {user?.firstName}</span>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={handleLogout}
                    className="bg-[#424747] text-white px-4 py-2 rounded text-sm flex items-center gap-2 hover:bg-[#424747CC] transition-colors"
                  >
                    Logout
                  </button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link to="/login" className="text-[#424747] hover:text-[#424747CC] transition-colors">
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="bg-[#424747] text-white px-4 py-2 rounded hover:bg-[#424747CC] transition-colors"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.div
        className="bg-gradient-to-br from-white via-blue-50 to-white min-h-[calc(100vh-96px)] px-6 flex items-center justify-center mt-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
          <motion.div initial={{ x: -50 }} animate={{ x: 0 }} transition={{ type: "spring", stiffness: 100 }}>
            <h1 className="text-5xl font-bold text-[#424747] leading-tight">
              WELCOME TO THE <span className="text-blue-500">COURSES</span>
            </h1>
            <p className="text-2xl text-[#424747CC] mt-6 max-w-2xl">
              The program provides a variety of courses, detailed below, to help you develop expertise in different
              fields.
            </p>
          </motion.div>
          <motion.div
            className="mt-12 md:mt-0"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <img
              src={coursesHero || "/placeholder.svg"}
              alt="Training"
              className="w-full max-w-[600px] h-auto rounded-xl shadow-2xl"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-grow">
        {/* Course Filters */}
        <div className="max-w-7xl mx-auto py-16 px-6">
          <motion.h2
            className="text-4xl font-semibold text-[#424747] mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            COURSE FILTERS
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {/* Search */}
            <div>
              <h3 className="text-md font-medium text-[#424747] mb-3">SEARCH COURSES</h3>
              <motion.div className="relative" whileHover={{ scale: 1.01 }}>
                <input
                  type="text"
                  placeholder="Search by title or CRN..."
                  className="w-full px-4 py-3 border border-[#424747]/20 rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </motion.div>
            </div>

            {/* Status Filter */}
            <div>
              <h3 className="text-md font-medium text-[#424747] mb-3">STATUS</h3>
              <motion.div whileHover={{ scale: 1.01 }}>
                <select
                  className="w-full px-4 py-3 border border-[#424747]/20 rounded-md"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="full">Full</option>
                </select>
              </motion.div>
            </div>
          </motion.div>

          {/* Courses Section */}
          <motion.h2
            className="text-4xl font-semibold text-[#424747] mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Courses ({filteredCourses.length})
          </motion.h2>

          <div className="overflow-x-auto pb-8">
            <div className="flex flex-nowrap gap-8 pb-6 min-w-full">
              {filteredCourses.map((course, index) => {
                const availability = getCourseAvailability(course)
                return (
                  <motion.div
                    key={course._id}
                    className="min-w-[400px] max-w-[400px] bg-white rounded-lg shadow-md border border-[#424747]/10 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -10 }}
                  >
                    {/* Course Header */}
                    <div className={`p-8 ${!availability.canRegister ? "bg-gray-600" : "bg-[#424747]"} text-white`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4 }}
                          >
                            <FaCode size={32} className="mr-4" />
                          </motion.div>
                          <div>
                            <h3 className="text-2xl font-bold">{course.title}</h3>
                            <p className="text-md opacity-80">CRN: {course.crn}</p>
                          </div>
                        </div>
                        <motion.span
                          className={`text-sm font-medium px-3 py-1 rounded-full ${
                            availability.status === "Open"
                              ? "bg-green-500"
                              : availability.status === "Enrolled"
                                ? "bg-blue-500"
                                : availability.status === "Pending"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          }`}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                        >
                          {availability.status}
                        </motion.span>
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="p-8">
                      <div className="space-y-3 mb-6">
                        <p className="text-[#424747]">
                          <span className="font-medium">Credits:</span> {course.credits}
                        </p>
                        <p className="text-[#424747]">
                          <span className="font-medium">Instructor:</span> {course.instructor}
                        </p>
                        <p className="text-[#424747]">
                          <span className="font-medium">Capacity:</span> {course.currentEnrollment}/
                          {course.maxEnrollment}
                        </p>
                        <p className="text-[#424747]">
                          <span className="font-medium">Price:</span> {course.price}
                        </p>
                      </div>

                      <p className="text-sm text-[#424747CC] mb-6">{course.description}</p>

                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link
                          to={!availability.canRegister ? "#" : isLoggedIn ? `/register/${course.crn}` : `/signup`}
                          state={{ course: availability.canRegister ? course : null }}
                          className={`block text-center py-3 px-6 rounded-lg ${
                            availability.canRegister
                              ? "bg-[#424747] text-white hover:bg-[#424747CC]"
                              : "bg-gray-300 text-gray-600 cursor-not-allowed"
                          } transition-colors text-lg`}
                          onClick={(e) => {
                            if (!availability.canRegister) {
                              e.preventDefault()
                              alert(availability.reason || "This course is not available for registration.")
                            }
                          }}
                        >
                          {availability.status === "Enrolled"
                            ? "Already Enrolled"
                            : availability.status === "Pending"
                              ? "Pending Approval"
                              : availability.canRegister
                                ? "Register"
                                : availability.status}
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#424747CC] text-lg">No courses found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Courses
