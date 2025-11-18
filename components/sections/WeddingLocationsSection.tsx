'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Route as RouteIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type Props = { routeEmbedUrl: string }

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

export default function WeddingLocationsSection({ routeEmbedUrl }: Props) {
  const [activeView, setActiveView] = useState<'ceremony' | 'reception' | 'route'>('ceremony')

  return (
    <motion.section
      className="py-20 px-4 bg-secondary/20"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={fadeInUp}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Como chegar</h2>
          <p className="text-muted-foreground text-lg">Veja o local da cerimônia, da recepção e a rota entre eles</p>
        </div>

        <Card className="border-border/50 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="flex justify-center pt-6 md:pt-8">
              <div className="inline-flex items-center rounded-full bg-background/80 p-1 shadow-sm">
                <TabButton isActive={activeView === 'ceremony'} onClick={() => setActiveView('ceremony')}>
                  <span className="hidden sm:inline">Cerimônia</span>
                  <span className="sm:hidden">Igreja</span>
                </TabButton>
                <TabButton isActive={activeView === 'reception'} onClick={() => setActiveView('reception')}>
                  Recepção
                </TabButton>
                <TabButton isActive={activeView === 'route'} onClick={() => setActiveView('route')}>
                  <RouteIcon className="w-4 h-4 mr-1" />
                  Rota
                </TabButton>
              </div>
            </div>

            <div className="mt-6 md:mt-8">
              <AnimatePresence mode="wait">
                {activeView === 'ceremony' && (
                  <MapViewWrapper key="ceremony">
                    <div className="aspect-video w-full bg-muted">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.2847!2d-38.4847!3d-3.8167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM8KwNDknMDAuMSJTIDM4wrAyOScwNC45Ilc!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Localização do Casamento"
                      />
                    </div>
                    <div className="p-6 md:p-8 text-center">
                      <h3 className="font-serif text-2xl mb-4 text-foreground">Igreja de São Francisco de Assis</h3>
                      <p className="text-lg text-foreground/80 leading-relaxed">
                        R. Prof. Paulo Maria de Aragão, 130
                        <br />
                        Messejana, Fortaleza - CE
                      </p>
                      <Button asChild className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <a href="https://maps.app.goo.gl/CvzLtMuiCGNdKFjH8" target="_blank" rel="noopener noreferrer">
                          <MapPin className="w-4 h-4 mr-2" />
                          Abrir no Google Maps
                        </a>
                      </Button>
                    </div>
                  </MapViewWrapper>
                )}

                {activeView === 'reception' && (
                  <MapViewWrapper key="reception">
                    <div className="aspect-video w-full bg-muted">
                      <iframe
                        src="https://www.google.com/maps?q=Espaco+Infinity+R.+Geraldo+Barros+de+Oliveira,+51+-+Guajeru,+Fortaleza+-+CE,+60843-080&output=embed"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Localização da Recepção"
                      />
                    </div>
                    <div className="p-6 md:p-8 text-center">
                      <h3 className="font-serif text-2xl mb-4 text-foreground">Espaço Infinity</h3>
                      <p className="text-lg text-foreground/80 leading-relaxed">
                        R. Geraldo Barros de Oliveira, 51
                        <br />
                        Guajerú, Fortaleza - CE, 60843-080
                      </p>
                      <Button asChild className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <a href="https://maps.app.goo.gl/jCmWxFEg8ieJXtzK8" target="_blank" rel="noopener noreferrer">
                          <MapPin className="w-4 h-4 mr-2" />
                          Abrir no Google Maps
                        </a>
                      </Button>
                      <Button asChild className="mt-3 w-full md:hidden" variant="outline">
                        <a href="https://waze.com/ul?q=Espaco%20Infinity%20Fortaleza%20CE&navigate=yes" target="_blank" rel="noopener noreferrer">
                          <MapPin className="w-4 h-4 mr-2" />
                          Abrir no Waze
                        </a>
                      </Button>
                    </div>
                  </MapViewWrapper>
                )}

                {activeView === 'route' && (
                  <MapViewWrapper key="route">
                    <div className="aspect-video w-full bg-muted">
                      <iframe
                        src={routeEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Rota entre cerimônia e recepção"
                      />
                    </div>
                    <div className="p-6 md:p-8">
                      <div className="text-center mb-6">
                        <h3 className="font-serif text-2xl mb-2 text-foreground">Rota: Igreja ➝ Espaço Infinity</h3>
                        <p className="text-lg text-foreground/80 leading-relaxed">A recepção fica bem pertinho da igreja. Veja a rota e siga tranquilamente após a cerimônia.</p>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-6 mb-6">
                        <StepCard title="Cerimônia" subtitle="Igreja de São Francisco de Assis" description="Chegue com antecedência para se acomodar com calma." align="right" />
                        <div className="hidden md:flex flex-col items-center justify-center">
                          <div className="w-10 h-10 rounded-full border border-primary flex items-center justify-center mb-1">
                            <RouteIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="w-px h-14 bg-border" />
                        </div>
                        <StepCard title="Recepção" subtitle="Espaço Infinity" description="Após a cerimônia, seguimos juntos para comemorar." align="left" />
                      </div>
                      <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 text-center">
                        <Button asChild className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                          <a
                            href="https://www.google.com/maps/dir/?api=1&origin=Igreja+de+São+Francisco+de+Assis,+Messejana,+Fortaleza+-+CE&destination=Espaço+Infinity,+Fortaleza+-+CE&travelmode=driving"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <RouteIcon className="w-4 h-4 mr-2" />
                            Ver rota no Google Maps
                          </a>
                        </Button>
                        <Button asChild variant="outline" className="w-full md:w-auto md:hidden">
                          <a href="https://waze.com/ul?q=Espaco%20Infinity%20Fortaleza%20CE&navigate=yes" target="_blank" rel="noopener noreferrer">
                            <RouteIcon className="w-4 h-4 mr-2" />
                            Abrir rota no Waze
                          </a>
                        </Button>
                      </div>
                    </div>
                  </MapViewWrapper>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  )
}

function TabButton({ isActive, onClick, children }: { isActive: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 text-sm rounded-full flex items-center gap-1 transition-all ${
        isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

function MapViewWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
      className="flex flex-col"
    >
      {children}
    </motion.div>
  )
}

function StepCard({ title, subtitle, description, align = 'left' }: { title: string; subtitle: string; description: string; align?: 'left' | 'right' }) {
  return (
    <div className={`flex-1 max-w-xs mx-auto text-center ${align === 'left' ? 'md:text-left' : 'md:text-right'}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">{title}</p>
      <p className="font-medium text-foreground mb-1">{subtitle}</p>
      <p className="text-sm text-foreground/70">{description}</p>
    </div>
  )
}