"use client"
import { Link, useNavigate, useLocation } from "react-router-dom"
import qemerLogo from "../assets/qemer.webp"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { register as registerUser } from "../services/authService"
import { useContext } from "react"
import { UserContext } from "../App"

const signupSchema = z
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

    password: z.string().min(8, { message: "Password must be at least 8 characters" }),

    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

// Infer the type from the schema
type SignupFormValues = z.infer<typeof signupSchema>

const Signup = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useContext(UserContext)
  const selectedCourse = location.state?.course

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  })

  // Form submission handler
  const onSubmit = async (data: SignupFormValues) => {
    try {
      // Use the function-based authentication service
      const response = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: "student", // Default role for signup
      })

      // Update user context with real user data
      const userData = {
        _id: response._id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        role: response.role,
        isAdmin: response.isAdmin,
        token: response.token,
      }

      setUser(userData)

      // Navigate based on selected course
      if (selectedCourse) {
        navigate(`/register/${selectedCourse.crn}`, { state: { course: selectedCourse } })
      } else {
        navigate("/student-dashboard")
      }
    } catch (error) {
      // Handle specific API errors
      if (error instanceof Error) {
        if (error.message.includes("already exists") || error.message.includes("duplicate")) {
          setError("email", { message: "An account with this email already exists" })
        } else if (error.message.includes("validation") || error.message.includes("invalid")) {
          setError("email", { message: error.message })
        } else {
          setError("email", { message: "Registration failed. Please try again." })
        }
      } else {
        setError("email", { message: "Registration failed. Please try again." })
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF] p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <img src={qemerLogo || "/placeholder.svg"} alt="Qemer Logo" className="h-14 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-[#424747]">Create Your Account</h1>
        </div>

        {selectedCourse && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-[#424747CC]">Registering for:</p>
            <h2 className="font-semibold text-[#424747]">{selectedCourse.title}</h2>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#424747] mb-1">First Name</label>
            <input
              type="text"
              placeholder="Enter your first name"
              {...register("firstName")}
              className={`w-full px-3 py-2 border ${
                errors.firstName ? "border-red-500" : "border-[#424747]/20"
              } rounded-md focus:outline-none focus:ring-[#424747] focus:border-[#424747]`}
              aria-invalid={errors.firstName ? "true" : "false"}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#424747] mb-1">Last Name</label>
            <input
              type="text"
              placeholder="Enter your last name"
              {...register("lastName")}
              className={`w-full px-3 py-2 border ${
                errors.lastName ? "border-red-500" : "border-[#424747]/20"
              } rounded-md focus:outline-none focus:ring-[#424747] focus:border-[#424747]`}
              aria-invalid={errors.lastName ? "true" : "false"}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#424747] mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              className={`w-full px-3 py-2 border ${
                errors.email ? "border-red-500" : "border-[#424747]/20"
              } rounded-md focus:outline-none focus:ring-[#424747] focus:border-[#424747]`}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#424747] mb-1">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              {...register("password")}
              className={`w-full px-3 py-2 border ${
                errors.password ? "border-red-500" : "border-[#424747]/20"
              } rounded-md focus:outline-none focus:ring-[#424747] focus:border-[#424747]`}
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#424747] mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              className={`w-full px-3 py-2 border ${
                errors.confirmPassword ? "border-red-500" : "border-[#424747]/20"
              } rounded-md focus:outline-none focus:ring-[#424747] focus:border-[#424747]`}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 rounded-md text-white bg-[#424747] hover:bg-[#424747CC] disabled:opacity-70"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#424747]">
          Already have an account?{" "}
          <Link to="/login" state={{ course: selectedCourse }} className="font-medium hover:text-[#424747CC]">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
