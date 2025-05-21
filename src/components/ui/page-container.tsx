import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("container mx-auto px-4 py-12 md:py-16", className)}>
      <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm rounded-lg shadow-lg p-6 md:p-8">
        {children}
      </div>
    </div>
  )
}
