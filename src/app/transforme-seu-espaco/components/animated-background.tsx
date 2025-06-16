'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  opacity: number
  blur: number
  shape: 'circle' | 'square' | 'triangle'
  rotation: number
  depth: number
}

export function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  
  // Efeito para redimensionar o canvas
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Efeito para gerar partículas
  useEffect(() => {
    // Gerar partículas apenas no cliente
    const colors = [
      '#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', 
      '#42A5F5', '#2196F3', '#1E88E5', '#1976D2'
    ]
    const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle']
    const newParticles: Particle[] = []
    
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 60 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.3 + 0.05,
        blur: Math.random() * 5,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * 360,
        depth: Math.random()
      })
    }
    
    setParticles(newParticles)
  }, [])
  
  // Efeito para desenhar ondas no canvas
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = dimensions.width
    canvas.height = dimensions.height
    
    let animationFrameId: number
    let phase = 0
    
    const drawWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Primeira onda
      drawSingleWave(ctx, canvas.width, canvas.height, phase, 0.03, 50, 'rgba(33, 150, 243, 0.1)')
      
      // Segunda onda com deslocamento de fase
      drawSingleWave(ctx, canvas.width, canvas.height, phase + 0.5, 0.04, 30, 'rgba(33, 150, 243, 0.05)')
      
      // Terceira onda mais rápida
      drawSingleWave(ctx, canvas.width, canvas.height, phase * 1.5, 0.02, 70, 'rgba(33, 150, 243, 0.07)')
      
      phase += 0.005
      animationFrameId = requestAnimationFrame(drawWave)
    }
    
    drawWave()
    
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [dimensions])
  
  const drawSingleWave = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    phase: number,
    frequency: number,
    amplitude: number,
    color: string
  ) => {
    ctx.beginPath()
    
    // Começar no canto inferior esquerdo
    ctx.moveTo(0, height)
    
    // Gerar pontos ao longo da onda
    for (let x = 0; x <= width; x += 10) {
      const y = Math.sin(x * frequency + phase) * amplitude + height * 0.8
      ctx.lineTo(x, y)
    }
    
    // Completar o caminho até o canto inferior direito
    ctx.lineTo(width, height)
    ctx.closePath()
    
    ctx.fillStyle = color
    ctx.fill()
  }
  
  // Renderizar formas diferentes com base na propriedade shape
  const renderShape = (particle: Particle) => {
    switch (particle.shape) {
      case 'square':
        return (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              filter: `blur(${particle.blur}px)`,
              zIndex: Math.floor(particle.depth * 10),
              borderRadius: '10%'
            }}
            animate={{
              x: [0, Math.random() * 120 - 60, 0],
              y: [0, Math.random() * 120 - 60, 0],
              rotate: [0, particle.rotation, 0]
            }}
            transition={{
              duration: 60 + particle.depth * 40,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )
      case 'triangle':
        return (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: 0,
              height: 0,
              borderLeft: `${particle.size / 2}px solid transparent`,
              borderRight: `${particle.size / 2}px solid transparent`,
              borderBottom: `${particle.size}px solid ${particle.color}`,
              opacity: particle.opacity,
              filter: `blur(${particle.blur}px)`,
              zIndex: Math.floor(particle.depth * 10)
            }}
            animate={{
              x: [0, Math.random() * 120 - 60, 0],
              y: [0, Math.random() * 120 - 60, 0],
              rotate: [0, particle.rotation, 0]
            }}
            transition={{
              duration: 60 + particle.depth * 40,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )
      default:
        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              filter: `blur(${particle.blur}px)`,
              zIndex: Math.floor(particle.depth * 10)
            }}
            animate={{
              x: [0, Math.random() * 120 - 60, 0],
              y: [0, Math.random() * 120 - 60, 0],
              scale: [1, 1 + particle.depth * 0.5, 1]
            }}
            transition={{
              duration: 60 + particle.depth * 40,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )
    }
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Canvas para ondas fluidas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Partículas flutuantes */}
      {particles.map((particle) => renderShape(particle))}
      
      {/* Gradiente de sobreposição */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/30" />
    </div>
  )
}
