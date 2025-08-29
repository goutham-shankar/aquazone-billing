"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  Wallet,
  Receipt,
  Users2,
  Settings,
  HelpCircle,
  Menu,
  ChevronLeft,
  X,
} from "lucide-react";
import Image from "next/image";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Customers", href: "/customers", icon: Users2 },
  { name: "Products", href: "/products", icon: Package },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Transactions", href: "/transactions", icon: Wallet },
];

const bottomNavigation: NavigationItem[] = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export function EnhancedSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Helper function to combine class names
  const classNames = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(" ");
  };

  // Close sidebar when clicking outside on mobile
  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      if (
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsMobileOpen(false);
      }
    },
    [isMobileOpen]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [handleOutsideClick]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Memoized toggle functions for performance
  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const NavItem = ({ item }: { item: NavigationItem }) => (
    <Link
      href={item.href}
      className={classNames(
        "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-black/10 dark:hover:bg-gray-800/50",
        pathname === item.href
          ? "bg-black text-white dark:bg-black dark:hover:bg-blue-700"
          : "text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-gray-800/50",
        isCollapsed ? "justify-center px-2" : "",
        "lg:text-sm text-base" // Larger text on mobile
      )}
      aria-current={pathname === item.href ? "page" : undefined}
    >
      <item.icon
        className={classNames(
          "h-5 w-5 lg:h-5 lg:w-5 flex-shrink-0",
          !isCollapsed ? "mr-3" : ""
        )}
        aria-hidden="true"
      />
      {!isCollapsed && <span className="truncate">{item.name}</span>}
    </Link>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        onClick={toggleMobileMenu}
        aria-label={isMobileOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isMobileOpen}
        aria-controls="mobile-sidebar"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          aria-hidden="true"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        id="mobile-sidebar"
        className={classNames(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out",
          // Desktop widths
          "lg:static lg:translate-x-0",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          // Mobile widths and positioning
          "w-72 sm:w-80",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div
            className={classNames(
              "flex items-center gap-2 px-4 py-4 relative",
              isCollapsed ? "justify-center px-2" : ""
            )}
          >
            <div className="flex flex-col items-center justify-center">
              <div
                className="w-8 h-8 bg-black dark:bg-white rounded-full cursor-pointer flex items-center justify-center"
                onClick={toggleCollapse}
                style={{ cursor: "pointer" }}
              >
                <span className="text-white dark:text-black text-xs font-bold">
                  NGA
                </span>
              </div>
              {!isCollapsed && (
                <Link
                  href="/"
                  className="flex items-center font-semibold text-center truncate mt-2"
                >
                  <span className="text-lg text-gray-900 dark:text-white">
                    New Golden AquaZone
                  </span>
                </Link>
              )}
            </div>

            {/* Collapse button - desktop only */}
            <button
              className={classNames(
                "hidden lg:block h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center transition-colors",
                isCollapsed ? "hidden" : ""
              )}
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                className={classNames(
                  "h-4 w-4 transition-transform text-gray-600 dark:text-gray-300",
                  isCollapsed ? "rotate-180" : ""
                )}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <nav className="flex-1 space-y-1 p-3" aria-label="Main navigation">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>

        {/* Bottom navigation */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <nav className="space-y-1" aria-label="Secondary navigation">
            {bottomNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

// Provide a default export for backward compatibility with imports that
// expect a default component (e.g. `import Navigation from "./Navigation"`).
export default EnhancedSidebar;