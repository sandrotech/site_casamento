'use client'

import { motion } from 'framer-motion'
import { Heart, Upload } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Supporter = { name: string; photo?: string }

type Props = {
  supporters: Supporter[]
  pixKey: string
  onOpenSupportModal: () => void
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

export default function SupportSection({ supporters, pixKey, onOpenSupportModal }: Props) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pixKey)}`
  function withBase(src: string) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
    if (!base) return src
    if (/^https?:\/\//.test(src)) return src
    if (src.startsWith(base)) return src
    if (src.startsWith('/')) return `${base}${src}`
    return `${base}/${src}`
  }
  return (
    <motion.section
      id="support-section"
      className="py-20 px-4"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={fadeInUp}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Heart className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Apoios Especiais</h2>
          <p className="text-muted-foreground text-lg mb-8">Sua contribuição nos ajuda a começar nossa nova jornada</p>
        </div>

        <Card className="border-border/50 shadow-lg mb-8">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <p className="text-sm tracking-[0.25em] uppercase text-muted-foreground mb-1">Contribuição</p>
                  <p className="text-lg text-foreground font-medium">Chave PIX</p>
                </div>

                <div className="bg-muted/70 px-4 py-3 rounded-full flex items-center justify-between gap-3">
                  <p className="font-mono text-xs md:text-sm text-foreground/90 truncate">{pixKey}</p>
                  <Button size="sm" variant="outline" className="whitespace-nowrap text-xs md:text-sm" onClick={() => navigator.clipboard.writeText(pixKey)}>
                    Copiar
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">Você pode copiar a chave acima ou, se preferir, escanear o QR Code ao lado.</p>

                <Button onClick={onOpenSupportModal} className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground w-full md:w-auto">
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar Comprovante
                </Button>
              </div>

              <motion.div
                className="flex-shrink-0 rounded-2xl bg-background border border-border/60 p-3 shadow-sm"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <img src={qrUrl} alt="QR Code para pagamento via PIX" className="w-40 h-40 md:w-44 md:h-44 object-contain" />
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {supporters.length > 0 && (
          <div>
            <h3 className="font-serif text-2xl text-center mb-6 text-foreground">Nossos Apoiadores</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {supporters.map((supporter, index) => (
                <motion.div
                  key={`${supporter.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden bg-muted">
                    <div className="w-full h-full flex items-center justify-center bg-primary/20">
                      <Heart className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-foreground font-medium">{supporter.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  )
}
