"use client"

import { Link, useNavigate } from "react-router-dom"
import { useContext } from "react"
import { UserContext } from "../App"
import qemerLogo from "../assets/qemer.webp"
import { FaSignOutAlt } from "react-icons/fa"
import { logout } from "../services/authService"

// TypeScript interface for the component props
type HeaderProps = {}

function Header({}: HeaderProps) {
  const navigate = useNavigate()
  const { user, setUser } = useContext(UserContext)
  const isLoggedIn = !!user

  // Handle logout
  const handleLogout = () => {
    logout()
    setUser(null)
    navigate("/")
  }

  return (
    <header className="fixed w-full top-0 left-0 z-50 flex items-center justify-between px-6 py-4 shadow-md bg-white">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={qemerLogo || "/placeholder.svg"}
            className="h-16 w-auto transition-all hover:opacity-90"
            alt="Qemer logo"
          />
          <div>
            <div className="text-xl font-bold text-[#424747]">Qemer</div>
            <div className="text-xs text-[#424747]">Training hub</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav>
          <ul className="flex space-x-6 font-medium">
            <li>
              <Link to="/" className="text-[#424747] hover:text-[#424747CC] transition-colors">
                Home
              </Link>
            </li>
            {!user?.isAdmin && (
              <li>
                <Link to="/courses" className="text-[#424747] hover:text-[#424747CC] transition-colors">
                  Courses
                </Link>
              </li>
            )}
            {isLoggedIn && (
              <li>
                {user.isAdmin ? (
                  <Link to="/admin-dashboard" className="text-[#424747] hover:text-[#424747CC] transition-colors">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link to="/student-dashboard" className="text-[#424747] hover:text-[#424747CC] transition-colors">
                    Dashboard
                  </Link>
                )}
              </li>
            )}
          </ul>
        </nav>

        {/* Auth Buttons */}
        <div className="flex space-x-4">
          {isLoggedIn ? (
            <>
              <span className="text-[#424747] flex items-center">Hi, {user.firstName}</span>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 bg-[#424747] text-white rounded hover:bg-[#424747CC] transition-colors flex items-center gap-2"
              >
                <FaSignOutAlt size={14} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm px-4 py-2 border border-[#424747] text-[#424747] rounded hover:bg-[#424747] hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm px-4 py-2 bg-[#424747] text-white rounded hover:bg-[#424747CC] transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
