"use client"

import { useNavigate, useLocation, useParams } from "react-router-dom"
import qemerLogo from "../assets/qemer.webp"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type React from "react"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../App"
import { createRegistration } from "../services/registrationService"
import { getAllCourses } from "../services/courseService"
import type { Course } from "../services/api"

const registrationSchema = z.object({
  phone: z.string().regex(/^9[0-9]{8}$/, { message: "Phone number must be 9 digits starting with 9" }),

  gender: z
    .string()
    .min(1, { message: "Please select your gender" })
    .refine((gender) => ["Male", "Female"].includes(gender), {
      message: "Please select a valid gender option",
    }),

  hasPcDesktop: z
    .string()
    .min(1, { message: "Please select if you have a PC or Desktop" })
    .refine((value) => ["Yes", "No"].includes(value), {
      message: "Please select a valid option",
    }),

  schedule: z
    .string()
    .min(1, { message: "Please select a schedule" })
    .refine((schedule) => ["Weekdays", "Evenings", "Weekends"].includes(schedule), {
      message: "Please select a valid schedule option",
    }),

  mode: z
    .string()
    .min(1, { message: "Please select a learning mode" })
    .refine((mode) => ["Online", "In-Person"].includes(mode), {
      message: "Please select a valid learning mode",
    }),

  referral: z.string().min(1, { message: "Please select how you heard about us" }),

  location: z.string().min(1, { message: "Please select a location" }),
})

type RegistrationFormValues = z.infer<typeof registrationSchema>

const CourseRegistrationForm: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const { user } = useContext(UserContext)

  const [course, setCourse] = useState<Course | null>(location.state?.course || null)
  const [loading, setLoading] = useState(!course)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [successMessage, setSuccessMessage] = useState("")

  // Fetch course data if not provided in state
  useEffect(() => {
    const fetchCourse = async () => {
      if (course || !params.crn) return

      try {
        setLoading(true)
        const courses = await getAllCourses()
        const foundCourse = courses.find((c: Course) => c.crn === params.crn)

        if (foundCourse) {
          // Ensure the course has all required properties
          const completeCourse: Course = {
            ...foundCourse,
            prerequisites: foundCourse.prerequisites || [],
            corequisites: foundCourse.corequisites || [],
          }
          setCourse(completeCourse)
        } else {
          setError("Course not found")
        }
      } catch (error) {
        setError("Failed to fetch course details")
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [params.crn, course])

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { course } })
      return
    }

    if (user.isAdmin) {
      navigate("/admin-dashboard")
      return
    }
  }, [user, navigate, course])

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    watch,
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      phone: "",
      gender: "",
      hasPcDesktop: "",
      schedule: "",
      mode: "",
      referral: "",
      location: "",
    },
    mode: "onChange",
  })

  // Watch form values to check validation status
  const watchedValues = watch()

  // Handle next step
  const handleNext = async () => {
    const isValid = await trigger(["phone", "gender", "hasPcDesktop"])
    if (isValid) {
      setStep(2)
    }
  }

  // Handle back
  const handleBack = () => setStep(1)

  // Form submission handler
  const onSubmit = async (data: RegistrationFormValues) => {
    if (!user || !course) {
      setError("Missing user or course information")
      return
    }

    try {
      const registrationData = {
        courseCrn: course.crn,
        phone: `+251${data.phone}`,
        gender: data.gender as "Male" | "Female",
        schedule: data.schedule as "Weekdays" | "Evenings" | "Weekends",
        mode: data.mode as "Online" | "In-Person",
        location: data.location,
        referral: data.referral,
        hasPcDesktop: data.hasPcDesktop as "Yes" | "No",
      }

      await createRegistration(registrationData)

      setSuccessMessage("Registration submitted successfully! Your registration is pending admin approval.")

      // Navigate to dashboard after a delay
      setTimeout(() => {
        navigate("/student-dashboard")
      }, 2000)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("already registered")) {
          setError("You are already registered for this course")
        } else if (error.message.includes("full")) {
          setError("This course is full")
        } else {
          setError(error.message)
        }
      } else {
        setError("Registration failed. Please try again.")
      }
    }
  }

  const referralOptions = ["Facebook", "Instagram", "Friend Referral", "Flyer or Poster", "Qemer Website"]
  const locationOptions = ["Bole", "Mexico"]

  // Check if all fields in current step are valid and filled
  const isStep1Valid = () => {
    const { phone, gender, hasPcDesktop } = watchedValues
    return (
      phone &&
      gender &&
      hasPcDesktop &&
      !errors.phone &&
      !errors.gender &&
      !errors.hasPcDesktop &&
      phone.length > 0 &&
      gender.length > 0 &&
      hasPcDesktop.length > 0
    )
  }

  const isStep2Valid = () => {
    const { schedule, mode, referral, location } = watchedValues
    return (
      schedule &&
      mode &&
      referral &&
      location &&
      !errors.schedule &&
      !errors.mode &&
      !errors.referral &&
      !errors.location &&
      schedule.length > 0 &&
      mode.length > 0 &&
      referral.length > 0 &&
      location.length > 0
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] py-12 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#424747]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/courses")}
            className="bg-[#424747] text-white px-6 py-2 rounded hover:bg-[#424747CC] transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    )
  }

  if (!user || !course) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Account Required</h1>
          <p className="text-gray-600 mb-6">Please create an account first to register for courses.</p>
          <button
            onClick={() => navigate("/signup", { state: { course } })}
            className="bg-[#424747] text-white px-6 py-2 rounded hover:bg-[#424747CC] transition-colors"
          >
            Create Account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <img src={qemerLogo || "/placeholder.svg"} alt="Logo" className="h-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Course Registration</h1>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 1 ? "bg-[#424747] text-white" : "bg-green-500 text-white"
                }`}
              >
                {step > 1 ? "✓" : "1"}
              </div>
              <span className="text-xs mt-1">Personal Info</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step > 1 ? "bg-green-500" : "bg-gray-200"}`}></div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 2 ? "bg-[#424747] text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="text-xs mt-1">Course Details</span>
            </div>
          </div>
        </div>

        {/* User Information Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Welcome, {user.firstName} {user.lastName}!
          </h2>
          <div>
            <h3 className="font-semibold text-gray-700">Registering for: {course.title}</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>CRN: {course.crn}</span>
              <span>Price: {course.price}</span>
              <span>
                Capacity: {course.currentEnrollment}/{course.maxEnrollment}
              </span>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-center">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#424747] mb-1">
                    Phone Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 rounded-l bg-gray-50 text-gray-500 text-sm">
                      +251
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      {...register("phone")}
                      placeholder="912345678"
                      className={`border p-2 rounded-r w-full ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                      aria-invalid={errors.phone ? "true" : "false"}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-[#424747] mb-1">
                    Select Gender
                  </label>
                  <select
                    id="gender"
                    {...register("gender")}
                    className={`border p-2 rounded w-full ${errors.gender ? "border-red-500" : "border-gray-300"}`}
                    aria-invalid={errors.gender ? "true" : "false"}
                  >
                    <option value="">Select your gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="hasPcDesktop" className="block text-sm font-medium text-[#424747] mb-1">
                    Have PC or Desktop
                  </label>
                  <select
                    id="hasPcDesktop"
                    {...register("hasPcDesktop")}
                    className={`border p-2 rounded w-full ${errors.hasPcDesktop ? "border-red-500" : "border-gray-300"}`}
                    aria-invalid={errors.hasPcDesktop ? "true" : "false"}
                  >
                    <option value="">Select option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  {errors.hasPcDesktop && <p className="text-red-500 text-sm">{errors.hasPcDesktop.message}</p>}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep1Valid()}
                  className={`px-6 py-2 rounded transition-colors ${
                    isStep1Valid()
                      ? "bg-[#424747] text-white hover:bg-[#333] cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Additional Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="schedule" className="block text-sm font-medium text-[#424747] mb-1">
                    Preferred Learning Schedule
                  </label>
                  <select
                    id="schedule"
                    {...register("schedule")}
                    className={`border p-2 rounded w-full ${errors.schedule ? "border-red-500" : "border-gray-300"}`}
                    aria-invalid={errors.schedule ? "true" : "false"}
                  >
                    <option value="">Select schedule</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Evenings">Evenings</option>
                    <option value="Weekends">Weekends</option>
                  </select>
                  {errors.schedule && <p className="text-red-500 text-sm">{errors.schedule.message}</p>}
                </div>

                <div>
                  <label htmlFor="mode" className="block text-sm font-medium text-[#424747] mb-1">
                    Learning Mode
                  </label>
                  <select
                    id="mode"
                    {...register("mode")}
                    className={`border p-2 rounded w-full ${errors.mode ? "border-red-500" : "border-gray-300"}`}
                    aria-invalid={errors.mode ? "true" : "false"}
                  >
                    <option value="">Select mode</option>
                    <option value="Online">Online</option>
                    <option value="In-Person">In-Person</option>
                  </select>
                  {errors.mode && <p className="text-red-500 text-sm">{errors.mode.message}</p>}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-[#424747] mb-1">
                    Training Center Location
                  </label>
                  <select
                    id="location"
                    {...register("location")}
                    className={`border p-2 rounded w-full ${errors.location ? "border-red-500" : "border-gray-300"}`}
                    aria-invalid={errors.location ? "true" : "false"}
                  >
                    <option value="">Select location</option>
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
                </div>

                <div>
                  <label htmlFor="referral" className="block text-sm font-medium text-[#424747] mb-1">
                    How did you hear about us?
                  </label>
                  <select
                    id="referral"
                    {...register("referral")}
                    className={`border p-2 rounded w-full ${errors.referral ? "border-red-500" : "border-gray-300"}`}
                    aria-invalid={errors.referral ? "true" : "false"}
                  >
                    <option value="">Select option</option>
                    {referralOptions.map((ref) => (
                      <option key={ref} value={ref}>
                        {ref}
                      </option>
                    ))}
                  </select>
                  {errors.referral && <p className="text-red-500 text-sm">{errors.referral.message}</p>}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button type="button" onClick={handleBack} className="border px-6 py-2 rounded hover:bg-gray-50">
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isStep2Valid()}
                  className={`px-6 py-2 rounded transition-colors ${
                    isStep2Valid()
                      ? "bg-[#424747] text-white hover:bg-[#333] cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default CourseRegistrationForm
