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

interface Supporter {
  name: string
  photo?: string
}

 

// Substitua essa constante pelo embed da ROTA gerado no Google Maps
// (Google Maps → Traçar rota → Compartilhar → Incorporar mapa)
const ROUTE_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d15923.621430071462!2d-38.4902650526007!3d-3.830478238292704!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x7c75aaa9eece75f%3A0xce4ca819141f8f6b!2sIgreja%20de%20S%C3%A3o%20Francisco%20de%20Assis%2C%20R.%20Prof.%20Paulo%20Maria%20de%20Arag%C3%A3o%2C%208%20-%20Messejana%2C%20Fortaleza%20-%20CE%2C%2060192-490!3m2!1d-3.8348309!2d-38.484510799999995!4m5!1s0x7c75aacdefc7323%3A0x98a8ecd7e281f15b!2sInfinity%20Festas%2C%20R.%20Geraldo%20Barros%20de%20Oliveira%2C%2051%20-%20Guajer%C3%BA%2C%20Fortaleza%20-%20CE%2C%2060843-080!3m2!1d-3.8354274!2d-38.477288699999995!5e0!3m2!1spt-PT!2sbr!4v1763301100400!5m2!1spt-PT!2sbr";

const PIX_KEY = "45585cb7-2069-4a3b-a53a-255eb3fa6a9b"


export default function WeddingPage() {
  const [selectedGift, setSelectedGift] = useState<{
    id: number
    name: string
    image: string
    claimed: boolean
    claimedBy?: string
    claimedByPhoto?: string
  } | null>(null)

  const [giftModalOpen, setGiftModalOpen] = useState(false)
  const [supportModalOpen, setSupportModalOpen] = useState(false)
  const [gifts, setGifts] = useState<{
    id: number
    name: string
    image: string
    claimed: boolean
    claimedBy?: string
    claimedByPhoto?: string
  }[]>([])

  async function loadGifts() {
    const res = await fetch("/api/gifts")
    const json = await res.json()
    setGifts(Array.isArray(json) ? json : [])
  }

  useEffect(() => {
    loadGifts()
  }, [])

  const [supporters, setSupporters] = useState<Supporter[]>([
    { name: "Maria Silva", photo: "/woman-portrait.png" },
    { name: "João Santos", photo: "/thoughtful-man-portrait.png" },
  ])

  const handleGiftClaim = (gift: (typeof gifts)[number]) => {
    setSelectedGift(gift)
    setGiftModalOpen(true)
  }

  const handleGiftSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = String(formData.get("name") || "")

    if (selectedGift) {
      await fetch(`/api/gifts/${selectedGift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimed: true, claimedBy: name }),
      })
      await loadGifts()
    }

    setGiftModalOpen(false)
    setSelectedGift(null)
  }

  const handleSupportSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("supportName") as string

    setSupporters([...supporters, { name }])
    setSupportModalOpen(false)
  }

  return (
    <div className="min-h-screen">
      <HeaderHero />

      <HistorySection />



      <RsvpSection />


      <GiftListSection gifts={gifts} onClaim={handleGiftClaim} onPix={() => setSupportModalOpen(true)} />

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
          <p className="text-muted-foreground">Alessandro &amp; Lorena • 2025</p>
        </motion.div>
      </footer>

      {/* Gift Claim Modal */}
      <Dialog open={giftModalOpen} onOpenChange={setGiftModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Confirmar Presente</DialogTitle>
            <DialogDescription>Preencha seus dados para confirmar o presente: {selectedGift?.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGiftSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="giftName">Nome Completo</Label>
              <Input id="giftName" name="name" placeholder="Seu nome completo" required className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="giftPhoto">Foto (opcional)</Label>
              <Input id="giftPhoto" name="photo" type="file" accept="image/*" className="bg-background" />
              <p className="text-xs text-muted-foreground">Sua foto aparecerá ao lado do presente</p>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setGiftModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
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
          <form onSubmit={handleSupportSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supportName">Nome Completo</Label>
              <Input
                id="supportName"
                name="supportName"
                placeholder="Seu nome completo"
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt">Comprovante PIX</Label>
              <Input id="receipt" name="receipt" type="file" accept="image/*" required className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportPhoto">Sua Foto (opcional)</Label>
              <Input id="supportPhoto" name="supportPhoto" type="file" accept="image/*" className="bg-background" />
              <p className="text-xs text-muted-foreground">Sua foto aparecerá na lista de apoiadores</p>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setSupportModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                Enviar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
