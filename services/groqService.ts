
import { VulnerabilityReport } from "../types.ts";
import { SYSTEM_INSTRUCTION, MOCK_REPORT } from "../constants.tsx";

export const analyzeVulnerabilities = async (rawData: string, targetUrl: string): Promise<VulnerabilityReport> => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey.trim() === "" || apiKey.includes("PLACEHOLDER")) {
        console.warn("⚠️ DEMO MODE: No Groq API key configured. Using mock data.");
        alert("🎭 MODO DEMO (Groq)\n\nNo hay API key de Groq configurada.\n\nObtén una gratis en: https://console.groq.com");

        await new Promise(resolve => setTimeout(resolve, 2000));
        return MOCK_REPORT;
    }

    try {
        const response = await fetch("/groq-api/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: SYSTEM_INSTRUCTION },
                    { role: "user", content: `URL OBJETIVO: ${targetUrl}\n\nTELEMETRÍA BRUTA:\n${rawData}` }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        if (!content) throw new Error("La IA no generó contenido.");

        return JSON.parse(content) as VulnerabilityReport;

    } catch (err: any) {
        console.error("Critical AI Error:", err);
        throw new Error(err.message || "Error de comunicación con Groq.");
    }
};
