import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("w-full bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-purple-950 relative overflow-hidden", className)}>
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            {description}
          </p>
        )}
      </div>
      
      {/* Glassmorphism effect */}
      <div className="absolute inset-0 bg-white/30 dark:bg-gray-950/30 backdrop-blur-[2px] z-0" />
    </div>
  )
}
