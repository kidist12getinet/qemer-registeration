"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaUsers } from "react-icons/fa"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { getAllCourses, createCourse, updateCourse, deleteCourse } from "../../services/courseService"
import { getAllRegistrations } from "../../services/registrationService"
import type { Course } from "../../services/api"

const courseSchema = z.object({
  crn: z
    .string()
    .min(1, { message: "CRN is required" })
    .max(10, { message: "CRN must not exceed 10 characters" })
    .regex(/^[A-Z0-9]+$/, { message: "CRN must contain only uppercase letters and numbers" }),

  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must not exceed 100 characters" }),

  credits: z
    .number()
    .min(1, { message: "Credits must be at least 1" })
    .max(7, { message: "Credits must not exceed 7" }),

  instructor: z
    .string()
    .min(2, { message: "Instructor name must be at least 2 characters" })
    .max(50, { message: "Instructor name must not exceed 50 characters" }),

  maxEnrollment: z
    .number()
    .min(1, { message: "Max enrollment must be at least 1" })
    .max(100, { message: "Max enrollment must not exceed 100" }),

  price: z
    .string()
    .min(1, { message: "Price is required" })
    .regex(/^ETB\s\d{1,3}(,\d{3})*$/, { message: "Price must be in format 'ETB 1,000'" }),

  status: z.enum(["Active", "Inactive"], { message: "Status must be Active or Inactive" }),

  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(500, { message: "Description must not exceed 500 characters" }),
})

type CourseFormValues = z.infer<typeof courseSchema>

const CourseManagementTab: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationMessage, setValidationMessage] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      crn: "",
      title: "",
      credits: 3,
      instructor: "",
      maxEnrollment: 20,
      price: "ETB 3,000",
      status: "Active",
      description: "",
    },
  })

  // Fetch data on component mount
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
      alert("Error fetching data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Function to check if course has enrolled or registered students
  const getCourseEnrollmentStatus = (crn: string) => {
    const activeRegistrations = registrations.filter((reg: any) => reg.course?.crn === crn && reg.status === "Active")
    const pendingRegistrations = registrations.filter((reg: any) => reg.course?.crn === crn && reg.status === "Pending")

    return {
      hasActiveStudents: activeRegistrations.length > 0,
      hasPendingStudents: pendingRegistrations.length > 0,
      activeCount: activeRegistrations.length,
      pendingCount: pendingRegistrations.length,
      totalCount: activeRegistrations.length + pendingRegistrations.length,
    }
  }

  // Function to validate course operations
  const validateCourseOperation = (course: Course, operation: "edit" | "delete") => {
    const enrollmentStatus = getCourseEnrollmentStatus(course.crn)

    if (operation === "delete") {
      if (enrollmentStatus.hasActiveStudents || enrollmentStatus.hasPendingStudents) {
        return {
          allowed: false,
          message: `Cannot delete course "${course.title}" because it has ${enrollmentStatus.activeCount} active student(s) and ${enrollmentStatus.pendingCount} pending registration(s). Please ensure all students are withdrawn before deleting.`,
        }
      }
    } else if (operation === "edit") {
      if (enrollmentStatus.hasActiveStudents) {
        return {
          allowed: false,
          message: `Cannot edit course "${course.title}" because it has ${enrollmentStatus.activeCount} active student(s) enrolled. Critical course information cannot be modified while students are enrolled.`,
        }
      }
      // Allow editing if only pending registrations exist (with warning)
      if (enrollmentStatus.hasPendingStudents) {
        return {
          allowed: true,
          warning: `Warning: This course has ${enrollmentStatus.pendingCount} pending registration(s). Editing may affect these registrations.`,
        }
      }
    }

    return { allowed: true }
  }

  const handleAddCourse = () => {
    reset()
    setEditingCourse(null)
    setShowCourseModal(true)
  }

  const handleEditCourse = (course: Course) => {
    const validation = validateCourseOperation(course, "edit")

    if (!validation.allowed) {
      setValidationMessage(validation.message!)
      setShowValidationModal(true)
      return
    }

    // If there's a warning, show it but allow the operation
    if (validation.warning) {
      if (!window.confirm(validation.warning + "\n\nDo you want to continue?")) {
        return
      }
    }

    setEditingCourse(course)
    setValue("crn", course.crn)
    setValue("title", course.title)
    setValue("credits", course.credits)
    setValue("instructor", course.instructor)
    setValue("maxEnrollment", course.maxEnrollment)
    setValue("price", course.price)
    setValue("status", course.status)
    setValue("description", course.description)
    setShowCourseModal(true)
  }

  const handleDeleteCourse = async (course: Course) => {
    const validation = validateCourseOperation(course, "delete")

    if (!validation.allowed) {
      setValidationMessage(validation.message!)
      setShowValidationModal(true)
      return
    }

    if (window.confirm(`Are you sure you want to delete the course "${course.title}"? This action cannot be undone.`)) {
      try {
        await deleteCourse(course._id)
        await fetchData() // Refresh data
        alert("Course deleted successfully!")
      } catch (error) {
        console.error("Error deleting course:", error)
        alert("Error deleting course. Please try again.")
      }
    }
  }

  const onSubmit = async (data: CourseFormValues) => {
    try {
      if (editingCourse) {
        // Additional validation for editing with current enrollment
        if (data.maxEnrollment < editingCourse.currentEnrollment) {
          alert(`Cannot reduce max enrollment below current enrollment (${editingCourse.currentEnrollment})`)
          return
        }

        await updateCourse(editingCourse._id, data)
        alert("Course updated successfully!")
      } else {
        // Check if CRN already exists
        const existingCourse = courses.find((c) => c.crn === data.crn)
        if (existingCourse) {
          alert("A course with this CRN already exists!")
          return
        }
        await createCourse(data)
        alert("Course added successfully!")
      }

      setShowCourseModal(false)
      reset()
      setEditingCourse(null)
      await fetchData() // Refresh data
    } catch (error) {
      console.error("Error saving course:", error)
      alert("Error saving course. Please try again.")
    }
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#424747]">Course Management</h2>
        <button
          onClick={handleAddCourse}
          className="bg-[#424747] text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-[#424747CC] transition-colors"
        >
          <FaPlus size={16} />
          Add Course
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {courses.map((course) => {
            const enrollmentStatus = getCourseEnrollmentStatus(course.crn)
            const hasStudents = enrollmentStatus.hasActiveStudents || enrollmentStatus.hasPendingStudents

            return (
              <div
                key={course._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="flex items-center flex-1">
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${course.status === "Active" ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <div className="flex-1">
                    <p className="font-medium text-[#424747]">{course.title}</p>
                    <p className="text-sm text-gray-600">
                      CRN: {course.crn} | Instructor: {course.instructor}
                    </p>
                    <p className="text-sm text-gray-600">
                      Enrollment: {course.currentEnrollment}/{course.maxEnrollment} | Credits: {course.credits}
                    </p>
                    {hasStudents && (
                      <div className="flex items-center mt-1">
                        <FaUsers className="text-blue-500 mr-1" size={12} />
                        <span className="text-xs text-blue-600">
                          {enrollmentStatus.activeCount} active, {enrollmentStatus.pendingCount} pending
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      course.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {course.status}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className={`p-1 rounded transition-colors ${
                        enrollmentStatus.hasActiveStudents
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-600 hover:text-blue-800"
                      }`}
                      title={
                        enrollmentStatus.hasActiveStudents ? "Cannot edit - course has active students" : "Edit Course"
                      }
                      disabled={enrollmentStatus.hasActiveStudents}
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course)}
                      className={`p-1 rounded transition-colors ${
                        hasStudents ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:text-red-800"
                      }`}
                      title={hasStudents ? "Cannot delete - course has students" : "Delete Course"}
                      disabled={hasStudents}
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#424747] mb-4">
              {editingCourse ? "Edit Course" : "Add New Course"}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#424747] mb-1">CRN *</label>
                  <input
                    type="text"
                    {...register("crn")}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.crn ? "border-red-500" : "border-[#424747]/20"
                    }`}
                    placeholder="e.g., WEBI01"
                    disabled={!!editingCourse}
                  />
                  {errors.crn && <p className="text-red-500 text-sm mt-1">{errors.crn.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#424747] mb-1">Credits *</label>
                  <input
                    type="number"
                    {...register("credits", { valueAsNumber: true })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.credits ? "border-red-500" : "border-[#424747]/20"
                    }`}
                    min="1"
                    max="6"
                  />
                  {errors.credits && <p className="text-red-500 text-sm mt-1">{errors.credits.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#424747] mb-1">Course Title *</label>
                  <input
                    type="text"
                    {...register("title")}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.title ? "border-red-500" : "border-[#424747]/20"
                    }`}
                    placeholder="e.g., Full Stack Web Development"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#424747] mb-1">Instructor *</label>
                  <input
                    type="text"
                    {...register("instructor")}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.instructor ? "border-red-500" : "border-[#424747]/20"
                    }`}
                    placeholder="e.g., Dr. React"
                  />
                  {errors.instructor && <p className="text-red-500 text-sm mt-1">{errors.instructor.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#424747] mb-1">Max Enrollment *</label>
                  <input
                    type="number"
                    {...register("maxEnrollment", { valueAsNumber: true })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.maxEnrollment ? "border-red-500" : "border-[#424747]/20"
                    }`}
                    min="1"
                    max="100"
                  />
                  {errors.maxEnrollment && <p className="text-red-500 text-sm mt-1">{errors.maxEnrollment.message}</p>}
                  {editingCourse && (
                    <p className="text-xs text-gray-500 mt-1">Current enrollment: {editingCourse.currentEnrollment}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#424747] mb-1">Price *</label>
                  <input
                    type="text"
                    {...register("price")}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.price ? "border-red-500" : "border-[#424747]/20"
                    }`}
                    placeholder="e.g., ETB 3,000"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#424747] mb-1">Status *</label>
                  <select
                    {...register("status")}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.status ? "border-red-500" : "border-[#424747]/20"
                    }`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#424747] mb-1">Description *</label>
                  <textarea
                    {...register("description")}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.description ? "border-red-500" : "border-[#424747]/20"
                    }`}
                    rows={3}
                    placeholder="Course description..."
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-[#424747] text-[#424747] rounded hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setShowCourseModal(false)
                    reset()
                    setEditingCourse(null)
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#424747] text-white rounded hover:bg-[#424747CC] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingCourse ? "Update Course" : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Validation Error Modal */}
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

export default CourseManagementTab
