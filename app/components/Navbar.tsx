"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "../context/Authcontext"
import { Notifications } from "./Notifications"
import { ThemeToggle } from "./ThemeToggle"

export function TopNav() {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)

  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const displayName = user?.displayName || "User"
  const email = user?.email || "user@example.com"
  const photoURL = user?.photoURL || ""
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="container max-w-screen-xl mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Left: Breadcrumb */}
        <div className="hidden md:flex min-w-0 flex-1 items-center space-x-2 truncate">
          <Link href="/" className={`text-sm font-medium ${pathSegments.length === 0 ? "underline text-blue-600" : ""}`}>
            Home
          </Link>
          {pathSegments.map((segment, index) => {
            const fullPath = `/${pathSegments.slice(0, index + 1).join("/")}`
            const isActive = index === pathSegments.length - 1
            return (
              <React.Fragment key={fullPath}>
                <span className="text-gray-500">/</span>
                <Link
                  href={fullPath}
                  className={`text-sm font-medium truncate ${isActive ? "underline text-blue-600" : ""}`}
                  title={segment}
                >
                  {segment.charAt(0).toUpperCase() + segment.slice(1)}
                </Link>
              </React.Fragment>
            )
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
          <div className="scale-[0.85] sm:scale-100">
            <Notifications />
          </div>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          
          {/* Simple user menu without complex UI components */}
          <div className="relative group">
            <button className="relative h-8 w-8 rounded-full p-0 bg-gray-100 hover:bg-gray-200 transition-colors">
              {photoURL ? (
                <img 
                  src={photoURL} 
                  alt={displayName}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                  {initials}
                </div>
              )}
            </button>
            
            {/* Simple dropdown */}
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{email}</p>
              </div>
              <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Profile
              </Link>
              <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Settings
              </Link>
              <div className="block md:hidden px-4 py-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
              <hr className="my-1 block md:hidden" />
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
