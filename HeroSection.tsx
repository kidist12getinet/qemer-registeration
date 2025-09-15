"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "../App"
import heroImage from "../assets/hero-image.png"

const HeroSection: React.FC = () => {
  const { user } = useContext(UserContext)
  const [isVisible, setIsVisible] = useState(false)

  // Animation effect on component mount
  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="bg-white py-16 px-6 mt-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
        {/* Text section - now with animations, full width, and larger text */}
        <div
          className="md:w-1/2 space-y-8 transition-all duration-1000 ease-out transform"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <h1
            className="text-6xl md:text-7xl font-bold text-[#424747] leading-tight transition-all duration-700 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateX(0)" : "translateX(-30px)",
            }}
          >
            Qemer Training Hub
          </h1>

          <p
            className="text-xl md:text-xl text-[#424747CC] max-w-xl transition-all duration-700 delay-300 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateX(0)" : "translateX(-30px)",
            }}
          >
            Streamlined training registration for students. Find, register, and manage all your courses in one place.
          </p>

          <div
            className="flex flex-wrap gap-6 pt-4 transition-all duration-700 delay-500 ease-out"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            {/* Only show Browse Courses button for non-admin users (students and guests) */}
            {(!user || !user.isAdmin) && (
              <Link
                to="/courses"
                state={{ user }}
                className="bg-[#424747] text-white px-8 py-4 rounded-lg hover:bg-[#424747CC] transition-colors text-lg hover:scale-105 transform duration-300"
              >
                Browse Courses
              </Link>
            )}

            {!user ? (
              <Link
                to="/signup"
                className="border-2 border-[#424747] text-[#424747] px-8 py-4 rounded-lg hover:bg-[#424747] hover:text-white transition-colors text-lg hover:scale-105 transform duration-300"
              >
                Create Account
              </Link>
            ) : (
              <Link
                to={user.isAdmin ? "/admin-dashboard" : "/student-dashboard"}
                className="border-2 border-[#424747] text-[#424747] px-8 py-4 rounded-lg hover:bg-[#424747] hover:text-white transition-colors text-lg hover:scale-105 transform duration-300"
              >
                {user.isAdmin ? "Admin Dashboard" : "My Dashboard"}
              </Link>
            )}
          </div>
        </div>

        {/* Image section with animation */}
        <div
          className="md:w-1/2 mt-16 md:mt-0 transition-all duration-1000 delay-300 ease-out"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <img
            src={heroImage || "/placeholder.svg"}
            alt="hero image"
            className="rounded-lg shadow-xl w-full h-auto max-h-[500px] object-cover hover:shadow-2xl transition-shadow duration-300"
          />
        </div>
      </div>
    </div>
  )
}

export default HeroSection
