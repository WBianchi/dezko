import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"

interface PolicyLayoutProps {
  title: string
  badge: string
  children: React.ReactNode
}

export function PolicyLayout({ title, badge, children }: PolicyLayoutProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-gray-950 dark:via-indigo-950 dark:to-gray-900">
      <Nav />
      
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <Badge variant="secondary" className="mb-4">
            {badge}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            {title}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <article className="mx-auto max-w-3xl prose prose-blue dark:prose-invert">
          {children}
        </article>
      </div>

      <Footer />
    </main>
  )
}
