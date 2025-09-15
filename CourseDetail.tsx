"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import qemerLogo from "../assets/qemer.webp"
import { FaSearch, FaCode, FaMobile, FaPaintBrush } from "react-icons/fa"
import { getAllCourses } from "../services/courseService"
import type { Course } from "../services/api"

const CourseDetail: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const coursesData = await getAllCourses()
      setCourses(coursesData)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIconForCourse = (title: string) => {
    if (title.toLowerCase().includes("web")) return <FaCode size={24} />
    if (title.toLowerCase().includes("mobile")) return <FaMobile size={24} />
    if (title.toLowerCase().includes("design")) return <FaPaintBrush size={24} />
    return <FaCode size={24} />
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.crn.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "All" || course.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="bg-[#F8F9FF] min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#424747]"></div>
      </div>
    )
  }

  return (
    <div className="bg-[#F8F9FF] min-h-screen pt-24">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={qemerLogo || "/placeholder.svg"} alt="Qemer Logo" className="h-10 w-auto" />
            <span className="text-lg font-semibold text-[#424747]">Qemer Training Hub</span>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-[#424747] hover:text-[#424747CC] transition-colors">
              Home
            </Link>
            <Link to="/courses" className="text-[#424747] font-medium">
              Courses
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-[#424747] hover:text-[#424747CC] transition-colors">
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-[#424747] text-white px-4 py-2 rounded hover:bg-[#424747CC] transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-white py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#424747]">
              WELCOME TO THE <span className="text-blue-500">COURSES</span>
            </h1>
            <p className="text-[#424747CC] mt-4 max-w-xl">
              The program offers Web Development, Mobile App Development, Graphics Design, and Data Science courses.
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <img src="/placeholder.svg?height=200&width=300" alt="Training" className="w-64 h-auto rounded-lg" />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-[#424747] mb-6">COURSE FILTERS</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Search Filter */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-[#424747] mb-2">
              SEARCH COURSES
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by title or CRN..."
                className="w-full px-4 py-2 pr-10 border border-[#424747]/20 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute right-3 top-3 text-[#424747]/50" />
            </div>
          </div>

          {/* Semester Filter (placeholder) */}
          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-[#424747] mb-2">
              SEMESTER
            </label>
            <select
              id="semester"
              className="w-full px-4 py-2 border border-[#424747]/20 rounded-md"
              defaultValue="All Semesters"
            >
              <option>All Semesters</option>
              <option>Fall 2025</option>
              <option>Spring 2026</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-[#424747] mb-2">
              STATUS
            </label>
            <select
              id="status"
              className="w-full px-4 py-2 border border-[#424747]/20 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-[#424747] mb-6">Courses</h2>

        {/* Course Cards */}
        <div className="overflow-x-auto pb-6">
          <div className="flex flex-nowrap gap-6 min-w-max">
            {filteredCourses.map((course) => {
              const isFull = course.currentEnrollment >= course.maxEnrollment
              const isInactive = course.status === "Inactive"
              const canRegister = !isFull && !isInactive

              return (
                <div
                  key={course._id}
                  className={`w-[350px] p-6 rounded-lg shadow-sm ${
                    !canRegister ? "bg-[#424747] text-white" : "bg-white text-[#424747]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div
                        className={`p-3 rounded-full ${!canRegister ? "bg-white text-[#424747]" : "bg-[#424747] text-white"}`}
                      >
                        {getIconForCourse(course.title)}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-bold">{course.title}</h3>
                        <p className={`text-sm ${!canRegister ? "text-white/80" : "text-[#424747CC]"}`}>
                          CRN: {course.crn}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        canRegister ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isInactive ? "Inactive" : isFull ? "Full" : "Open"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mb-4">
                    <p className={!canRegister ? "text-white/80" : "text-[#424747CC]"}>
                      <span className="font-medium">Credits:</span> {course.credits}
                    </p>
                    <p className={!canRegister ? "text-white/80" : "text-[#424747CC]"}>
                      <span className="font-medium">Instructor:</span> {course.instructor}
                    </p>
                    <p className={!canRegister ? "text-white/80" : "text-[#424747CC]"}>
                      <span className="font-medium">Capacity:</span> {course.currentEnrollment}/{course.maxEnrollment}
                    </p>
                    <p className={!canRegister ? "text-white/80" : "text-[#424747CC]"}>
                      <span className="font-medium">Price:</span> {course.price}
                    </p>
                  </div>

                  <p className={`mb-6 ${!canRegister ? "text-white/80" : "text-[#424747CC]"}`}>{course.description}</p>

                  <Link
                    to={canRegister ? `/signup` : "#"}
                    state={{ course: canRegister ? course : null }}
                    className={`inline-block px-4 py-2 rounded text-center w-full ${
                      !canRegister
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-[#424747] text-white hover:bg-[#424747CC] transition-colors"
                    }`}
                    onClick={(e) => {
                      if (!canRegister) {
                        e.preventDefault()
                      }
                    }}
                  >
                    {isInactive ? "Inactive" : isFull ? "Full" : "Register"}
                  </Link>
                </div>
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
  )
}

export default CourseDetail
