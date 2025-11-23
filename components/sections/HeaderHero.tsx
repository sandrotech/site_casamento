'use client'

import { motion } from 'framer-motion'
import { Heart, ChevronsDown, Hand } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

export default function HeaderHero() {
  return (
    <motion.header
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-background" />
      <motion.div className="relative z-10 space-y-6" {...fadeInUp}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          aria-hidden="true"
        >
          <Heart className="mx-auto h-16 w-16 text-primary fill-primary" />
        </motion.div>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight text-foreground">
          <motion.span
            className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground"
            initial={{ opacity: 0, y: 8, letterSpacing: '-0.02em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0em', backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1], backgroundPosition: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: 'linear' } }}
            style={{ backgroundSize: '200% 100%' }}
          >
            Lorena
          </motion.span>
          <span className="text-primary">&</span>
          <motion.span
            className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground"
            initial={{ opacity: 0, y: 8, letterSpacing: '-0.02em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0em', backgroundPosition: ['100% 0%', '0% 0%', '100% 0%'] }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 0.61, 0.36, 1], backgroundPosition: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: 'linear' } }}
            style={{ backgroundSize: '200% 100%' }}
          >
            Alessandro
          </motion.span>
        </h1>
        <p className="text-xl md:text-2xl font-light text-muted-foreground">
          &quot;O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.&quot; 1 Coríntios 13:4
        </p>
        <motion.div
          className="pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <time dateTime="2026-01-17" className="text-lg md:text-xl text-foreground/80">
            17 de Janeiro de 2026
          </time>
          <p className="text-sm md:text-base text-foreground/60 mt-1">às 15Hrs</p>
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
      >
        <div className="flex flex-col items-center gap-1 pointer-events-none select-none">
          <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.6 }}>
            <ChevronsDown className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </motion.div>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.8, delay: 0.2 }}>
            <Hand className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </motion.div>
          <span className="text-xs md:text-sm text-primary/80">Arraste para baixo</span>
        </div>
      </motion.div>
    </motion.header>
  )
}
