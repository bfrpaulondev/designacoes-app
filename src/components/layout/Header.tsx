"use client"

import { useAppStore } from "@/store"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function Header() {
  const { currentPage, user, configuracoes } = useAppStore()
  const { theme, setTheme } = useTheme()

  const pageTitle = {
    dashboard: "Dashboard",
    publicadores: "Publicadores",
    partes: "Partes da Reunião",
    designacoes: "Designações",
    configuracoes: "Configurações",
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-4 lg:ml-64">
          <h2 className="text-xl font-semibold">
            {pageTitle[currentPage as keyof typeof pageTitle] || "Dashboard"}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-muted-foreground">
            {configuracoes?.nome_congregacao || "Congregação"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Alternar tema</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
