'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { motion } from 'framer-motion'

type Rsvp = {
  name: string
  guests: number
  message: string
  createdAt: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

export default function RsvpsPage() {
  const [data, setData] = useState<Rsvp[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/rsvp')
      const json = await res.json()
      setData(Array.isArray(json) ? json.reverse() : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <motion.section className="py-20 px-4" initial="initial" animate="animate" variants={fadeInUp}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-2">Confirmações</h2>
          <p className="text-muted-foreground">Acompanhe quem confirmou presença</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-end mb-3">
              <button
                onClick={load}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm bg-background hover:bg-muted disabled:opacity-50"
              >
                {loading ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Acompanhantes</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Quando</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.guests}</TableCell>
                    <TableCell className="max-w-[360px] truncate">{r.message}</TableCell>
                    <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>{data.length === 0 ? 'Nenhuma confirmação ainda' : `${data.length} confirmações`}</TableCaption>
            </Table>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  )
}