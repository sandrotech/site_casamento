'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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

function formatWhen(iso: string) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString()
}

export default function RsvpsPage() {
  const [data, setData] = useState<Rsvp[]>([])
  const [loading, setLoading] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmKey, setConfirmKey] = useState<string | null>(null)

  const [msgOpen, setMsgOpen] = useState(false)
  const [selected, setSelected] = useState<Rsvp | null>(null)

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

  async function deleteRsvp(createdAt: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/rsvp', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ createdAt }),
      })
      if (res.ok) await load()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const totalCaption = useMemo(() => {
    return data.length === 0 ? 'Nenhuma confirmação ainda' : `${data.length} confirmações`
  }, [data.length])

  return (
    <motion.section className="py-20 px-4" initial="initial" animate="animate" variants={fadeInUp}>
      <div className="max-w-5xl mx-auto">
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

            {/* Em telas pequenas, ainda pode rolar horizontalmente — mas a mensagem não “explode” o layout */}
            <div className="w-full overflow-x-auto">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[170px]">Nome</TableHead>
                    <TableHead className="w-[140px]">Acompanhantes</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead className="w-[190px]">Quando</TableHead>
                    <TableHead className="w-[110px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data.map((r, idx) => {
                    const msg = (r.message ?? '').trim()
                    const isLong = msg.length > 120

                    return (
                      <TableRow key={`${r.createdAt}-${idx}`}>
                        <TableCell className="align-top">{r.name}</TableCell>
                        <TableCell className="align-top">{r.guests}</TableCell>

                        {/* Preview controlado + “Ver” para abrir modal */}
                        <TableCell className="align-top">
                          {msg ? (
                            <div className="flex items-start gap-3">
                              <div className="min-w-0 flex-1">
                                <p
                                  className="
                                    whitespace-pre-line break-words overflow-hidden
                                    [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]
                                  "
                                >
                                  {msg}
                                </p>
                                {isLong && (
                                  <button
                                    type="button"
                                    className="mt-1 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
                                    onClick={() => {
                                      setSelected(r)
                                      setMsgOpen(true)
                                    }}
                                  >
                                    Ver mensagem completa
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell className="align-top">{formatWhen(r.createdAt)}</TableCell>

                        <TableCell className="align-top text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setConfirmKey(r.createdAt)
                              setConfirmOpen(true)
                            }}
                          >
                            Excluir
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>

                <TableCaption>{totalCaption}</TableCaption>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirma exclusão */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir confirmação?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmKey) await deleteRsvp(confirmKey)
                setConfirmOpen(false)
                setConfirmKey(null)
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal da mensagem completa */}
      <Dialog
        open={msgOpen}
        onOpenChange={(open) => {
          setMsgOpen(open)
          if (!open) setSelected(null)
        }}
      >
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Mensagem</DialogTitle>
            <DialogDescription>
              {selected ? (
                <>
                  <span className="font-medium">{selected.name}</span> • {selected.guests} acompanhante(s) •{' '}
                  {formatWhen(selected.createdAt)}
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[55vh] overflow-y-auto rounded-md border p-3">
            <p className="whitespace-pre-wrap break-words text-sm">
              {selected?.message?.trim() ? selected.message : '—'}
            </p>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setMsgOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.section>
  )
}
