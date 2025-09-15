"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { FaUserClock, FaSearch, FaCalendarAlt, FaBell } from "react-icons/fa"
import { Link } from "react-router-dom"

const FeaturesSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.2,
      },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const features = [
    {
      icon: <FaUserClock size={24} />,
      title: "Self-Service Registration",
      description: "Register for courses in under two minutes with our streamlined process",
      delay: 100,
    },
    {
      icon: <FaSearch size={24} />,
      title: "Course Catalog",
      description: "Browse and filter courses by  status, and course title or CRN",
      delay: 300,
    },
    {
      icon: <FaCalendarAlt size={24} />,
      title: "Real-time Availability",
      description: " View the current capacity and remaining seat availability for all courses.",
      delay: 500,
    },
    {
      icon: <FaBell size={24} />,
      title: "Automated Notifications",
      description: "Receive email confirmations and reminders about your registered courses",
      delay: 700,
    },
  ]

  return (
    <div ref={sectionRef} className="py-28 px-6 bg-gradient-to-b from-[#F8F9FF] to-white">
      <div className="max-w-5xl mx-auto">
        {/* Animated Section Header */}
        <div
          className="text-center mb-16 transition-all duration-1000 ease-out"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#424747] mb-6">Features designed for students</h2>
          <p className="text-xl md:text-2xl text-[#424747CC]">
            Everything you need for a seamless training registration experience
          </p>
        </div>

        {/* Features Grid with Staggered Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all duration-500 border border-[#424747]/10 flex items-start transform hover:-translate-y-1"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.8s ease-out ${feature.delay}ms`,
              }}
            >
              <div className="bg-[#424747] p-4 rounded-full mr-6 text-white transform transition-transform hover:rotate-12 duration-300">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-[#424747] mb-3">{feature.title}</h3>
                <p className="text-lg text-[#424747CC]">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action with Animation */}
        <div
          className="mt-24 text-center bg-gradient-to-r from-[#CAE2FE] to-[#D8F3FF] p-12 rounded-lg shadow-lg transform transition-all duration-1000"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "scale(1)" : "scale(0.95)",
            transition: `all 1s ease-out ${1000}ms`,
          }}
        >
          <h3 className="text-3xl font-semibold text-[#424747] mb-6">Ready to get started?</h3>
          <p className="text-xl text-[#424747] mb-8">
            Create your account now and start registering for courses in minutes.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-[#424747] text-white px-8 py-4 rounded-lg hover:bg-[#424747CC] transition text-lg transform hover:scale-105 duration-300 shadow-md hover:shadow-xl"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FeaturesSection
