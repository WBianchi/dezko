'use client'

import { motion } from 'framer-motion'

export function AnimatedBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Blob 1 */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl"
      />

      {/* Blob 2 */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-400/30 rounded-full blur-3xl"
      />

      {/* Blob 3 */}
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl"
      />
    </div>
  )
}
