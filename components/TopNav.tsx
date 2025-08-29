"use client";

import React, { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Notifications } from "./notifications";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";

export function TopNav() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const { user, firebaseUser, signOutApp } = useAuth();
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isProfileMenuOpen &&
        profileMenuRef.current &&
        profileButtonRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsProfileMenuOpen(false);
      await signOutApp();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Handle image loading errors
  const handleImageError = () => {
    console.log("Image loading failed for URL:", firebaseUser?.photoURL);
    setImageError(true);
  };

  // Get user display details
  const displayName = user?.name || "User";
  const email = user?.email || "";
  const initials = displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("");

  // Debug: Log Firebase user data and reset imageError when user changes
  useEffect(() => {
    console.log("TopNav Debug - firebaseUser:", firebaseUser);
    console.log("TopNav Debug - photoURL:", firebaseUser?.photoURL);
    console.log("TopNav Debug - imageError:", imageError);
    
    // Reset image error when user changes
    if (firebaseUser?.photoURL) {
      setImageError(false);
    }
  }, [firebaseUser, imageError]);

  // Get user display name (handle null cases and truncate on mobile)
  const getUserDisplayName = () => {
    const name = displayName;
    if (isMobile && name.length > 12) {
      return name.substring(0, 12) + "...";
    }
    return name;
  };

  // Get current page title from pathname
  const getCurrentPageTitle = () => {
    if (pathSegments.length === 0) return "Dashboard";
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between sticky top-0 z-20">
      {/* Left side - Logo on mobile, Page title and breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Spacer for mobile hamburger menu from sidebar */}
        <div className="lg:hidden w-10"></div>
        
        <div className="min-w-0 flex-1">
          {/* Logo visible only on mobile */}
          <div className="md:hidden">
            <Link href="/" className="flex items-center">
              <span className="text-lg font-semibold text-gray-800 dark:text-white">
                New Golden AquaZone
              </span>
            </Link>
          </div>

          {/* Page title and breadcrumb visible only on desktop */}
          <div className="hidden md:block">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-white truncate">
              {getCurrentPageTitle()}
            </h1>
            {/* Breadcrumb */}
     
          </div>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
        {/* Current Date - Desktop only */}
        <div className="hidden lg:block text-right mr-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Notifications */}
        <div className="scale-[0.85] sm:scale-100">
          <Notifications />
        </div>

        {/* Theme toggle (visible on desktop only) */}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>

        {/* User profile */}
        <div className="relative">
          <button
            ref={profileButtonRef}
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center cursor-pointer gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 sm:px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
            aria-label="User menu"
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="true"
          >
            {/* User Avatar */}
            {firebaseUser?.photoURL && !imageError ? (
              <img
                src={firebaseUser.photoURL}
                alt="Profile"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover flex-shrink-0"
                onError={handleImageError}
              />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {initials}
              </div>
            )}
            
            {/* User Name - responsive display */}
            <div className="hidden sm:flex items-center gap-1 min-w-0">
              <span className="text-sm md:text-base font-medium truncate max-w-[120px] md:max-w-[150px]">
                {getUserDisplayName()}
              </span>
              <ChevronDown 
                size={14} 
                className={`transition-transform flex-shrink-0 ${isProfileMenuOpen ? 'rotate-180' : ''}`} 
              />
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <>
              {/* Mobile backdrop */}
              <div 
                className="fixed inset-0 z-20 sm:hidden" 
                onClick={() => setIsProfileMenuOpen(false)}
                aria-hidden="true"
              />
              
              <div
                ref={profileMenuRef}
                className={`absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-30 ${
                  isMobile ? 'w-64' : 'w-56'
                } min-w-max`}
                role="menu"
                aria-orientation="vertical"
              >
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    {firebaseUser?.photoURL && !imageError ? (
                      <img
                        src={firebaseUser.photoURL}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    Settings
                  </Link>

                  {/* Mobile: Theme toggle inside dropdown */}
                  <div className="block md:hidden px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-200">Theme</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
                
                {/* Logout Button */}
                <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    role="menuitem"
                  >
                    <LogOut size={16} className="flex-shrink-0" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}