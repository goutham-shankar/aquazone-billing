"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Notifications() {
  return (
    <Button variant="outline" size="icon" className="relative">
      <Bell className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Notifications</span>
      {/* You can add notification badge here */}
    </Button>
  )
}
