import Image from 'next/image'
import Link from 'next/link'
import { AnimatedBlobs } from '@/components/ui/animated-blobs'
import { AnimatedPatterns } from '@/components/ui/animated-patterns'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Categories } from '@/components/categories'
import { FeaturedSpaces } from '@/components/featured-spaces'
import { SearchSection } from '@/components/search-section'
import { CTASection } from '@/components/cta-section'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Nav />
      
      {/* Hero Section */}
      <div className="w-full min-h-[90vh] bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-purple-950 relative overflow-hidden">
        <AnimatedBlobs />
        <AnimatedPatterns />
        
        <div className="container mx-auto px-4 py-28 md:py-36 relative">
          <SearchSection />
        </div>
      </div>

      {/* Categories */}
      <Categories />

      {/* CTA Section */}
      <CTASection />

      {/* Featured Spaces */}
      <FeaturedSpaces />

      <Footer />
    </main>
  )
}
