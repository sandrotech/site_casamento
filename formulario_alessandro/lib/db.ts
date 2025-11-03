import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "lib", "respostas.json");

export function salvarResposta(data: any) {
    const respostas = lerRespostas();
    respostas.push({ ...data, dataEnvio: new Date().toISOString() });
    fs.writeFileSync(filePath, JSON.stringify(respostas, null, 2));
}

export function lerRespostas() {
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
