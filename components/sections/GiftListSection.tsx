'use client'

import { motion } from 'framer-motion'
import { GiftIcon, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

export default function GiftListSection({ gifts, onClaim, onPix }: Props) {
  const categories = ['Cozinha', 'Banheiro', 'Lavanderia', 'Quarto', 'Sala']
  const groups = categories
    .map((c) => ({ label: c, items: gifts.filter((g) => (g.category || '') === c) }))
    .filter((g) => g.items.length > 0)
  const others = gifts.filter((g) => !g.category || !categories.includes(g.category))
  const tabs = others.length > 0 ? [...groups, { label: 'Outros', items: others }] : groups
  const initialTab = tabs.find((t) => t.label === 'Cozinha')?.label ?? tabs[0]?.label
  return (
    <motion.section
      className="py-24 px-4 bg-secondary/25 border-t border-b border-border/50"
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
        <Tabs defaultValue={initialTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="bg-background/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm shadow-lg ring-1 ring-border rounded-full p-1 h-11">
              {tabs.map((t) => (
                <TabsTrigger key={t.label} value={t.label} className="rounded-full px-3 py-2 transition-all data-[state=active]:shadow-md data-[state=active]:scale-[1.02] hover:scale-[1.01]">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {tabs.map((t) => (
            <TabsContent key={t.label} value={t.label}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {t.items.map((gift, index) => (
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
                          <>
                            <div className="absolute inset-0 bg-primary/80 flex items-center justify-center">
                              <div className="text-center text-primary-foreground p-4">
                                <Heart className="w-8 h-8 mx-auto mb-2 fill-current" />
                                <p className="font-semibold">Já foi escolhido</p>
                                {gift.claimedBy && <p className="text-sm mt-1">por {gift.claimedBy}</p>}
                              </div>
                            </div>
                            {gift.claimedByPhoto ? (
                              <motion.div
                                className="absolute z-10 bottom-3 right-3 rounded-full ring-2 ring-background/80 shadow-lg"
                                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                              >
                                <img
                                  src={gift.claimedByPhoto}
                                  alt={gift.claimedBy || gift.name}
                                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
                                />
                              </motion.div>
                            ) : (
                              <motion.div
                                className="absolute z-10 bottom-3 right-3 w-16 h-16 md:w-20 md:h-20 rounded-full bg-background/90 ring-2 ring-background/80 shadow-lg flex items-center justify-center"
                                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Heart className="w-7 h-7 text-primary" />
                              </motion.div>
                            )}
                          </>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-serif text-xl mb-4 text-center text-foreground">{gift.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Button onClick={() => onClaim(gift)} disabled={gift.claimed} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50">
                            {gift.claimed ? 'Indisponível' : 'Vou dar este presente'}
                          </Button>
                          <Button onClick={() => onPix?.(gift)} variant="outline" className="w-full">
                            Contribuir via PIX
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </motion.section>
  )
}