"use client"

import type React from "react"
import emailjs from "emailjs-com"
import { useState, useEffect } from "react"
import {
  FaEye,
  FaTrash,
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
  FaExclamationTriangle,
  FaCalendarAlt,
} from "react-icons/fa"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { getAllRegistrations, updateRegistrationStatus, deleteRegistration } from "../../services/registrationService"
import {
  getCurrentRegistrationWindow,
  createRegistrationWindow,
  updateRegistrationWindow,
} from "../../services/registrationWindowService"

const registrationWindowSchema = z
  .object({
    startDate: z
      .string()
      .min(1, { message: "Start date is required" })
      .refine(
        (date) => {
          const selectedDate = new Date(date)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return selectedDate >= today
        },
        { message: "Start date cannot be in the past" },
      ),

    endDate: z.string().min(1, { message: "End date is required" }), 
    isOpen: z.boolean(), 
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      return endDate > startDate
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  )

type RegistrationWindowFormValues = z.infer<typeof registrationWindowSchema>

const RegistrationManagementTab: React.FC = () => {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [currentWindow, setCurrentWindow] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationMessage, setValidationMessage] = useState("")
  const [showWindowForm, setShowWindowForm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<RegistrationWindowFormValues>({
    resolver: zodResolver(registrationWindowSchema),
    defaultValues: {
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isOpen: true,
      description: "",
    },
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [registrationsResponse, windowResponse] = await Promise.all([
        getAllRegistrations(),
        getCurrentRegistrationWindow(),
      ]) 
      setRegistrations(registrationsResponse.data || [])
      setCurrentWindow(windowResponse)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate dashboard stats from real data
  const dashboardStats = {
    totalRegistrations: registrations.length,
    pendingRegistrations: registrations.filter((reg: any) => reg.status === "Pending").length,
    activeStudents: registrations.filter((reg: any) => reg.status === "Active").length,
    inactiveRegistrations: registrations.filter((reg: any) => reg.status === "Inactive").length,
  }

  // Handle view registration
  const handleViewRegistration = (registration: any) => {
    setSelectedRegistration(registration)
    setShowViewModal(true)
  }

  // Function to validate if a registration can be deleted
  const canDeleteRegistration = (registration: any) => {
    return registration.status === "Pending" || registration.status === "Inactive"
  }

  // Handle delete registration with validation
  const handleDeleteRegistration = async (registration: any) => {
    if (!canDeleteRegistration(registration)) {
      setValidationMessage(
        `Cannot delete registration for ${registration.student?.firstName || registration.student?.name} ${registration.student?.lastName || ""}. ` +
          `Active registrations cannot be deleted. The student must drop the course first, ` +
          `which will change the status to "Inactive", then you can delete it.`,
      )
      setShowValidationModal(true)
      return
    }

    const statusText = registration.status === "Pending" ? "pending" : "inactive"
    if (
      window.confirm(
        `Are you sure you want to delete this ${statusText} registration for ${registration.student?.firstName || registration.student?.name} ${registration.student?.lastName || ""}? ` +
          `This action cannot be undone.`,
      )
    ) {
      try {
        await deleteRegistration(registration._id)
        await fetchData() // Refresh data
        alert("Registration deleted successfully!")
      } catch (error) {
        console.error("Error deleting registration:", error)
        alert("Error deleting registration. Please try again.")
      }
    }
  }

  // Initialize EmailJS (call this once when component mounts)
  useEffect(() => {
    // Initialize EmailJS with your public key
    emailjs.init("yviG4X5Bh3a4Gd17v")
  }, [])

  
  const sendEmail = async (registration: any, status: string) => {
    try {
      console.log(" Registration data:", registration)

      // Extract student information with fallbacks
      const studentEmail = registration.student?.email
      const studentName = registration.student?.firstName || registration.student?.name || "Student"
      const studentLastName = registration.student?.lastName || ""
      const fullStudentName = `${studentName} ${studentLastName}`.trim()
      const courseTitle = registration.course?.title || "Course"

      console.log("Email details:")
      console.log("- To Email:", studentEmail)
      console.log("- Student Name:", fullStudentName)
      console.log("- Course:", courseTitle)
      console.log("- Status:", status)

      // Validate email exists
      if (!studentEmail) {
        console.error(" No student email found")
        alert("Cannot send email: Student email not found")
        return
      }

      // Choose template and create message based on status
      let templateId = ""
      let subject = ""

      if (status === "Active") {
        // Use approval template
        templateId = "template_wprisva" 
        subject = `Registration Approved - ${courseTitle}`
      } else if (status === "Inactive") {
        // Use rejection template
        templateId = "template_1yj65jm" 
        subject = `Registration Update - ${courseTitle}`
      }

      // Template parameters for EmailJS
      const templateParams = {
        to_name: fullStudentName,
        to_email: studentEmail,
        subject: subject,
        student_name: fullStudentName,
        course_title: courseTitle,
        course_crn: registration.course?.crn || "N/A",
      }

      console.log(" Template params:", templateParams)
      console.log(" Using template:", templateId)

      // Send email using EmailJS with the appropriate template
      const result = await emailjs.send(
        "service_u7a64ft", 
        templateId, // Dynamic template ID based on status
        templateParams,
      )

      console.log(" Email sent successfully:", result)
      alert(`${status === "Active" ? "Approval" : "Update"} email sent successfully to ${studentEmail}!`)
    } catch (error: any) {
      console.error(" Failed to send email:", error)

      // More specific error messages
      if (error.text) {
        console.error("EmailJS Error:", error.text)
        if (error.text.includes("Account not found")) {
          alert("EmailJS Error: Account not found. Please check your EmailJS configuration.")
        } else if (error.text.includes("Template not found")) {
          alert("EmailJS Error: Template not found. Please check your template ID.")
        } else if (error.text.includes("Service not found")) {
          alert("EmailJS Error: Service not found. Please check your service ID.")
        } else {
          alert(`Failed to send email notification: ${error.text}`)
        }
      } else {
        alert("Failed to send email notification. Please check your EmailJS configuration.")
      }
    }
  }

  // Update registration status
  const updateStatus = async (registration: any, newStatus: string) => {
    try {
      console.log("🔄 Updating status for:", registration)

      await updateRegistrationStatus(registration._id, newStatus)

      // Send email notification after successful status update
      if (newStatus === "Active" || newStatus === "Inactive") {
        await sendEmail(registration, newStatus)
      }

      await fetchData() // Refresh data
    } catch (error) {
      console.error("Error updating registration status:", error)
      alert("Error updating registration status. Please try again.")
    }
  }

  const onSubmit = async (data: RegistrationWindowFormValues) => {
    try {
      if (currentWindow) {
        await updateRegistrationWindow(currentWindow._id, data)
        alert("Registration window updated successfully!")
      } else {
        await createRegistrationWindow(data)
        alert("Registration window created successfully!")
      }
      await fetchData() 
      setShowWindowForm(false)
      reset()
    } catch (error) {
      console.error("Error saving registration window:", error)
      alert("Error saving registration window. Please try again.")
    }
  }

  const handleEditWindow = () => {
    if (currentWindow) {
      setValue("startDate", currentWindow.startDate.split("T")[0])
      setValue("endDate", currentWindow.endDate.split("T")[0])
      setValue("isOpen", currentWindow.isOpen)
      setValue("description", currentWindow.description || "")
    }
    setShowWindowForm(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#424747]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#424747]">Registration Management</h2>

      {/* Registration Window Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#424747]">Registration Window Status</h3>
          <div className="flex gap-2">
            <button
              onClick={handleEditWindow}
              className="px-4 py-2 bg-[#424747] text-white rounded hover:bg-[#424747CC] transition-colors"
            >
              {currentWindow ? "Edit Window" : "Create Window"}
            </button>
          </div>
        </div> 
        {currentWindow ? (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendarAlt className="text-[#424747]" />
                  <h4 className="font-semibold text-[#424747]">Status: {currentWindow.isOpen ? "OPEN" : "CLOSED"}</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      currentWindow.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentWindow.isOpen ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Period: {new Date(currentWindow.startDate).toLocaleDateString()} -{" "}
                  {new Date(currentWindow.endDate).toLocaleDateString()}
                </p>
                {currentWindow.description && <p className="text-sm text-gray-600 mt-1">{currentWindow.description}</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">No registration window is currently configured.</p>
          </div>
        )}
      </div>

      {/* Real-time Enrollment Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="font-semibold text-[#424747] mb-3">📊 Real-time Enrollment Statistics</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <FaUsers className="text-blue-600 text-xl mr-2" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{dashboardStats.totalRegistrations}</p>
            <p className="text-sm text-blue-600">Total Registrations</p>
            <p className="text-xs text-blue-500 mt-1">All submissions</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <FaUserClock className="text-yellow-600 text-xl mr-2" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{dashboardStats.pendingRegistrations}</p>
            <p className="text-sm text-yellow-600">Pending Students</p>
            <p className="text-xs text-yellow-500 mt-1">Waiting for approval</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <FaUserCheck className="text-green-600 text-xl mr-2" />
            </div>
            <p className="text-2xl font-bold text-green-600">{dashboardStats.activeStudents}</p>
            <p className="text-sm text-green-600">Active Students</p>
            <p className="text-xs text-green-500 mt-1">Approved & enrolled</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <FaUserTimes className="text-red-600 text-xl mr-2" />
            </div>
            <p className="text-2xl font-bold text-red-600">{dashboardStats.inactiveRegistrations}</p>
            <p className="text-sm text-red-600">Inactive Students</p>
            <p className="text-xs text-red-500 mt-1">Rejected or withdrawn</p>
          </div>
        </div>
      </div>

      {/* Student Registrations Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-[#424747] mb-4">Student Registrations</h3> 
        {registrations.length > 0 ? (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {registrations.map((registration: any) => (
              <div
                key={registration._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="flex items-center flex-1">
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${
                      registration.status === "Active"
                        ? "bg-green-500"
                        : registration.status === "Pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="font-medium text-[#424747]">
                      {registration.student?.firstName || registration.student?.name}{" "}
                      {registration.student?.lastName || ""}
                    </p>
                    <p className="text-sm text-gray-600">{registration.student?.email}</p>
                    <p className="text-sm text-gray-600">{registration.course?.title || "N/A"}</p>
                    <p className="text-xs text-gray-500">PC/Desktop: {registration.hasPcDesktop || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={registration.status}
                    onChange={(e) => updateStatus(registration, e.target.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      registration.status === "Active"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : registration.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-red-100 text-red-800 border-red-200"
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(registration.createdAt || registration.registrationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewRegistration(registration)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View Details"
                    >
                      <FaEye size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteRegistration(registration)}
                      className={`p-1 rounded transition-colors ${
                        canDeleteRegistration(registration)
                          ? "text-red-600 hover:text-red-800 cursor-pointer"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                      title={
                        canDeleteRegistration(registration)
                          ? "Delete Registration"
                          : "Cannot delete active registration - student must drop course first"
                      }
                      disabled={!canDeleteRegistration(registration)}
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-[#F8F9FF] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FaUsers className="text-[#424747] text-2xl" />
            </div>
            <h3 className="text-xl font-medium text-[#424747] mb-2">No Registrations Yet</h3>
            <p className="text-[#424747CC]">Student registrations will appear here.</p>
          </div>
        )}
      </div>

      {/* Registration Window Form Modal */}
      {showWindowForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold text-[#424747] mb-4">
              {currentWindow ? "Edit Registration Window" : "Create Registration Window"}
            </h3> 
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#424747] mb-1">Start Date *</label>
                <input
                  type="date"
                  {...register("startDate")}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.startDate ? "border-red-500" : "border-[#424747]/20"
                  }`}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
              </div> 
              <div>
                <label className="block text-sm font-medium text-[#424747] mb-1">End Date *</label>
                <input
                  type="date"
                  {...register("endDate")}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.endDate ? "border-red-500" : "border-[#424747]/20"
                  }`}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
              </div> 
              <div>
                <label className="block text-sm font-medium text-[#424747] mb-1">Description</label>
                <textarea
                  {...register("description")}
                  className="w-full px-3 py-2 border border-[#424747]/20 rounded-md"
                  rows={3}
                  placeholder="Optional description for this registration window..."
                />
              </div> 
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register("isOpen")}
                  className="mr-2 h-4 w-4 text-[#424747] focus:ring-[#424747] border-gray-300 rounded"
                />
                <label className="text-sm text-[#424747]">Registration window is open</label>
              </div> 
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-[#424747] text-[#424747] rounded hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setShowWindowForm(false)
                    reset()
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#424747] text-white rounded hover:bg-[#424747CC] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : currentWindow ? "Update Window" : "Create Window"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Registration Modal */}
      {showViewModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#424747] mb-4">Registration Details</h3> 
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-[#424747]">First Name:</span>
                  <p className="text-[#424747CC]">
                    {selectedRegistration.student?.firstName || selectedRegistration.student?.name}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-[#424747]">Last Name:</span>
                  <p className="text-[#424747CC]">{selectedRegistration.student?.lastName || ""}</p>
                </div>
                <div>
                  <span className="font-medium text-[#424747]">Email:</span>
                  <p className="text-[#424747CC]">{selectedRegistration.student?.email}</p>
                </div>
                <div>
                  <span className="font-medium text-[#424747]">Phone:</span>
                  <p className="text-[#424747CC]">{selectedRegistration.phone}</p>
                </div>
                <div>
                  <span className="font-medium text-[#424747]">Gender:</span>
                  <p className="text-[#424747CC]">{selectedRegistration.gender}</p>
                </div>
                <div>
                  <span className="font-medium text-[#424747]">Have PC/Desktop:</span>
                  <p className="text-[#424747CC]">{selectedRegistration.hasPcDesktop || "Not specified"}</p>
                </div>
                <div>
                  <span className="font-medium text-[#424747]">Schedule:</span>
                  <p className="text-[#424747CC]">{selectedRegistration.schedule}</p>
                </div>
                <div>
                  <span className="font-medium text-[#424747]">Mode:</span>
                  <p className="text-[#424747CC]">{selectedRegistration.mode}</p>
                </div>
                <div>
                  <span className="font-medium text-[#424747]">Location:</span>
                  <p className="text-[#424747CC]">{selectedRegistration.location}</p>
                </div>
                <div>
                  <span className="font-medium text-[#424747]">Referral:</span>
                  <p className="text-[#424747CC]">{selectedRegistration.referral}</p>
                </div>
                <div>
                  <span className="font-medium text-[#424747]">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedRegistration.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : selectedRegistration.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedRegistration.status}
                  </span>
                </div>
              </div> 
              {selectedRegistration.course && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-[#424747]">Course Details:</span>
                  <p className="text-[#424747CC] mt-1">{selectedRegistration.course.title}</p>
                  <p className="text-sm text-[#424747CC]">CRN: {selectedRegistration.course.crn}</p>
                  <p className="text-sm text-[#424747CC]">Credits: {selectedRegistration.course.credits}</p>
                  <p className="text-sm text-[#424747CC]">Price: {selectedRegistration.course.price}</p>
                </div>
              )} 
              <div>
                <span className="font-medium text-[#424747]">Registration Date:</span>
                <p className="text-[#424747CC]">
                  {new Date(selectedRegistration.createdAt || selectedRegistration.registrationDate).toLocaleString()}
                </p>
              </div>
            </div> 
            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 bg-[#424747] text-white rounded hover:bg-[#424747CC] transition-colors"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="text-red-500 mr-3" size={24} />
              <h3 className="text-xl font-bold text-[#424747]">Action Not Allowed</h3>
            </div> 
            <p className="text-[#424747] mb-6">{validationMessage}</p> 
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-[#424747] text-white rounded hover:bg-[#424747CC] transition-colors"
                onClick={() => setShowValidationModal(false)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegistrationManagementTab
