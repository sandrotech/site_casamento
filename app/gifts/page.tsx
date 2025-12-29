'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { useRouter } from 'next/navigation'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

type Gift = {
  id: number
  name: string
  image: string
  claimed: boolean
  claimedBy?: string
  claimedByPhoto?: string
  category?: string
}

export default function GiftsAdminPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [items, setItems] = useState<Gift[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '' })
  const [fileCreate, setFileCreate] = useState<File | null>(null)
  const [uploads, setUploads] = useState<Record<number, File | null>>({})
  const [fileCreateKey, setFileCreateKey] = useState(0)
  const [rowKeys, setRowKeys] = useState<Record<number, number>>({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [fQuery, setFQuery] = useState('')
  const [fCategory, setFCategory] = useState('Todos')
  const [fStatus, setFStatus] = useState<'Todos' | 'Disponíveis' | 'Escolhidos'>('Todos')
  const [serverImages, setServerImages] = useState<string[]>([])
  const [selectedServerImageCreate, setSelectedServerImageCreate] = useState<string>('')
  const [selectedServerImages, setSelectedServerImages] = useState<Record<number, string | null>>({})

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
      let res: Response
      if (fileCreate) {
        const fd = new FormData()
        fd.append('name', form.name.trim())
        fd.append('image', fileCreate)
        res = await fetch('/api/gifts', { method: 'POST', body: fd })
      } else if (selectedServerImageCreate) {
        res = await fetch('/api/gifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name.trim(), image: selectedServerImageCreate, category: '' }),
        })
      } else {
        res = await fetch('/api/gifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name.trim(), image: '', category: '' }),
        })
      }
      if (res.ok) {
        setForm({ name: '' })
        setFileCreate(null)
        setFileCreateKey((k) => k + 1)
        setSelectedServerImageCreate('')
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
        toast({ title: 'Presente removido' })
        router.push('/painel/familia-santos-aurora')
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
      ; (async () => {
        try {
          const res = await fetch('/api/public-images')
          const json = await res.json()
          setServerImages(Array.isArray(json) ? json : [])
        } catch { }
      })()
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const g of items) set.add((g.category || 'Outros').trim() || 'Outros')
    const arr = Array.from(set)
    const preferred = ['Cozinha', 'Banheiro', 'Lavanderia', 'Sala e Quarto', 'Lua de mel', 'Outros']
    arr.sort((a, b) => {
      const ia = preferred.indexOf(a)
      const ib = preferred.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
    return ['Todos', ...arr]
  }, [items])

  function norm(v: string) {
    return (v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  }

  const filtered = useMemo(() => {
    const q = norm(fQuery)
    return items.filter((g) => {
      const cat = (g.category || 'Outros').trim() || 'Outros'
      if (fCategory !== 'Todos' && cat !== fCategory) return false
      if (fStatus === 'Disponíveis' && g.claimed) return false
      if (fStatus === 'Escolhidos' && !g.claimed) return false
      if (!q) return true
      return norm(g.name).includes(q) || norm(cat).includes(q)
    })
  }, [items, fQuery, fCategory, fStatus])

  function baseName(p: string) {
    const parts = (p || '').split('/')
    return parts[parts.length - 1] || p
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            asChild
            variant="outline"
            className="gap-2 px-3 py-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link href="/painel/familia-santos-aurora">
              <ChevronLeft className="w-4 h-4" />
              Voltar para gerência
            </Link>
          </Button>
        </div>
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
                <div className="text-xs text-muted-foreground">ou escolha uma imagem existente</div>
                <Select value={selectedServerImageCreate || undefined} onValueChange={(v) => setSelectedServerImageCreate(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar imagem existente" />
                  </SelectTrigger>
                  <SelectContent>
                    {serverImages.map((img) => (
                      <SelectItem key={img} value={img}>{baseName(img)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={createGift} disabled={loading} className="bg-primary text-primary-foreground">{loading ? 'Salvando...' : 'Cadastrar'}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 w-full md:max-w-sm">
                <Input
                  value={fQuery}
                  onChange={(e) => setFQuery(e.target.value)}
                  placeholder="Buscar por nome ou categoria"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={fCategory} onValueChange={setFCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={fStatus} onValueChange={(v) => setFStatus(v as typeof fStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Disponíveis">Disponíveis</SelectItem>
                    <SelectItem value="Escolhidos">Escolhidos</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={load} disabled={loading}>{loading ? 'Atualizando...' : 'Atualizar'}</Button>
              </div>
            </div>
            <div className="w-full overflow-x-auto">
              <Table className="w-full min-w-[960px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[240px]">Nome</TableHead>
                    <TableHead className="w-[320px]">Imagem</TableHead>
                    <TableHead className="w-[130px]">Status</TableHead>
                    <TableHead className="w-[240px]">Doador</TableHead>
                    <TableHead className="w-[220px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="min-w-[240px]">
                        <Input value={g.name} onChange={(e) => setItems((prev) => prev.map((it) => it.id === g.id ? { ...it, name: e.target.value } : it))} />
                      </TableCell>
                      <TableCell className="min-w-[320px]">
                        <div className="flex items-center gap-3">
                          {g.image ? (
                            <img src={(process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}${g.image}` : g.image)} alt={g.name} className="w-14 h-14 rounded-md object-cover border" />
                          ) : (
                            <div className="w-14 h-14 rounded-md border bg-muted" />
                          )}
                          <Input key={rowKeys[g.id] || 0} type="file" accept="image/*" onChange={(e) => setUploads((u) => ({ ...u, [g.id]: e.target.files?.[0] || null }))} />
                          <Select
                            value={selectedServerImages[g.id] || undefined}
                            onValueChange={(v) => {
                              setSelectedServerImages((prev) => ({ ...prev, [g.id]: v }))
                              updateGift(g.id, { image: v })
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Imagem existente" />
                            </SelectTrigger>
                            <SelectContent>
                              {serverImages.map((img) => (
                                <SelectItem key={img} value={img}>{baseName(img)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>{g.claimed ? 'Escolhido' : 'Disponível'}</TableCell>
                      <TableCell className="min-w-[240px] whitespace-normal break-words">
                        {g.claimedBy ? (
                          <div className="flex items-center gap-2">
                            {g.claimedByPhoto && (
                              <img src={g.claimedByPhoto} alt={g.claimedBy || 'Doador'} className="w-8 h-8 rounded-full object-cover border" />
                            )}
                            <span className="text-sm">{g.claimedBy}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[220px]">
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => updateGift(g.id, { name: g.name }, uploads[g.id] || null)}>Salvar</Button>
                          {g.claimed && (
                            <Button
                              variant="outline"
                              onClick={() => updateGift(g.id, { claimed: false })}
                            >
                              Liberar
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            disabled={g.claimed}
                            onClick={() => {
                              setConfirmId(g.id)
                              setConfirmOpen(true)
                            }}
                          >
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableCaption>{items.length === 0 ? 'Nenhum presente cadastrado' : `${items.length} presentes`}</TableCaption>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir presente?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmId != null) {
                  await deleteGift(confirmId)
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
    </section>
  )
}
