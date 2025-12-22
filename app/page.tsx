"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import HeaderHero from "@/components/sections/HeaderHero"
import HistorySection from "@/components/sections/HistorySection"
import RsvpSection from "@/components/sections/RsvpSection"
import GiftListSection from "@/components/sections/GiftListSection"
import SupportSection from "@/components/sections/SupportSection"
import WeddingLocationsSection from "@/components/sections/WeddingLocationsSection"
import { useToast } from "@/hooks/use-toast"

interface Supporter {
  id: number
  name: string
  photo?: string
  receipt?: string
  createdAt?: string
}



// Substitua essa constante pelo embed da ROTA gerado no Google Maps
// (Google Maps → Traçar rota → Compartilhar → Incorporar mapa)
const ROUTE_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d15923.621430071462!2d-38.4902650526007!3d-3.830478238292704!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x7c75aaa9eece75f%3A0xce4ca819141f8f6b!2sIgreja%20de%20S%C3%A3o%20Francisco%20de%20Assis%2C%20R.%20Prof.%20Paulo%20Maria%20de%20Arag%C3%A3o%2C%208%20-%20Messejana%2C%20Fortaleza%20-%20CE%2C%2060192-490!3m2!1d-3.8348309!2d-38.484510799999995!4m5!1s0x7c75aacdefc7323%3A0x98a8ecd7e281f15b!2sInfinity%20Festas%2C%20R.%20Geraldo%20Barros%20de%20Oliveira%2C%2051%20-%20Guajer%C3%BA%2C%20Fortaleza%20-%20CE%2C%2060843-080!3m2!1d-3.8354274!2d-38.477288699999995!5e0!3m2!1spt-PT!2sbr!4v1763301100400!5m2!1spt-PT!2sbr";

const PIX_KEY = "45585cb7-2069-4a3b-a53a-255eb3fa6a9b"


export default function WeddingPage() {
  const { toast } = useToast()
  const EVENT_DATE = new Date("2026-01-17T15:00:00-03:00")
  const [countdown, setCountdown] = useState<{ d: number; h: number; m: number; s: number; over: boolean }>({ d: 0, h: 0, m: 0, s: 0, over: false })
  useEffect(() => {
    const calc = () => {
      const now = new Date().getTime()
      const target = EVENT_DATE.getTime()
      const diff = Math.max(0, target - now)
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown({ d, h, m, s, over: diff === 0 })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])
  const [selectedGift, setSelectedGift] = useState<{
    id: string
    name: string
    image: string
    claimed: boolean
    claimedBy?: string
    claimedByPhoto?: string
  } | null>(null)

  const [giftModalOpen, setGiftModalOpen] = useState(false)
  const [supportModalOpen, setSupportModalOpen] = useState(false)
  const [supportSelectedGiftId, setSupportSelectedGiftId] = useState<string | null>(null)
  const [gifts, setGifts] = useState<{
    id: string
    name: string
    image: string
    claimed: boolean
    claimedBy?: string
    claimedByPhoto?: string
    category?: string
  }[]>([])

  async function loadGifts() {
    const base = (process.env.NEXT_PUBLIC_URL || "").replace(/\/$/, "")
    const res = await fetch(`${base}/presentes/`)
    const json = await res.json().catch(() => [])
    const mapped = Array.isArray(json)
      ? json.map((gift: any, index: number) => {
        const path = String(gift?.imagem || "").trim()
        const full =
          /^https?:\/\//.test(path)
            ? path
            : path
              ? `${base}${path.startsWith("/") ? "" : "/"}${path}`
              : ""
        return {
          id: String(gift?.id || index),
          name: String(gift?.nome || ""),
          image: full,
          claimed: String(gift?.status || "").toLowerCase() !== "disponivel",
          claimedBy: gift?.doador ? String(gift.doador) : undefined,
          claimedByPhoto: undefined,
          category: String(gift?.categoria || gift?.secao || gift?.category || "").trim() || undefined,
        }
      })
      : []
    setGifts(mapped)
  }

  useEffect(() => {
    loadGifts()
    loadSupporters()
  }, [])

  const [supporters, setSupporters] = useState<Supporter[]>([])

  async function loadSupporters() {
    const res = await fetch("/api/supporters")
    const json = await res.json()
    setSupporters(Array.isArray(json) ? json : [])
  }

  const handleGiftClaim = (gift: (typeof gifts)[number]) => {
    setSelectedGift(gift)
    setGiftModalOpen(true)
  }

  const handleGiftSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = String(formData.get("name") || "")

    if (selectedGift) {
      const base = (process.env.NEXT_PUBLIC_URL || "").replace(/\/$/, "")
      const res = await fetch(`${base}/presentes/${selectedGift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doador: name }),
      })
      if (res.ok) {
        await loadGifts()
        toast({ title: "Presente confirmado em seu nome, obrigado!" })
      }
    }

    setGiftModalOpen(false)
    setSelectedGift(null)
  }

  const handleSupportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const fd = new FormData()
    fd.append("supportName", String(formData.get("supportName") || ""))
    const receipt = formData.get("receipt") as File | null
    if (receipt) fd.append("receipt", receipt)
    const res = await fetch("/api/supporters", { method: "POST", body: fd })
    if (res.ok) {
      const created = await res.json().catch(() => ({}))
      const giftIdStr = String(formData.get("giftId") || "")
      const giftId = giftIdStr ? giftIdStr : supportSelectedGiftId
      if (giftId) {
        const name = String(formData.get("supportName") || "")
        await fetch(`/api/gifts/${giftId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claimed: true, claimedBy: name }),
        })
        await loadGifts()
      }
      await loadSupporters()
      setSupportModalOpen(false)
      setSupportSelectedGiftId(null)
    }
  }

  return (
    <div className="min-h-screen">
      <HeaderHero />

      <motion.section
        className="px-4 py-12"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Contagem regressiva</p>
          <div className="flex items-center justify-center gap-3">
            <div className="bg-muted/70 ring-1 ring-border rounded-full px-4 py-3 shadow-sm">
              <span className="font-mono text-foreground text-lg">{String(countdown.d).padStart(2, "0")}d</span>
            </div>
            <div className="bg-muted/70 ring-1 ring-border rounded-full px-4 py-3 shadow-sm">
              <span className="font-mono text-foreground text-lg">{String(countdown.h).padStart(2, "0")}h</span>
            </div>
            <div className="bg-muted/70 ring-1 ring-border rounded-full px-4 py-3 shadow-sm">
              <span className="font-mono text-foreground text-lg">{String(countdown.m).padStart(2, "0")}m</span>
            </div>
            <div className="bg-muted/70 ring-1 ring-border rounded-full px-4 py-3 shadow-sm">
              <span className="font-mono text-foreground text-lg">{String(countdown.s).padStart(2, "0")}s</span>
            </div>
          </div>
        </div>
      </motion.section>

      <HistorySection />



      <RsvpSection />


      <GiftListSection gifts={gifts} onClaim={handleGiftClaim} onPix={(gift) => { setSupportSelectedGiftId(gift.id); setSupportModalOpen(true) }} />

      <SupportSection supporters={supporters} pixKey={PIX_KEY} onOpenSupportModal={() => setSupportModalOpen(true)} />

      {/* Seção de Local / Rota */}
      <WeddingLocationsSection routeEmbedUrl={ROUTE_EMBED_URL} />

      {/* Footer */}
      <footer className="py-12 px-4 text-center border-t border-border/50">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto space-y-4"
        >
          <Heart className="w-8 h-8 mx-auto text-primary fill-primary" />
          <p className="font-serif text-xl md:text-2xl text-foreground italic">
            &quot;O amor é paciente, o amor é bondoso&quot;
          </p>
          <p className="text-muted-foreground">Lorena &amp; Alessandro • 2026</p>
        </motion.div>
      </footer>

      {/* Gift Claim Modal */}
      <Dialog open={giftModalOpen} onOpenChange={setGiftModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Confirmar Presente</DialogTitle>
            <DialogDescription>Preencha seus dados para confirmar o presente: {selectedGift?.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGiftSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="giftName">Nome Completo</Label>
              <Input id="giftName" name="name" placeholder="Seu nome completo" required className="bg-background w-full" />
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <Button type="button" variant="outline" onClick={() => setGiftModalOpen(false)} className="w-full md:flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="w-full md:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                Confirmar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Support Modal */}
      <Dialog open={supportModalOpen} onOpenChange={setSupportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Enviar Comprovante</DialogTitle>
            <DialogDescription>Envie seu comprovante de PIX e deixe seu nome</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSupportSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supportName">Nome Completo</Label>
                <Input
                  id="supportName"
                  name="supportName"
                  placeholder="Seu nome completo"
                  required
                  className="bg-background w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receipt">Comprovante PIX</Label>
                <Input id="receipt" name="receipt" type="file" accept="image/*" required className="bg-background w-full" />
              </div>

            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <Button type="button" variant="outline" onClick={() => setSupportModalOpen(false)} className="w-full md:flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="w-full md:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                Enviar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
