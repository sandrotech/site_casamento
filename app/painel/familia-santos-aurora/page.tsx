'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

type Gift = { id: number; claimed: boolean }
type Rsvp = { name: string }
type Supporter = { id: number; name: string; photo?: string; receipt?: string; createdAt?: string }

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

export default function AdminPage() {
  const [giftStats, setGiftStats] = useState({ total: 0, claimed: 0, available: 0 })
  const [rsvpCount, setRsvpCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [supporters, setSupporters] = useState<Supporter[]>([])
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [receiptCandidates, setReceiptCandidates] = useState<string[]>([])
  const [receiptIndex, setReceiptIndex] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  function withBasePath(u?: string | null) {
    const b = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const p = String(u || '')
    return b ? `${b}${p}` : p
  }
  function makeReceiptCandidates(p?: string | null) {
    const raw = String(p || '')
    const noQuery = raw.replace(/\?.*$/, '')
    const hasExt = /\.[a-zA-Z0-9]+$/.test(noQuery)
    const exts = ['.jpg', '.jpeg', '.png', '.jfif']
    const list: string[] = []
    if (hasExt) {
      list.push(noQuery)
      const curExt = (noQuery.match(/\.[a-zA-Z0-9]+$/)?.[0] || '').toLowerCase()
      for (const e of exts) if (e !== curExt) list.push(noQuery.replace(/\.[a-zA-Z0-9]+$/, e))
    } else {
      for (const e of exts) list.push(`${noQuery}${e}`)
    }
    return list.map(withBasePath)
  }

  async function load() {
    setLoading(true)
    try {
      const [giftsRes, rsvpsRes, supportersRes] = await Promise.all([fetch('/api/gifts'), fetch('/api/rsvp'), fetch('/api/supporters')])
      const gifts: Gift[] = await giftsRes.json()
      const rsvps: Rsvp[] = await rsvpsRes.json()
      const sups: Supporter[] = await supportersRes.json()
      const total = Array.isArray(gifts) ? gifts.length : 0
      const claimed = Array.isArray(gifts) ? gifts.filter((g) => g.claimed).length : 0
      const available = Math.max(total - claimed, 0)
      setGiftStats({ total, claimed, available })
      setRsvpCount(Array.isArray(rsvps) ? rsvps.length : 0)
      setSupporters(Array.isArray(sups) ? sups : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function deleteSupporter(id: number) {
    setLoading(true)
    try {
      const res = await fetch('/api/supporters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        await load()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.section className="py-20 px-4" initial="initial" animate="animate" variants={fadeInUp}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-2">Administração</h2>
          <p className="text-muted-foreground">Acesse e gerencie as telas de presentes e confirmações</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <h3 className="font-serif text-2xl text-foreground mb-2">Presentes</h3>
              <p className="text-muted-foreground mb-4">Cadastre, edite e exclua presentes exibidos na landing.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Total</p>
                  <p className="text-lg font-medium">{giftStats.total}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Disponíveis</p>
                  <p className="text-lg font-medium">{giftStats.available}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Escolhidos</p>
                  <p className="text-lg font-medium">{giftStats.claimed}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="bg-primary text-primary-foreground w-full sm:w-auto">
                  <Link href="/gifts">Abrir gestão de presentes</Link>
                </Button>
                <Button variant="outline" onClick={load} disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <h3 className="font-serif text-2xl text-foreground mb-2">Confirmações</h3>
              <p className="text-muted-foreground mb-4">Acompanhe quem confirmou presença via RSVP.</p>
              <div className="text-center mb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total</p>
                <p className="text-lg font-medium">{rsvpCount}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="bg-primary text-primary-foreground w-full sm:w-auto">
                  <Link href="/rsvps">Abrir lista de confirmações</Link>
                </Button>
                <Button variant="outline" onClick={load} disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-serif text-2xl text-foreground mb-2">Apoiadores</h3>
              <p className="text-muted-foreground mb-4">Acompanhe quem enviou comprovante de apoio.</p>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm">Total: <span className="font-medium">{supporters.length}</span></p>
                <Button variant="outline" onClick={load} disabled={loading}>{loading ? 'Atualizando...' : 'Atualizar'}</Button>
              </div>
              {supporters.length === 0 ? (
                <p className="text-muted-foreground">Nenhum apoio recebido ainda</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {supporters.slice(0, 8).map((s) => (
                    <div key={s.id} className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden bg-muted">
                        {s.photo ? (
                          <img src={withBasePath(s.photo)} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/20">
                            <span className="text-primary font-semibold text-sm">{s.name.slice(0, 1).toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-foreground font-medium truncate">{s.name}</p>
                      {s.createdAt && <p className="text-[11px] text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</p>}
                      <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
                        {s.receipt && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => {
                                const cands = makeReceiptCandidates(s.receipt)
                                setReceiptCandidates(cands)
                                setReceiptIndex(0)
                                setReceiptUrl(cands[0] || null)
                                setReceiptOpen(true)
                              }}
                            >
                              Ver comprovante
                            </Button>
                            <a
                              href={withBasePath(s.receipt)}
                              download
                              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                            >
                              Baixar
                            </a>
                          </>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => { setConfirmId(s.id); setConfirmOpen(true) }}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Comprovante</DialogTitle>
            </DialogHeader>
            {receiptUrl && (
              <img
                src={receiptUrl}
                alt="Comprovante de apoio"
                className="w-full h-auto rounded-md border border-border"
                onError={() => {
                  if (receiptCandidates.length > receiptIndex + 1) {
                    const nextIdx = receiptIndex + 1
                    setReceiptIndex(nextIdx)
                    setReceiptUrl(receiptCandidates[nextIdx])
                  }
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir apoio?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (confirmId != null) {
                    await deleteSupporter(confirmId)
                  }
                  setConfirmOpen(false)
                  setConfirmId(null)
                }}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.section>
  )
}
