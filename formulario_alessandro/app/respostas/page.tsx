"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Respostas() {
    const [senha, setSenha] = useState("");
    const [dados, setDados] = useState<any[]>([]);
    const [ok, setOk] = useState(false);

    const autenticar = async () => {
        if (senha === "zlAleeh1234@") {
            const data = await fetch("/api/respostas").then((r) => r.json());
            setDados(data);
            setOk(true);
        } else alert("Senha incorreta!");
    };

    if (!ok)
        return (
            <div className="max-w-md mx-auto mt-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Área Restrita</h2>
                <Input
                    type="password"
                    placeholder="Digite a senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                />
                <Button onClick={autenticar} className="mt-4 w-full">Entrar</Button>
            </div>
        );

    return (
        <div className="max-w-5xl mx-auto mt-10">
            <h1 className="text-3xl font-bold text-center mb-6">Respostas Recebidas</h1>
            {dados.map((r, i) => (
                <div key={i} className="border p-4 rounded-lg mb-4 bg-white shadow">
                    <p><b>Nome:</b> {r.nome}</p>
                    <p><b>Email:</b> {r.email}</p>
                    <p><b>Telefone:</b> {r.telefone}</p>
                    <p><b>Cidade:</b> {r.estado}</p>
                    <p><b>Motivação:</b> {r.motivacao}</p>
                    <p><b>Data:</b> {r.dataEnvio}</p>
                </div>
            ))}
        </div>
    );
}
