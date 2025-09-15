"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FaUserPlus, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa"
import { register as registerUser } from "../../services/authService"

const adminCreationSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters" })
      .max(50, { message: "First name must not exceed 50 characters" })
      .regex(/^[a-zA-Z\s]+$/, { message: "First name can only contain letters and spaces" }),

    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters" })
      .max(50, { message: "Last name must not exceed 50 characters" })
      .regex(/^[a-zA-Z\s]+$/, { message: "Last name can only contain letters and spaces" }),

    email: z.string().min(1, { message: "Email is required" }).email({ message: "Please enter a valid email address" }),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      }),

    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type AdminCreationFormValues = z.infer<typeof adminCreationSchema>

const AdminCreationTab: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<AdminCreationFormValues>({
    resolver: zodResolver(adminCreationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  })

  const password = watch("password")

  const onSubmit = async (data: AdminCreationFormValues) => {
    try {
      // Create admin account using the auth service
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: "admin", // Explicitly set role as admin
      })

      setSuccessMessage(`Admin account created successfully for ${data.firstName} ${data.lastName}!`)
      reset() // Clear the form

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 5000)
    } catch (error) {
      console.error("Error creating admin account:", error)

      if (error instanceof Error) {
        if (error.message.includes("already exists") || error.message.includes("duplicate")) {
          alert("An account with this email already exists")
        } else {
          alert(`Error creating admin account: ${error.message}`)
        }
      } else {
        alert("Failed to create admin account. Please try again.")
      }
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" }

    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

    return {
      strength,
      label: labels[strength - 1] || "",
      color: colors[strength - 1] || "bg-gray-300",
    }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FaUserPlus className="text-[#424747]" size={24} />
        <h2 className="text-2xl font-bold text-[#424747]">Create Admin Account</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#424747] mb-2">Add New Administrator</h3>
          <p className="text-[#424747CC]">
            Create a new admin account to manage the training registration system. Admin accounts have full access to
            manage courses, registrations, and other administrators.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <FaCheckCircle className="text-green-600" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#424747] mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("firstName")}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#424747] focus:border-transparent transition-colors ${
                  errors.firstName ? "border-red-500" : "border-[#424747]/20"
                }`}
                placeholder="Enter first name"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#424747] mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("lastName")}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#424747] focus:border-transparent transition-colors ${
                  errors.lastName ? "border-red-500" : "border-[#424747]/20"
                }`}
                placeholder="Enter last name"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-[#424747] mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register("email")}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#424747] focus:border-transparent transition-colors ${
                errors.email ? "border-red-500" : "border-[#424747]/20"
              }`}
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-[#424747] mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#424747] focus:border-transparent transition-colors ${
                  errors.password ? "border-red-500" : "border-[#424747]/20"
                }`}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#424747]"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                </div>
                <p className="text-xs text-gray-600">
                  Password must contain at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>
            )}

            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-[#424747] mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#424747] focus:border-transparent transition-colors ${
                  errors.confirmPassword ? "border-red-500" : "border-[#424747]/20"
                }`}
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#424747]"
              >
                {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {/* Admin Role Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <FaUserPlus className="text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-blue-800">Administrator Privileges</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This account will have full administrative access including:
                </p>
                <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
                  <li>Manage all courses and registrations</li>
                  <li>Approve/reject student registrations</li>
                  <li>Generate reports and analytics</li>
                  <li>Create additional admin accounts</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#424747] text-white rounded-lg hover:bg-[#424747CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <FaUserPlus />
                  Create Admin Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminCreationTab
