"use client"

import type React from "react"
import { useContext, useEffect } from "react"
import { UserContext } from "../../App"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { updateProfile } from "../../services/userService"

const adminProfileSchema = z.object({
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
})

type AdminProfileFormValues = z.infer<typeof adminProfileSchema>

interface AdminProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
}

const AdminProfileEditModal: React.FC<AdminProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { user, setUser } = useContext(UserContext)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<AdminProfileFormValues>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  })

  // Update form values when user changes or modal opens
  useEffect(() => {
    if (isOpen && user) {
      setValue("firstName", user.firstName || "")
      setValue("lastName", user.lastName || "")
    }
  }, [isOpen, user, setValue])

  const onSubmit = async (data: AdminProfileFormValues) => {
    try {
      if (!user) return

      // Update user profile via API
      await updateProfile(data)

      // Update user context with new data
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)

      alert("Profile updated successfully!")
      onClose()
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile. Please try again.")
    }
  }

  const handleClose = () => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      })
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-[#424747] mb-4">Edit Admin Profile</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#424747] mb-1">First Name *</label>
            <input
              type="text"
              {...register("firstName")}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.firstName ? "border-red-500" : "border-[#424747]/20"
              }`}
              placeholder="Enter your first name"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#424747] mb-1">Last Name *</label>
            <input
              type="text"
              {...register("lastName")}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.lastName ? "border-red-500" : "border-[#424747]/20"
              }`}
              placeholder="Enter your last name"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              className="px-4 py-2 border border-[#424747] text-[#424747] rounded hover:bg-gray-100 transition-colors"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#424747] text-white rounded hover:bg-[#424747CC] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminProfileEditModal
