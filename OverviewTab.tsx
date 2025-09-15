"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  FaUsers,
  FaBook,
  FaClipboardList,
  FaUserCheck,
  FaUserClock,
  FaChartLine,
  FaCalendarAlt,
  FaExclamationTriangle,
} from "react-icons/fa"
import { getAllCourses } from "../../services/courseService"
import { getAllRegistrations } from "../../services/registrationService"
import type { Course } from "../../services/api"

const OverviewTab: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [coursesData, registrationsResponse] = await Promise.all([getAllCourses(), getAllRegistrations()])
      setCourses(coursesData)
      setRegistrations(registrationsResponse.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate comprehensive dashboard stats
  const dashboardStats = {
    totalRegistrations: registrations.length,
    pendingRegistrations: registrations.filter((reg: any) => reg.status === "Pending").length,
    activeStudents: registrations.filter((reg: any) => reg.status === "Active").length,
    inactiveRegistrations: registrations.filter((reg: any) => reg.status === "Inactive").length,
    totalCourses: courses.length,
    activeCourses: courses.filter((c) => c.status === "Active").length,
    inactiveCourses: courses.filter((c) => c.status === "Inactive").length,
    fullCourses: courses.filter((c) => c.currentEnrollment >= c.maxEnrollment).length,
  }

  // Get courses that need attention (full or nearly full)
  const coursesNeedingAttention = courses.filter((course) => {
    const enrollmentPercentage = (course.currentEnrollment / course.maxEnrollment) * 100
    return enrollmentPercentage >= 80 || course.status === "Inactive"
  })

  // Get recent activity (last 5 registrations)
  const recentActivity = registrations
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#424747]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-[#424747] mb-4">Admin Dashboard Overview</h2>
        <p className="text-lg text-[#424747CC] mb-6">
          Welcome to your administrative control center. Monitor registrations, manage courses, and oversee the training
          program.
        </p>

        {/* Alert for pending registrations */}
        {dashboardStats.pendingRegistrations > 0 && (
          <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-3 text-yellow-600" size={20} />
                <div>
                  <h3 className="font-semibold text-yellow-800">Attention Required</h3>
                  <p className="text-sm text-yellow-600">
                    {dashboardStats.pendingRegistrations} registration
                    {dashboardStats.pendingRegistrations > 1 ? "s" : ""} awaiting approval
                  </p>
                </div>
              </div>
              <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                <FaExclamationTriangle className="mr-2" size={14} />
                <span className="text-sm font-medium">
                  {dashboardStats.pendingRegistrations} pending approval
                  {dashboardStats.pendingRegistrations > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Registrations</p>
              <p className="text-3xl font-bold text-blue-600">{dashboardStats.totalRegistrations}</p>
              <p className="text-xs text-gray-500 mt-1">All submissions</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaClipboardList className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-600">{dashboardStats.pendingRegistrations}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaUserClock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-3xl font-bold text-green-600">{dashboardStats.activeStudents}</p>
              <p className="text-xs text-gray-500 mt-1">Enrolled & active</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaUserCheck className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-3xl font-bold text-purple-600">{dashboardStats.activeCourses}</p>
              <p className="text-xs text-gray-500 mt-1">Available for enrollment</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaBook className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registration Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#424747]">Recent Registration Activity</h3>
            <FaChartLine className="text-[#424747]" size={20} />
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((reg: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-3 ${
                        reg.status === "Active"
                          ? "bg-green-500"
                          : reg.status === "Pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium text-[#424747]">
                        {reg.student?.firstName} {reg.student?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{reg.course?.title || "N/A"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reg.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : reg.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {reg.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{new Date(reg.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FaUsers className="mx-auto text-gray-400 mb-3" size={32} />
                <p className="text-gray-500">No registrations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Course Status Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#424747]">Course Enrollment Status</h3>
            <FaBook className="text-[#424747]" size={20} />
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-[#424747] truncate">{course.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {course.currentEnrollment}/{course.maxEnrollment}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        course.status === "Inactive"
                          ? "bg-red-500"
                          : course.currentEnrollment >= course.maxEnrollment
                            ? "bg-orange-500"
                            : (course.currentEnrollment / course.maxEnrollment) * 100 >= 80
                              ? "bg-yellow-500"
                              : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min((course.currentEnrollment / course.maxEnrollment) * 100, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>CRN: {course.crn}</span>
                    <span>{Math.round((course.currentEnrollment / course.maxEnrollment) * 100)}% full</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FaBook className="mx-auto text-gray-400 mb-3" size={32} />
                <p className="text-gray-500">No courses available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      {(coursesNeedingAttention.length > 0 || dashboardStats.pendingRegistrations > 0) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FaExclamationTriangle className="text-orange-500 mr-2" size={20} />
            <h3 className="text-xl font-bold text-[#424747]">Attention Required</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardStats.pendingRegistrations > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaUserClock className="text-yellow-600 mr-2" size={16} />
                  <h4 className="font-medium text-yellow-800">Pending Registrations</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  {dashboardStats.pendingRegistrations} student{dashboardStats.pendingRegistrations > 1 ? "s" : ""}{" "}
                  waiting for approval
                </p>
              </div>
            )}

            {coursesNeedingAttention.length > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <FaBook className="text-orange-600 mr-2" size={16} />
                  <h4 className="font-medium text-orange-800">Courses Need Attention</h4>
                </div>
                <p className="text-sm text-orange-700">
                  {coursesNeedingAttention.length} course{coursesNeedingAttention.length > 1 ? "s" : ""} are full or
                  inactive
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OverviewTab
