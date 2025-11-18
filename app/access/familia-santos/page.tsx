'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

export default function AdminAccessPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pwd) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      })
      if (res.ok) {
        router.push('/painel/familia-santos-aurora')
      } else {
        toast({ title: 'Senha incorreta' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">Acesso ao Painel</h2>
          <p className="text-muted-foreground">Informe a senha para entrar</p>
        </div>
        <Card className="border-border/50 shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pwd">Senha</Label>
                <Input id="pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Digite a senha" />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">{loading ? 'Entrando...' : 'Entrar'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}