'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

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
          Alessandro <span className="text-primary">&</span> Lorena
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
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute bottom-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full" />
        </div>
      </motion.div>
    </motion.header>
  )
}