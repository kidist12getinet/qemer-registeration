"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { FaStar, FaRegStar, FaStarHalfAlt, FaQuoteLeft } from "react-icons/fa"

// Import your static images
import Student1 from "../assets/testimonials/student1.jpg"
import Student2 from "../assets/testimonials/student2.jpg"
import Student3 from "../assets/testimonials/student3.jpg"

interface TestimonialProps {
  quote: string
  author: string
  role: string
  avatar: string
  rating: number
  delay: number
  isVisible: boolean
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<FaStar key={i} className="text-yellow-400" />)
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />)
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-400" />)
    }
  }

  return <div className="flex gap-1 mb-3">{stars}</div>
}

const TestimonialCard: React.FC<TestimonialProps> = ({ quote, author, role, avatar, rating, delay, isVisible }) => {
  return (
    <div
      className="bg-white p-8 rounded-lg shadow-md border border-[#424747]/10 h-full flex flex-col transform hover:-translate-y-2 transition-all duration-500 hover:shadow-xl"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: `all 0.8s ease-out ${delay}ms`,
      }}
    >
      <StarRating rating={rating} />
      <div className="text-[#424747]/20 mb-4">
        <FaQuoteLeft size={32} />
      </div>
      <p className="text-lg text-[#424747] italic mb-6 flex-grow">"{quote}"</p>
      <div className="flex items-center mt-auto">
        <img
          src={avatar || "/placeholder.svg"}
          alt={author}
          className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-[#424747]/20"
        />
        <div>
          <h4 className="font-semibold text-lg text-[#424747]">{author}</h4>
          <p className="text-md text-[#424747CC]">{role}</p>
        </div>
      </div>
    </div>
  )
}

const TestimonialsSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

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

  const testimonials = [
    {
      quote: "The training platform made course registration so simple. I completed everything in minutes!",
      author: "Selamawit Kebede",
      role: "Computer Science Student",
      avatar: Student1, // Using imported image
      rating: 4.5,
      delay: 100,
    },
    {
      quote: "Excellent user experience. The real-time availability feature saved me so much time.",
      author: "Abel Tesfaye",
      role: "Engineering Student",
      avatar: Student2, // Using imported image
      rating: 5,
      delay: 300,
    },
    {
      quote: "Best training platform I've used. The notifications keep me on track with my courses.",
      author: "Meron Girma",
      role: "Business Administration",
      avatar: Student3, // Using imported image
      rating: 4,
      delay: 500,
    },
  ]

  return (
    <section ref={sectionRef} className="py-28 px-6 bg-gradient-to-b from-white to-[#F8F9FF] relative overflow-hidden">
      {/* Background decorative elements */}
      <div
        className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-100 opacity-30 blur-3xl"
        style={{
          transform: isVisible ? "scale(1)" : "scale(0.8)",
          opacity: isVisible ? 0.3 : 0,
          transition: "all 1.5s ease-out",
        }}
      ></div>
      <div
        className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-100 opacity-30 blur-3xl"
        style={{
          transform: isVisible ? "scale(1)" : "scale(0.8)",
          opacity: isVisible ? 0.3 : 0,
          transition: "all 1.5s ease-out 300ms",
        }}
      ></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <h2
          className="text-4xl md:text-5xl font-bold text-[#424747] mb-16 text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s ease-out",
          }}
        >
          What Our Students Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
