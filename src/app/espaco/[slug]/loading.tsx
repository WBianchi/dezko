import { Skeleton } from "@/components/ui/skeleton"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Nav />
      
      <main>
        {/* Header Skeleton */}
        <div className="relative h-[500px]">
          <Skeleton className="absolute inset-0" />
          <div className="absolute inset-0">
            <div className="container mx-auto h-full px-4">
              <div className="flex items-end h-full pb-12">
                <div className="flex items-end gap-8">
                  <Skeleton className="w-48 h-48 rounded-xl" />
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            <div>
              <Skeleton className="h-[600px] rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-[400px] rounded-lg" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
