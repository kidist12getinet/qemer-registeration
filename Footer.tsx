"use client"

import { Link } from "react-router-dom"
import { useContext } from "react"
import { UserContext } from "../App"
import qemerLogo from "../assets/qemer.webp"
import { FaFacebook, FaYoutube, FaLinkedin, FaInstagram, FaArrowUp } from "react-icons/fa"

function Footer() {
  const { user } = useContext(UserContext)

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <footer className="bg-[#424747] text-white py-16 px-6 mt-16 relative">
      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="absolute top-0 left-3/4 transform -translate-x-1/2 -translate-y-1/2 bg-white text-[#424747] w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-300 group"
        aria-label="Scroll to top"
      >
        <FaArrowUp className="group-hover:animate-bounce" />
      </button>

      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Left Section - Logo + Name */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-3">
              <img src={qemerLogo || "/placeholder.svg"} className="h-16 w-auto" alt="Qemer logo" />
              <div>
                <div className="text-2xl font-bold">Qemer</div>
                <div className="text-sm">Training hub</div>
              </div>
            </div>

            {/* Follow Us Section */}
            <div>
              <div className="flex items-center gap-4">
                <h4 className="text-lg font-semibold mb-2">Follow Us On:</h4>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="text-white hover:text-gray-300 transform hover:scale-110 transition-transform duration-300"
                  >
                    <FaFacebook size={24} />
                  </a>
                  <a
                    href="#"
                    className="text-white hover:text-gray-300 transform hover:scale-110 transition-transform duration-300"
                  >
                    <FaYoutube size={24} />
                  </a>
                  <a
                    href="#"
                    className="text-white hover:text-gray-300 transform hover:scale-110 transition-transform duration-300"
                  >
                    <FaLinkedin size={24} />
                  </a>
                  <a
                    href="#"
                    className="text-white hover:text-gray-300 transform hover:scale-110 transition-transform duration-300"
                  >
                    <FaInstagram size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Center Section - Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Useful Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-md opacity-80 hover:opacity-100 hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-md opacity-80 hover:opacity-100 hover:underline">
                  Courses
                </Link>
              </li>
              {user ? (
                <li>
                  <Link to="/student-dashboard" className="text-md opacity-80 hover:opacity-100 hover:underline">
                    Dashboard
                  </Link>
                </li>
              ) : (
                <li>
                  <Link to="/signup" className="text-md opacity-80 hover:opacity-100 hover:underline">
                    Signup
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Right Section - Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact</h4>
            <div className="text-md opacity-80 space-y-3">
              <p>
                Email:{" "}
                <a href="mailto:contactus@qemertech.com" className="hover:underline">
                  contactus@qemertech.com
                </a>
              </p>
              <p>
                Phone:{" "}
                <a href="tel:+251911234567" className="hover:underline">
                  +251 911 234 567
                </a>
              </p>
              <p>Address: Meskel Flower, Addis Ababa</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm opacity-70">
          © 2025 Qemer Software Technology PLC. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
