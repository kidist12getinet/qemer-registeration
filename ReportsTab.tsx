"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { FaFileExcel, FaFilePdf, FaFilter, FaDownload } from "react-icons/fa"
import { getAllRegistrations } from "../../services/registrationService"
import { getAllCourses } from "../../services/courseService"

const ReportsTab: React.FC = () => {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all")
  const [courseFilter, setCourseFilter] = useState("all")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [registrations, statusFilter, courseFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [registrationsResponse, coursesData] = await Promise.all([getAllRegistrations(), getAllCourses()])
      setRegistrations(registrationsResponse.data || [])
      setCourses(coursesData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...registrations]

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((reg) => reg.status === statusFilter)
    }

    // Filter by course
    if (courseFilter !== "all") {
      filtered = filtered.filter((reg) => reg.course?._id === courseFilter)
    }

    setFilteredRegistrations(filtered)
  }

  const generateExcelReport = async () => {
    try {
      const XLSX = await import("xlsx")

      // Prepare data for Excel
      const excelData = filteredRegistrations.map((reg, index) => ({
        "No.": index + 1,
        "Student Name": `${reg.student?.firstName || reg.student?.name || ""} ${reg.student?.lastName || ""}`.trim(),
        Email: reg.student?.email || "",
        Phone: reg.phone || "",
        Course: reg.course?.title || "",
        CRN: reg.course?.crn || "",
        Status: reg.status || "",
        Gender: reg.gender || "",
        Schedule: reg.schedule || "",
        Mode: reg.mode || "",
        Location: reg.location || "",
        "PC/Desktop": reg.hasPcDesktop || "",
        Referral: reg.referral || "",
        "Registration Date": reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : "",
      }))

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)

      // Set column widths
      const colWidths = [
        { wch: 5 }, // No.
        { wch: 20 }, // Student Name
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 20 }, // Course
        { wch: 10 }, // CRN
        { wch: 10 }, // Status
        { wch: 10 }, // Gender
        { wch: 15 }, // Schedule
        { wch: 10 }, // Mode
        { wch: 15 }, // Location
        { wch: 12 }, // PC/Desktop
        { wch: 15 }, // Referral
        { wch: 15 }, // Registration Date
      ]
      ws["!cols"] = colWidths

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Registrations")

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0]
      const filename = `Qemer_Registration_Report_${currentDate}.xlsx`

      // Save file
      XLSX.writeFile(wb, filename)

      alert(`Excel report generated successfully! File saved as: ${filename}`)
    } catch (error) {
      console.error("Error generating Excel report:", error)
      alert("Error generating Excel report. Please make sure the xlsx library is installed.")
    }
  }

  const generatePdfReport = async () => {
    try {
      const jsPDF = (await import("jspdf")).default
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Qemer Training Center", 20, 20)
      doc.setFontSize(16)
      doc.text("Registration Report", 20, 30)

      // Add generation info
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40)
      doc.text(`Total Records: ${filteredRegistrations.length}`, 20, 45)

      // Add filter info
      let filterText = "Filters Applied: "
      if (statusFilter !== "all") {
        filterText += `Status: ${statusFilter} `
      }
      if (courseFilter !== "all") {
        const courseName = courses.find((c) => c._id === courseFilter)?.title || "Unknown"
        filterText += `Course: ${courseName}`
      }
      if (statusFilter === "all" && courseFilter === "all") {
        filterText += "None"
      }
      doc.text(filterText, 20, 50)

      // Prepare table data
      const tableData = filteredRegistrations.map((reg, index) => [
        index + 1,
        `${reg.student?.firstName || reg.student?.name || ""} ${reg.student?.lastName || ""}`.trim(),
        reg.student?.email || "",
        reg.course?.title || "",
        reg.course?.crn || "",
        reg.status || "",
        reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : "",
      ])

      // Add table using autoTable
      autoTable(doc, {
        head: [["No.", "Student Name", "Email", "Course", "CRN", "Status", "Date"]],
        body: tableData,
        startY: 60,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 71, 71],
          textColor: 255,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      })

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0]
      const filename = `Qemer_Registration_Report_${currentDate}.pdf`

      // Save file
      doc.save(filename)

      alert(`PDF report generated successfully! File saved as: ${filename}`)
    } catch (error) {
      console.error("Error generating PDF report:", error)
      alert("Error generating PDF report. Please make sure jspdf and jspdf-autotable libraries are installed.")
    }
  }

  const generateReport = (format: "excel" | "pdf") => {
    if (format === "excel") {
      generateExcelReport()
    } else if (format === "pdf") {
      generatePdfReport()
    }
  }

  const getStatusStats = () => {
    return {
      total: filteredRegistrations.length,
      active: filteredRegistrations.filter((r) => r.status === "Active").length,
      pending: filteredRegistrations.filter((r) => r.status === "Pending").length,
      inactive: filteredRegistrations.filter((r) => r.status === "Inactive").length,
    }
  }

  const getCourseStats = () => {
    const courseStats = courses
      .map((course) => {
        const courseRegistrations = filteredRegistrations.filter((r) => r.course?._id === course._id)
        return {
          courseName: course.title,
          crn: course.crn,
          total: courseRegistrations.length,
          active: courseRegistrations.filter((r) => r.status === "Active").length,
          pending: courseRegistrations.filter((r) => r.status === "Pending").length,
          inactive: courseRegistrations.filter((r) => r.status === "Inactive").length,
        }
      })
      .filter((stat) => stat.total > 0)

    return courseStats
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#424747]"></div>
      </div>
    )
  }

  const statusStats = getStatusStats()
  const courseStats = getCourseStats()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#424747]">Reports & Analytics</h2>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-[#424747]" />
          <h3 className="text-lg font-semibold text-[#424747]">Filter Reports</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-[#424747] mb-2">Filter by Registration Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#424747]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#424747] focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <label className="block text-sm font-medium text-[#424747] mb-2">Filter by Course</label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#424747]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#424747] focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title} ({course.crn})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Applied Filters Display */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-[#424747]">
            <span className="font-medium">Current Filters:</span>
            {statusFilter !== "all" && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Status: {statusFilter}</span>
            )}
            {courseFilter !== "all" && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                Course: {courses.find((c) => c._id === courseFilter)?.title}
              </span>
            )}
            {statusFilter === "all" && courseFilter === "all" && (
              <span className="text-gray-600">No filters applied</span>
            )}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredRegistrations.length} of {registrations.length} total registrations
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h4 className="text-sm font-medium text-gray-600">Total Filtered</h4>
          <p className="text-2xl font-bold text-blue-600">{statusStats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h4 className="text-sm font-medium text-gray-600">Active</h4>
          <p className="text-2xl font-bold text-green-600">{statusStats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <h4 className="text-sm font-medium text-gray-600">Pending</h4>
          <p className="text-2xl font-bold text-yellow-600">{statusStats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <h4 className="text-sm font-medium text-gray-600">Inactive</h4>
          <p className="text-2xl font-bold text-red-600">{statusStats.inactive}</p>
        </div>
      </div>

      {/* Course-wise Statistics */}
      {courseStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-[#424747] mb-4">Course-wise Registration Statistics</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-[#424747]">Course</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#424747]">CRN</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#424747]">Total</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#424747]">Active</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#424747]">Pending</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#424747]">Inactive</th>
                </tr>
              </thead>
              <tbody>
                {courseStats.map((stat, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-[#424747]">{stat.courseName}</td>
                    <td className="py-3 px-4 text-[#424747]">{stat.crn}</td>
                    <td className="py-3 px-4 text-center font-medium">{stat.total}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">{stat.active}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">{stat.pending}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">{stat.inactive}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaDownload className="text-[#424747]" />
          <h3 className="text-lg font-semibold text-[#424747]">Export Reports</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => generateReport("excel")}
            className="flex items-center justify-center gap-3 p-6 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors group"
          >
            <FaFileExcel className="text-green-600 group-hover:text-green-700" size={32} />
            <div className="text-left">
              <h4 className="font-medium text-[#424747] group-hover:text-green-700">Excel Report</h4>
              <p className="text-sm text-gray-600">
                Download detailed spreadsheet with {filteredRegistrations.length} records
              </p>
            </div>
          </button>

          <button
            onClick={() => generateReport("pdf")}
            className="flex items-center justify-center gap-3 p-6 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors group"
          >
            <FaFilePdf className="text-red-600 group-hover:text-red-700" size={32} />
            <div className="text-left">
              <h4 className="font-medium text-[#424747] group-hover:text-red-700">PDF Report</h4>
              <p className="text-sm text-gray-600">
                Download formatted document with {filteredRegistrations.length} records
              </p>
            </div>
          </button>
        </div>

        {filteredRegistrations.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-center">
              No data available for export with current filters. Please adjust your filters to include more data.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportsTab
