import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
}

interface DataPacket {
  x: number
  y: number
  targetX: number
  targetY: number
  progress: number
  speed: number
}

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let particles: Particle[] = []
    let dataPackets: DataPacket[] = []
    let gridNodes: { x: number; y: number }[] = []

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      // Regenerate grid nodes
      gridNodes = []
      const spacing = 80
      for (let x = spacing; x < rect.width; x += spacing) {
        for (let y = spacing; y < rect.height; y += spacing) {
          // Add some randomness
          gridNodes.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
          })
        }
      }
    }

    const spawnParticle = () => {
      if (particles.length > 25) return
      const rect = canvas.getBoundingClientRect()
      particles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        life: 0,
        maxLife: 200 + Math.random() * 200,
      })
    }

    const spawnDataPacket = () => {
      if (dataPackets.length > 4 || gridNodes.length < 2) return
      const startNode = gridNodes[Math.floor(Math.random() * gridNodes.length)]
      const endNode = gridNodes[Math.floor(Math.random() * gridNodes.length)]
      if (startNode === endNode) return

      dataPackets.push({
        x: startNode.x,
        y: startNode.y,
        targetX: endNode.x,
        targetY: endNode.y,
        progress: 0,
        speed: 0.005 + Math.random() * 0.01,
      })
    }

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Draw grid connections (subtle)
      ctx.strokeStyle = 'rgba(242, 201, 76, 0.03)'
      ctx.lineWidth = 1
      gridNodes.forEach((node, i) => {
        gridNodes.slice(i + 1).forEach((other) => {
          const dist = Math.hypot(node.x - other.x, node.y - other.y)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.stroke()
          }
        })
      })

      // Draw and update particles
      particles = particles.filter((p) => {
        p.x += p.vx
        p.y += p.vy
        p.life++

        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.4
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(242, 201, 76, ${alpha})`
        ctx.fill()

        return p.life < p.maxLife
      })

      // Draw and update data packets
      dataPackets = dataPackets.filter((packet) => {
        packet.progress += packet.speed

        const x = packet.x + (packet.targetX - packet.x) * packet.progress
        const y = packet.y + (packet.targetY - packet.y) * packet.progress

        // Glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12)
        gradient.addColorStop(0, 'rgba(242, 201, 76, 0.6)')
        gradient.addColorStop(0.5, 'rgba(242, 201, 76, 0.2)')
        gradient.addColorStop(1, 'rgba(242, 201, 76, 0)')
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(242, 201, 76, 0.9)'
        ctx.fill()

        // Trail
        const trailLength = 0.1
        if (packet.progress > trailLength) {
          const trailX = packet.x + (packet.targetX - packet.x) * (packet.progress - trailLength)
          const trailY = packet.y + (packet.targetY - packet.y) * (packet.progress - trailLength)
          ctx.beginPath()
          ctx.moveTo(trailX, trailY)
          ctx.lineTo(x, y)
          ctx.strokeStyle = 'rgba(242, 201, 76, 0.3)'
          ctx.lineWidth = 2
          ctx.stroke()
        }

        return packet.progress < 1
      })

      // Spawn new elements occasionally (reduced density)
      if (Math.random() < 0.01) spawnParticle()
      if (Math.random() < 0.005) spawnDataPacket()

      animationId = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener('resize', resize)

    // Initial spawns (reduced)
    for (let i = 0; i < 12; i++) spawnParticle()
    for (let i = 0; i < 2; i++) spawnDataPacket()

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}
