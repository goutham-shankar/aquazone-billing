"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Ensure the theme class ("dark") is applied to the root element
  // by using the `class` attribute. This keeps our CSS variables in
  // `globals.css` responsive to theme changes.
  return <NextThemesProvider attribute="class" {...props}>{children}</NextThemesProvider>
}