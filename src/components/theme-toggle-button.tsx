"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      <Eye className="size-5 dark:hidden" />
      <EyeOff className="hidden size-5 dark:block" />
    </Button>
  )
}
