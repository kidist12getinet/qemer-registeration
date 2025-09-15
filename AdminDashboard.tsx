"use client"

import type React from "react"
import { useState, useContext, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UserContext } from "../App"
import qemerLogo from "../assets/qemer.webp"
import { FaSignOutAlt, FaChartBar, FaClipboardList, FaBook, FaDownload, FaEdit, FaUserPlus } from "react-icons/fa"
import Footer from "./Footer"
import OverviewTab from "./admin/OverviewTab"
import CourseManagementTab from "./admin/CourseManagementTab"
import RegistrationManagementTab from "./admin/RegistrationManagementTab"
import ReportsTab from "./admin/ReportsTab"
import AdminCreationTab from "./admin/AdminCreationTab"
import AdminProfileEditModal from "./admin/AdminProfileEditModal"
import { logout } from "../services/authService"

const AdminDashboard: React.FC = () => {
  const { user, setUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    if (!user.isAdmin) {
      navigate("/student-dashboard")
      return
    }
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate("/")
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#424747]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-6 px-6 fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={qemerLogo || "/placeholder.svg"} alt="Qemer Logo" className="h-12 w-auto" />
            <span className="text-lg font-semibold text-[#424747]">Qemer Training Hub - Admin</span>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-[#424747] hover:text-[#424747CC] transition-colors">
              Home
            </Link>
            <Link to="/admin-dashboard" className="text-[#424747] font-medium">
              Admin Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className="text-[#424747]">Hi, {user.firstName}</span>
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
              className="bg-[#424747] text-white px-4 py-2 rounded text-sm flex items-center gap-2 hover:bg-[#424747CC] transition-colors"
            >
              <FaSignOutAlt size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-20 px-6 flex-grow mt-24">
        <div className="flex justify-between items-center mb-16">
          <h1 className="text-5xl font-bold text-[#424747]">Admin Dashboard</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border border-[#424747]/20 inline-flex rounded-lg overflow-hidden">
            <button
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${
                activeTab === "overview" ? "bg-[#424747] text-white" : "bg-white text-[#424747]"
              } transition-colors`}
              onClick={() => setActiveTab("overview")}
            >
              <FaChartBar size={16} />
              Overview
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${
                activeTab === "courses" ? "bg-[#424747] text-white" : "bg-white text-[#424747]"
              } transition-colors`}
              onClick={() => setActiveTab("courses")}
            >
              <FaBook size={16} />
              Course Management
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${
                activeTab === "registrations" ? "bg-[#424747] text-white" : "bg-white text-[#424747]"
              } transition-colors`}
              onClick={() => setActiveTab("registrations")}
            >
              <FaClipboardList size={16} />
              Registration Management
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${
                activeTab === "reports" ? "bg-[#424747] text-white" : "bg-white text-[#424747]"
              } transition-colors`}
              onClick={() => setActiveTab("reports")}
            >
              <FaDownload size={16} />
              Reports & Analytics
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${
                activeTab === "admin-creation" ? "bg-[#424747] text-white" : "bg-white text-[#424747]"
              } transition-colors`}
              onClick={() => setActiveTab("admin-creation")}
            >
              <FaUserPlus size={16} />
              Create Admin
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "courses" && <CourseManagementTab />}
          {activeTab === "registrations" && <RegistrationManagementTab />}
          {activeTab === "reports" && <ReportsTab />}
          {activeTab === "admin-creation" && <AdminCreationTab />}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Admin Profile Edit Modal */}
      <AdminProfileEditModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </div>
  )
}

export default AdminDashboard
