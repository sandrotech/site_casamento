'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

type Gift = {
  id: number
  name: string
  image: string
  claimed: boolean
  claimedBy?: string
  claimedByPhoto?: string
}

export default function GiftsAdminPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<Gift[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '' })
  const [fileCreate, setFileCreate] = useState<File | null>(null)
  const [uploads, setUploads] = useState<Record<number, File | null>>({})
  const [fileCreateKey, setFileCreateKey] = useState(0)
  const [rowKeys, setRowKeys] = useState<Record<number, number>>({})

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/gifts')
      const json = await res.json()
      setItems(Array.isArray(json) ? json : [])
    } finally {
      setLoading(false)
    }
  }

  async function createGift() {
    if (!form.name.trim()) {
      toast({ title: 'Nome obrigatório' })
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      if (fileCreate) fd.append('image', fileCreate)
      const res = await fetch('/api/gifts', { method: 'POST', body: fd })
      if (res.ok) {
        setForm({ name: '' })
        setFileCreate(null)
        setFileCreateKey((k) => k + 1)
        await load()
        toast({ title: 'Presente cadastrado' })
      } else {
        toast({ title: 'Erro ao cadastrar' })
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateGift(id: number, patch: Partial<Gift>, file?: File | null) {
    setLoading(true)
    try {
      const useForm = file && file.size > 0
      let res: Response
      if (useForm) {
        const fd = new FormData()
        if (patch.name) fd.append('name', patch.name)
        fd.append('image', file as File)
        res = await fetch(`/api/gifts/${id}`, { method: 'PUT', body: fd })
      } else {
        res = await fetch(`/api/gifts/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        })
      }
      if (res.ok) {
        await load()
        setUploads((u) => ({ ...u, [id]: null }))
        setRowKeys((rk) => ({ ...rk, [id]: (rk[id] || 0) + 1 }))
        toast({ title: 'Presente atualizado' })
      } else {
        toast({ title: 'Erro ao atualizar' })
      }
    } finally {
      setLoading(false)
    }
  }

  async function deleteGift(id: number) {
    setLoading(true)
    try {
      const res = await fetch(`/api/gifts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await load()
        toast({ title: 'Presente removido' })
      } else {
        const j = await res.json().catch(() => ({}))
        if (res.status === 409 || j?.error === 'claimed') {
          toast({ title: 'Não permitido', description: 'Este presente já foi escolhido' })
        } else {
          toast({ title: 'Erro ao remover' })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-2">Cadastro de Presentes</h2>
          <p className="text-muted-foreground">Gerencie os presentes exibidos na lista</p>
        </div>

        <Card className="border-border/50 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gift-name">Nome</Label>
                <Input id="gift-name" value={form.name} onChange={(e) => setForm({ name: e.target.value })} placeholder="Ex: Jogo de Panelas" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gift-image">Imagem</Label>
                <Input key={fileCreateKey} id="gift-image" type="file" accept="image/*" onChange={(e) => setFileCreate(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={createGift} disabled={loading} className="bg-primary text-primary-foreground">{loading ? 'Salvando...' : 'Cadastrar'}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-end mb-3">
              <Button variant="outline" onClick={load} disabled={loading}>{loading ? 'Atualizando...' : 'Atualizar'}</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="max-w-[240px]">
                      <Input value={g.name} onChange={(e) => setItems((prev) => prev.map((it) => it.id === g.id ? { ...it, name: e.target.value } : it))} />
                    </TableCell>
                    <TableCell className="max-w-[260px]">
                      <Input key={rowKeys[g.id] || 0} type="file" accept="image/*" onChange={(e) => setUploads((u) => ({ ...u, [g.id]: e.target.files?.[0] || null }))} />
                    </TableCell>
                    <TableCell>{g.claimed ? 'Escolhido' : 'Disponível'}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" onClick={() => updateGift(g.id, { name: g.name }, uploads[g.id] || null)}>Salvar</Button>
                      <Button variant="destructive" disabled={g.claimed} onClick={() => deleteGift(g.id)}>Excluir</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>{items.length === 0 ? 'Nenhum presente cadastrado' : `${items.length} presentes`}</TableCaption>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}