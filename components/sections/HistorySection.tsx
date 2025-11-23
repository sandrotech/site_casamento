'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

export default function HistorySection() {
  return (
    <motion.section
      className="py-20 px-4 bg-background"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Heart className="w-12 h-12 mx-auto mb-4 text-primary fill-primary" />
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">A Nossa História</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            De um encontro inesperado a uma promessa eterna. Cada capítulo nos trouxe até aqui.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <p className="text-foreground/80 leading-relaxed">
              Alessandro e Lorena se conheceram em um encontro simples entre amigos, daqueles em que ninguém imagina que a vida vai mudar para sempre.
              Entre risadas tímidas e conversas que pareciam não ter fim, nasceu uma amizade que em pouco tempo virou algo maior.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Vieram os sorvetes depois das missas, as mensagens de bom dia,boa noite... os planos para o futuro e, principalmente, a certeza de que Deus
              estava guiando cada passo. Em meio a desafios, mudanças e conquistas, o amor só cresceu – maduro, paciente e cheio de cuidado.
            </p>

            <div className="space-y-5 border-l border-border pl-5">
              <div className="relative">
                <span className="absolute -left-[11px] top-1 w-2.5 h-2.5 rounded-full bg-primary" />
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">• O encontro</p>
                <p className="text-sm text-foreground/80 mt-1">
                  Um grupo de amigos, uma conversa despretensiosa e o primeiro olhar que mudou tudo.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[11px] top-1 w-2.5 h-2.5 rounded-full bg-primary/80" />
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">• Os planos</p>
                <p className="text-sm text-foreground/80 mt-1">
                  Entre sonhos compartilhados, veio a certeza: queriam construir uma vida juntos, com propósito e fé.
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[11px] top-1 w-2.5 h-2.5 rounded-full bg-primary/60" />
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">• O pedido</p>
                <p className="text-sm text-foreground/80 mt-1">
                  Diante de Deus, da família e de muitas muitas pessoas em meio a uma missa(Umas 300 ou mais pessoas), um “sim” que mudou para sempre o capítulo da história.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-lg bg-muted aspect-[4/3]"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              <img src="/fotos/foto2.jpeg" alt="Alessandro e Lorena sorrindo juntos" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-sm text-primary-foreground">
                <p className="font-medium drop-shadow">O começo de tudo</p>
                <p className="text-xs opacity-90 drop-shadow">Quando o coração entendeu o que os olhos já sabiam.</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div className="rounded-2xl overflow-hidden bg-muted aspect-[4/5]" whileHover={{ y: -6, scale: 1.01 }} transition={{ duration: 0.35 }}>
                <img src="/fotos/foto3.jpeg" alt="Pré-wedding 1" className="w-full h-full object-cover" />
              </motion.div>
              <motion.div className="rounded-2xl overflow-hidden bg-muted aspect-[4/5]" whileHover={{ y: -6, scale: 1.01 }} transition={{ duration: 0.35, delay: 0.05 }}>
                <img src="/fotos/foto4.jpeg" alt="Pré-wedding 2" className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-sm tracking-[0.25em] uppercase text-center text-muted-foreground mb-4">Pedido de Casamento</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <motion.div className="aspect-square rounded-xl overflow-hidden bg-muted" whileHover={{ scale: 1.03 }} transition={{ duration: 0.25 }}>
              <img src="/fotos/foto1.jpeg" alt="Pedido de casamento 1" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div className="aspect-square rounded-xl overflow-hidden bg-muted" whileHover={{ scale: 1.03 }} transition={{ duration: 0.25, delay: 0.03 }}>
              <img src="/fotos/foto5.jpeg" alt="Pedido de casamento 2" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div className="aspect-square rounded-xl overflow-hidden bg-muted" whileHover={{ scale: 1.03 }} transition={{ duration: 0.25, delay: 0.06 }}>
              <img src="/fotos/foto6.jpeg" alt="Pedido de casamento 3" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div className="aspect-square rounded-xl overflow-hidden bg-muted" whileHover={{ scale: 1.03 }} transition={{ duration: 0.25, delay: 0.09 }}>
              <img src="/fotos/foto7.jpeg" alt="Pedido de casamento 4" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
