"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const schema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  telefone: z.string().min(8),
  idade: z.coerce.number().min(10),
  genero: z.string(),
  filhos: z.string(),
  estado: z.string(),
  trabalha: z.string(),
  formacao: z.string(),
  equipamentos: z.string(),
  disponibilidadeAulas: z.string(),
  horarioAulas: z.string(),
  aprendizado: z.string().optional(),
  nivel: z.string(),
  motivacao: z.string().min(10),
  disponibilidade: z.string(),
  salario: z.string(),
  linkedin: z.string().optional(),
});

export default function Page() {
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<null | { tipo: "ok" | "erro"; texto: string }>(null);
  const form = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: any) => {
    setEnviando(true);
    setMensagem(null);
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setMensagem({ tipo: "ok", texto: "✅ Candidatura enviada com sucesso!" });
      form.reset();
    } catch {
      setMensagem({ tipo: "erro", texto: "❌ Erro ao enviar. Tente novamente." });
    } finally {
      setEnviando(false);
      setTimeout(() => setMensagem(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-2 text-gray-800"
        >
          Vaga para Iniciante em Programação
        </motion.h1>

        <p className="text-center text-gray-600 mb-6">
          💻 100% online, descontraído e por demanda.
          As aulas acontecem junto ao desenvolvimento de projetos reais — você aprende enquanto faz!
        </p>

        {mensagem && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center p-3 mb-4 rounded-md ${mensagem.tipo === "ok" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
          >
            {mensagem.texto}
          </motion.div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Accordion type="single" collapsible defaultValue="pessoal">
            {/* 🧑‍💻 INFORMAÇÕES PESSOAIS */}
            <AccordionItem value="pessoal">
              <AccordionTrigger>🧑‍💻 Informações Pessoais</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <Label>Nome completo</Label>
                <Input {...form.register("nome")} required />

                <Label>Email</Label>
                <Input type="email" {...form.register("email")} required />

                <Label>Telefone / WhatsApp</Label>
                <Input {...form.register("telefone")} required />

                <Label>Idade</Label>
                <Input type="number" {...form.register("idade")} required />

                <Label>Gênero</Label>
                <Select onValueChange={(v) => form.setValue("genero", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mulher">Mulher</SelectItem>
                    <SelectItem value="Homem">Homem</SelectItem>
                    <SelectItem value="Outro">Prefiro não dizer</SelectItem>
                  </SelectContent>
                </Select>

                <Label>Você tem filhos?</Label>
                <Select onValueChange={(v) => form.setValue("filhos", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>

                <Label>Cidade / Estado</Label>
                <Input {...form.register("estado")} placeholder="Ex: Recife - PE" required />
              </AccordionContent>
            </AccordionItem>

            {/* 💼 SITUAÇÃO ATUAL */}
            <AccordionItem value="situacao">
              <AccordionTrigger>💼 Situação Atual</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <Label>Atualmente você trabalha?</Label>
                <Select onValueChange={(v) => form.setValue("trabalha", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim, período integral">Sim, período integral</SelectItem>
                    <SelectItem value="Sim, meio período">Sim, meio período</SelectItem>
                    <SelectItem value="Não estou trabalhando">Não estou trabalhando</SelectItem>
                  </SelectContent>
                </Select>

                <Label>Formação (escolaridade atual)</Label>
                <Select onValueChange={(v) => form.setValue("formacao", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ensino fundamental">Ensino fundamental</SelectItem>
                    <SelectItem value="Ensino médio completo">Ensino médio completo</SelectItem>
                    <SelectItem value="Curso técnico">Curso técnico</SelectItem>
                    <SelectItem value="Ensino superior">Ensino superior</SelectItem>
                  </SelectContent>
                </Select>

                <Label>Você possui computador ou notebook próprio?</Label>
                <Select onValueChange={(v) => form.setValue("equipamentos", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim, pessoal">Sim, tenho um computador pessoal</SelectItem>
                    <SelectItem value="Compartilhado">Uso um compartilhado</SelectItem>
                    <SelectItem value="Não">Não possuo computador</SelectItem>
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>

            {/* 📚 AULAS E DESENVOLVIMENTO */}
            <AccordionItem value="aulas">
              <AccordionTrigger>📚 Aulas e Desenvolvimento</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <Label>Disponibilidade para aulas práticas (online)</Label>
                <Select onValueChange={(v) => form.setValue("disponibilidadeAulas", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim, com certeza">Sim, com certeza!</SelectItem>
                    <SelectItem value="Depende do horário">Sim, dependendo dos horários</SelectItem>
                    <SelectItem value="Talvez">Talvez</SelectItem>
                    <SelectItem value="Não tenho disponibilidade">Não tenho disponibilidade</SelectItem>
                  </SelectContent>
                </Select>

                <Label>Melhores horários</Label>
                <Select onValueChange={(v) => form.setValue("horarioAulas", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manhã">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Noite">Noite</SelectItem>
                    <SelectItem value="Flexível">Horário flexível</SelectItem>
                  </SelectContent>
                </Select>

                <Label>Áreas de interesse</Label>
                <Textarea {...form.register("aprendizado")} placeholder="Ex: Lógica, Front-end, Python..." />
              </AccordionContent>
            </AccordionItem>

            {/* 👨‍💻 PERFIL TÉCNICO */}
            <AccordionItem value="perfil">
              <AccordionTrigger>👨‍💻 Perfil Técnico e Motivacional</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <Label>Nível atual de conhecimento</Label>
                <Select onValueChange={(v) => form.setValue("nivel", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Iniciante total">Sou iniciante total</SelectItem>
                    <SelectItem value="Já fiz alguns cursos">Já fiz alguns cursos</SelectItem>
                    <SelectItem value="Já programei um pouco">Já programei um pouco</SelectItem>
                  </SelectContent>
                </Select>

                <Label>Por que quer participar?</Label>
                <Textarea {...form.register("motivacao")} required />

                <Label>Quantas horas por semana pode se dedicar?</Label>
                <Input {...form.register("disponibilidade")} placeholder="Ex: 10h, 20h..." required />

                <Label>Você entende que é uma vaga inicial com pagamento simbólico? Qual sua expectativa?</Label>
                <Textarea {...form.register("salario")} required />

                <Label>LinkedIn, GitHub ou portfólio (opcional)</Label>
                <Input {...form.register("linkedin")} placeholder="Cole aqui o link, se tiver" />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" disabled={enviando} className="w-full mt-4">
              {enviando ? "Enviando..." : "Enviar Candidatura"}
            </Button>
          </motion.div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          © 2025 - Oportunidade de aprendizado em programação |{" "}
          <a
            href="https://portfolio.alessandrosantos.dev/"
            target="_blank"
            className="text-blue-600 font-medium"
          >
            Alessandro Santos
          </a>
        </p>
      </motion.div>
    </div>
  );
}
