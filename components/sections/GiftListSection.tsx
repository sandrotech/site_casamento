'use client'

import { motion } from 'framer-motion'
import { GiftIcon, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Gift = {
  id: number
  name: string
  image: string
  claimed: boolean
  claimedBy?: string
  claimedByPhoto?: string
}

type Props = {
  gifts: Gift[]
  onClaim: (gift: Gift) => void
  onPix?: () => void
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

export default function GiftListSection({ gifts, onClaim, onPix }: Props) {
  return (
    <motion.section
      className="py-20 px-4 bg-secondary/20"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={fadeInUp}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <GiftIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Lista de Presentes</h2>
          <p className="text-muted-foreground text-lg">Escolha um presente especial para nós</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map((gift, index) => (
            <motion.div
              key={gift.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-border/50 shadow-md hover:shadow-xl transition-shadow">
                <div className="aspect-square relative overflow-hidden bg-muted">
                  <img src={gift.image || '/placeholder.svg'} alt={gift.name} className="w-full h-full object-cover" />
                  {gift.claimed && (
                    <div className="absolute inset-0 bg-primary/80 flex items-center justify-center">
                      <div className="text-center text-primary-foreground p-4">
                        <Heart className="w-8 h-8 mx-auto mb-2 fill-current" />
                        <p className="font-semibold">Já foi escolhido</p>
                        {gift.claimedBy && <p className="text-sm mt-1">por {gift.claimedBy}</p>}
                      </div>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl mb-4 text-center text-foreground">{gift.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button onClick={() => onClaim(gift)} disabled={gift.claimed} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50">
                      {gift.claimed ? 'Indisponível' : 'Vou dar este presente'}
                    </Button>
                    <Button onClick={onPix} variant="outline" className="w-full">
                      Contribuir via PIX
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}