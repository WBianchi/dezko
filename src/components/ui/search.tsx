import * as React from "react"
import { Search as SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Search({ className, ...props }: SearchProps) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        {...props}
        className={cn(
          "pl-8 bg-white dark:bg-gray-950",
          className
        )}
      />
    </div>
  )
}
