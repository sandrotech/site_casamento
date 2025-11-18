'use client'

import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

export default function RsvpSection() {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') || '')
    const guests = Number(formData.get('guests') || 0)
    const message = String(formData.get('message') || '')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, guests, message }),
      })
      if (res.ok) {
        toast({ title: 'Presença confirmada', description: 'Obrigado por confirmar!' })
        form.reset()
      } else {
        toast({ title: 'Erro ao confirmar', description: 'Tente novamente mais tarde' })
      }
    } catch {
      toast({ title: 'Erro de rede', description: 'Verifique sua conexão' })
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <motion.section
      className="py-20 px-4"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={fadeInUp}
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Confirme sua Presença</h2>
          <p className="text-muted-foreground text-lg">Sua presença é o nosso maior presente</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardContent className="p-6 md:p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Nome Completo</Label>
                <Input id="name" name="name" placeholder="Seu nome" className="bg-background border-border" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests" className="text-base">Número de Acompanhantes</Label>
                <Input id="guests" name="guests" type="number" min="0" placeholder="0" className="bg-background border-border" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-base">Mensagem (opcional)</Label>
                <Textarea id="message" name="message" placeholder="Deixe uma mensagem carinhosa para os noivos" className="bg-background border-border min-h-[120px]" />
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6">
                {submitting ? 'Enviando...' : 'Confirmar Presença'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  )
}