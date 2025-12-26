'use client'

import React, { useMemo, useState } from 'react'
import { GiftIcon, Heart, Search, CheckCircle2, MousePointer2, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Gift = {
  id: number
  name: string
  image: string
  claimed: boolean
  claimedBy?: string
  claimedByPhoto?: string
  category?: string
}

type Props = {
  gifts: Gift[]
  onClaim: (gift: Gift) => void
  onPix?: (gift: Gift) => void
}

// removed animations for immediate render

function normalizeText(v: string) {
  return (v || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export default function GiftListSection({ gifts, onClaim, onPix }: Props) {
  function withBase(src: string) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
    if (!base) return src
    if (/^https?:\/\//.test(src)) return src
    if (src.startsWith(base)) return src
    if (src.startsWith('/')) return `${base}${src}`
    return `${base}/${src}`
  }

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const g of gifts) set.add((g.category || 'Outros').trim() || 'Outros')
    const arr = Array.from(set)

    const preferred = ['Cozinha', 'Banheiro', 'Lavanderia', 'Sala e Quarto', 'Outros']
    arr.sort((a, b) => {
      const ia = preferred.indexOf(a)
      const ib = preferred.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })

    return ['Todos', ...arr]
  }, [gifts])

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true)
  const [query, setQuery] = useState<string>('')

  const [openConfirm, setOpenConfirm] = useState(false)
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)

  const countsByCategory = useMemo(() => {
    const map = new Map<string, { total: number; available: number }>()
    for (const g of gifts) {
      const c = (g.category || 'Outros').trim() || 'Outros'
      const cur = map.get(c) || { total: 0, available: 0 }
      cur.total += 1
      if (!g.claimed) cur.available += 1
      map.set(c, cur)
    }

    const all = { total: gifts.length, available: gifts.filter((g) => !g.claimed).length }
    return { map, all }
  }, [gifts])

  const filtered = useMemo(() => {
    const q = normalizeText(query)
    return gifts
      .slice()
      .sort((a, b) => Number(a.claimed) - Number(b.claimed))
      .filter((g) => {
        const cat = (g.category || 'Outros').trim() || 'Outros'
        if (selectedCategory !== 'Todos' && cat !== selectedCategory) return false
        if (onlyAvailable && g.claimed) return false
        if (!q) return true
        return normalizeText(g.name).includes(q) || normalizeText(cat).includes(q)
      })
  }, [gifts, selectedCategory, onlyAvailable, query])

  const openPick = (gift: Gift) => {
    if (gift.claimed) return
    setSelectedGift(gift)
    setOpenConfirm(true)
  }

  const confirmPick = () => {
    if (!selectedGift) return
    onClaim(selectedGift)
    setOpenConfirm(false)
    setSelectedGift(null)
  }

  return (
    <section
      className="py-16 px-4 bg-secondary/25 border-t border-b border-border/50"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 border border-border/60">
            <GiftIcon className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Lista de Presentes</span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl text-foreground mt-4">
            Escolha um presente aqui 👇
          </h2>

          <p className="text-muted-foreground text-lg mt-3 max-w-2xl mx-auto">
            Você <b>não precisa clicar em nenhuma “seção”</b>.
            <br />
            É só <b>rolar a lista</b> e tocar no botão verde <b>“QUERO DAR ESTE”</b>.
          </p>
        </div>

        <Card className="mb-8 border-border/60 shadow-sm">
          <CardContent className="p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <MousePointer2 className="w-6 h-6 text-primary" />

                </div>
                <div>
                  <p className="font-semibold text-foreground">1) Veja a lista</p>
                  <p className="text-sm text-muted-foreground">Os presentes já estão aqui embaixo.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">2) Toque no botão verde</p>
                  <p className="text-sm text-muted-foreground">“QUERO DAR ESTE” reserva o presente.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">3) Pronto ✅</p>
                  <p className="text-sm text-muted-foreground">Se quiser, também dá para contribuir via PIX.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-border/60">
          <CardContent className="p-4 md:p-5">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 w-full lg:max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Digite para procurar (ex: toalha, cozinha...)"
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    aria-label="Procurar presente"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Mostrar só disponíveis</span>
                  <button
                    type="button"
                    onClick={() => setOnlyAvailable((v) => !v)}
                    className={[
                      'ml-2 w-12 h-7 rounded-full transition-colors border',
                      onlyAvailable ? 'bg-primary border-primary' : 'bg-muted border-border',
                    ].join(' ')}
                    aria-pressed={onlyAvailable}
                    aria-label="Mostrar só disponíveis"
                  >
                    <span
                      className={[
                        'block w-6 h-6 bg-background rounded-full transition-transform translate-y-[1px]',
                        onlyAvailable ? 'translate-x-5' : 'translate-x-1',
                      ].join(' ')}
                    />
                  </button>
                </div>

                {/* ✅ AQUI estava o </ quebrado */}
                <div className="text-sm text-muted-foreground">
                  <b className="text-foreground">{filtered.length}</b> itens na tela
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => {
                const active = selectedCategory === c
                const counts =
                  c === 'Todos'
                    ? countsByCategory.all
                    : countsByCategory.map.get(c) || { total: 0, available: 0 }

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCategory(c)}
                    className={[
                      'px-4 py-2 rounded-full border transition',
                      active
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:bg-muted/40',
                    ].join(' ')}
                  >
                    <span className="font-medium">{c}</span>
                    <span
                      className={[
                        'ml-2 text-xs',
                        active ? 'opacity-90' : 'text-muted-foreground',
                      ].join(' ')}
                    >
                      ({onlyAvailable ? counts.available : counts.total})
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <ul className="space-y-4">
          {filtered.map((gift, index) => {
            const cat = (gift.category || 'Outros').trim() || 'Outros'
            const imgSrc = withBase(gift.image || '/placeholder.svg')

            return (
              <li
                key={gift.id}
              >
                <Card className="border-border/60 shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-44 w-full aspect-[16/10] md:aspect-square bg-muted overflow-hidden relative">
                        <img src={imgSrc} alt={gift.name} className="w-full h-full object-cover" loading="lazy" />

                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="rounded-full px-3 py-1">
                            {cat}
                          </Badge>
                        </div>

                        {gift.claimed && (
                          <div className="absolute inset-0 bg-primary/75 flex items-center justify-center">
                            <div className="text-center text-primary-foreground px-3">
                              <Heart className="w-7 h-7 mx-auto mb-1 fill-current" />
                              <p className="font-semibold">Já escolhido</p>
                              {gift.claimedBy && (
                                <p className="text-xs opacity-95 mt-1">por {gift.claimedBy}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-4 md:p-5">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-xl md:text-2xl font-serif text-foreground leading-snug">
                              {gift.name}
                            </h3>

                            {!gift.claimed ? (
                              <Badge className="rounded-full px-3 py-1 bg-emerald-600 text-white border-0">
                                Disponível
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="rounded-full px-3 py-1">
                                Indisponível
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            Para escolher: toque no botão verde abaixo.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                            <Button
                              onClick={() => openPick(gift)}
                              disabled={gift.claimed}
                              className="w-full py-7 text-base md:text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:hover:bg-emerald-600"
                            >
                              {gift.claimed ? 'JÁ FOI ESCOLHIDO' : '✅ QUERO DAR ESTE'}
                            </Button>

                            {onPix ? (
                              <Button
                                onClick={() => onPix(gift)}
                                variant="outline"
                                disabled={gift.claimed}
                                className="w-full py-7 text-base md:text-lg"
                              >
                                💸 Prefiro contribuir via PIX
                              </Button>
                            ) : (
                              <div className="hidden md:block" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            )
          })}

          {filtered.length === 0 && (
            <Card className="border-border/60">
              <CardContent className="p-6 text-center">
                <p className="text-foreground font-semibold">Nenhum presente encontrado 😕</p>
                <p className="text-muted-foreground mt-1">
                  Tente apagar a busca ou trocar a categoria.
                </p>
                <div className="mt-4 flex gap-2 justify-center flex-wrap">
                  <Button variant="outline" onClick={() => setQuery('')}>
                    Limpar busca
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedCategory('Todos')}>
                    Ver todos
                  </Button>
                  <Button variant="outline" onClick={() => setOnlyAvailable(false)}>
                    Mostrar também indisponíveis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </ul>

        <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Confirmar escolha</DialogTitle>
              <DialogDescription>
                Você está prestes a escolher este presente. Se estiver certo, toque em <b>Confirmar</b>.
              </DialogDescription>
            </DialogHeader>

            {selectedGift && (
              <div className="flex gap-3 items-center border border-border rounded-xl p-3 bg-muted/20">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={withBase(selectedGift.image || '/placeholder.svg')}
                    alt={selectedGift.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{selectedGift.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Categoria: {(selectedGift.category || 'Outros').trim() || 'Outros'}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => setOpenConfirm(false)}>
                Voltar
              </Button>
              <Button onClick={confirmPick} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                ✅ Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
