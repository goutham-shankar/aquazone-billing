"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "../context/Authcontext"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Button } from "../components/ui/button"
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
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container max-w-screen-xl mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Left: Breadcrumb */}
        <div className="hidden md:flex min-w-0 flex-1 items-center space-x-2 truncate">
          <Link href="/" className={`text-sm font-medium ${pathSegments.length === 0 ? "underline text-primary" : ""}`}>
            Home
          </Link>
          {pathSegments.map((segment, index) => {
            const fullPath = `/${pathSegments.slice(0, index + 1).join("/")}`
            const isActive = index === pathSegments.length - 1
            return (
              <React.Fragment key={fullPath}>
                <span className="text-muted-foreground">/</span>
                <Link
                  href={fullPath}
                  className={`text-sm font-medium truncate ${isActive ? "underline text-primary" : ""}`}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={photoURL} alt={displayName} />
                  <AvatarFallback className="text-xs sm:text-sm">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <div className="block md:hidden px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
              <DropdownMenuSeparator className="block md:hidden" />
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
