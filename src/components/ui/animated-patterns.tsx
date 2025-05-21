'use client'

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

function useWindowSize() {
  const [size, setSize] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    
    window.addEventListener('resize', updateSize)
    updateSize()
    
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return size
}

export function AnimatedPatterns() {
  const { width, height } = useWindowSize()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-3xl"
          initial={{
            x: Math.random() * width,
            y: Math.random() * height,
          }}
          animate={{
            x: [
              Math.random() * width,
              Math.random() * width,
              Math.random() * width,
            ],
            y: [
              Math.random() * height,
              Math.random() * height,
              Math.random() * height,
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  )
}
