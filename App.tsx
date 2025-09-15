"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom"
import Header from "./components/Header"
import Footer from "./components/Footer"
import HeroSection from "./components/HeroSection"
import FeaturesSection from "./components/FeaturesSection.tsx"
import TestimonialsSection from "./components/TestimonialsSection.tsx"
import CourseDetail from "./components/CourseDetail.tsx"
import Login from "./components/Login"
import SignUp from "./components/Signup"
import Courses from "./components/Courses"
import CourseRegistrationForm from "./components/CourseRegistrationForm"
import StudentDashboard from "./components/StudentDashboard"
import AdminDashboard from "./components/AdminDashboard"
import { setAuthToken } from "./services/api"

// Create a context to share user data across components
import { createContext } from "react"

// Define the type for our user context
interface UserContextType {
  user: {
    _id: string
    firstName: string
    lastName: string
    email: string
    role: "student" | "admin"
    isAdmin: boolean
    token?: string
  } | null
  setUser: (user: any | null) => void
  logout: () => void
  loading: boolean
}

// Create the context with a default value
export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
  loading: true,
})

// Main App component
const App: React.FC = () => {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize app
  useEffect(() => {
    // App is ready
    setLoading(false)
  }, [])

  // Update the setUser function to also set auth token
  const setUserWithToken = (userData: any | null) => {
    setUser(userData)
    if (userData?.token) {
      setAuthToken(userData.token)
    } else {
      setAuthToken(null)
    }
  }

  // Function to handle logout
  const logout = () => {
    setAuthToken(null)
    setUser(null)
  }

  // Show loading spinner while initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FF]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#424747]"></div>
      </div>
    )
  }

  return (
    <Router>
      <UserContext.Provider
        value={{
          user,
          setUser: setUserWithToken,
          logout,
          loading,
        }}
      >
        <AppRoutes />
      </UserContext.Provider>
    </Router>
  )
}

// Component to handle routes and access location
const AppRoutes: React.FC = () => {
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/register/:crn" element={<CourseRegistrationForm />} />
      <Route path="/courses/:crn" element={<CourseDetail />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route
        path="/"
        element={
          <div className="min-h-screen flex flex-col bg-[#F8F9FF]">
            <Header />
            <div className="flex-grow">
              <HeroSection />
              <FeaturesSection />
              <TestimonialsSection />
            </div>
            <Footer />
          </div>
        }
      />
    </Routes>
  )
}

export default App
