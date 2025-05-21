import { cn } from "@/lib/utils"

interface TypographyProps {
  children: React.ReactNode
  className?: string
}

export function Prose({ children, className }: TypographyProps) {
  return (
    <div className={cn(
      "prose prose-blue dark:prose-invert max-w-none",
      "prose-headings:scroll-mt-20",
      "prose-h1:text-3xl prose-h1:font-bold prose-h1:tracking-tight",
      "prose-h2:text-2xl prose-h2:font-semibold prose-h2:tracking-tight",
      "prose-h3:text-xl prose-h3:font-semibold",
      "prose-p:leading-7",
      "prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6",
      "prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6",
      "prose-li:my-2",
      "prose-blockquote:border-l-2 prose-blockquote:border-muted-foreground/50 prose-blockquote:pl-6 prose-blockquote:italic",
      "prose-img:rounded-lg prose-img:border prose-img:border-muted",
      "prose-hr:my-8",
      "prose-table:w-full prose-table:border-collapse",
      "prose-th:border prose-th:border-muted prose-th:p-2 prose-th:bg-muted/50",
      "prose-td:border prose-td:border-muted prose-td:p-2",
      "prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg",
      "prose-code:text-sm prose-code:font-mono prose-code:bg-muted prose-code:p-1 prose-code:rounded",
      className
    )}>
      {children}
    </div>
  )
}
