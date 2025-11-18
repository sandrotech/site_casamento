'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

type Gift = { id: number; claimed: boolean }
type Rsvp = { name: string }

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

export default function AdminPage() {
  const [giftStats, setGiftStats] = useState({ total: 0, claimed: 0, available: 0 })
  const [rsvpCount, setRsvpCount] = useState(0)
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [giftsRes, rsvpsRes] = await Promise.all([fetch('/api/gifts'), fetch('/api/rsvp')])
      const gifts: Gift[] = await giftsRes.json()
      const rsvps: Rsvp[] = await rsvpsRes.json()
      const total = Array.isArray(gifts) ? gifts.length : 0
      const claimed = Array.isArray(gifts) ? gifts.filter((g) => g.claimed).length : 0
      const available = Math.max(total - claimed, 0)
      setGiftStats({ total, claimed, available })
      setRsvpCount(Array.isArray(rsvps) ? rsvps.length : 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <motion.section className="py-20 px-4" initial="initial" animate="animate" variants={fadeInUp}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-2">Administração</h2>
          <p className="text-muted-foreground">Acesse e gerencie as telas de presentes e confirmações</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-serif text-2xl text-foreground mb-2">Presentes</h3>
              <p className="text-muted-foreground mb-4">Cadastre, edite e exclua presentes exibidos na landing.</p>
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total</p>
                  <p className="text-lg font-medium">{giftStats.total}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Disponíveis</p>
                  <p className="text-lg font-medium">{giftStats.available}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Escolhidos</p>
                  <p className="text-lg font-medium">{giftStats.claimed}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button asChild className="bg-primary text-primary-foreground">
                  <Link href="/gifts">Abrir gestão de presentes</Link>
                </Button>
                <Button variant="outline" onClick={load} disabled={loading}>
                  {loading ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-serif text-2xl text-foreground mb-2">Confirmações</h3>
              <p className="text-muted-foreground mb-4">Acompanhe quem confirmou presença via RSVP.</p>
              <div className="text-center mb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total</p>
                <p className="text-lg font-medium">{rsvpCount}</p>
              </div>
              <div className="flex gap-3">
                <Button asChild className="bg-primary text-primary-foreground">
                  <Link href="/rsvps">Abrir lista de confirmações</Link>
                </Button>
                <Button variant="outline" onClick={load} disabled={loading}>
                  {loading ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.section>
  )
}
