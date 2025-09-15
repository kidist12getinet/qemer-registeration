"use client"

import React from "react"
import { useEffect, useContext } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { UserContext } from "../App"
import qemerLogo from "../assets/qemer.webp"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { login } from "../services/authService"

const loginSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useContext(UserContext)

  const selectedCourse = location.state?.course
  const newAccount = location.state?.newAccount

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  })

  const [message, setMessage] = React.useState("")

  useEffect(() => {
    if (newAccount) setMessage("Account created successfully! Please log in.")
  }, [newAccount])

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Use the function-based authentication service
      const response = await login(data)

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

      // Navigate based on role and selected course
      if (selectedCourse && !response.isAdmin) {
        navigate(`/register/${selectedCourse.crn}`, { state: { course: selectedCourse } })
      } else {
        navigate(response.isAdmin ? "/admin-dashboard" : "/student-dashboard")
      }
    } catch (error) {
      // Handle specific API errors
      if (error instanceof Error) {
        if (error.message.includes("Invalid credentials")) {
          setError("email", { message: "Invalid email or password" })
          setError("password", { message: "Invalid email or password" })
        } else {
          setError("email", { message: error.message })
        }
      } else {
        setError("email", { message: "Login failed. Please try again." })
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF] p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <img src={qemerLogo || "/placeholder.svg"} alt="Qemer Logo" className="h-14 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-[#424747]">Welcome Back</h1>
          <p className="text-[#424747CC]">Enter your email and password to access your account</p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">{message}</div>
        )}

        {selectedCourse && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-[#424747CC]">Registering for:</p>
            <h2 className="font-semibold text-[#424747]">{selectedCourse.title}</h2>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="Enter your password"
              {...register("password")}
              className={`w-full px-3 py-2 border ${
                errors.password ? "border-red-500" : "border-[#424747]/20"
              } rounded-md focus:outline-none focus:ring-[#424747] focus:border-[#424747]`}
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex justify-between items-right">
            <Link to="/forgot-password" className="text-sm text-[#424747] hover:text-[#424747CC]">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 rounded-md text-white bg-[#424747] hover:bg-[#424747CC] disabled:opacity-70"
          >
            {isSubmitting ? "Logging in..." : "LOG IN"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#424747]">
          Don't have an account?{" "}
          <Link to="/signup" state={{ course: selectedCourse }} className="font-medium hover:text-[#424747CC]">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
