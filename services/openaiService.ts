
import { VulnerabilityReport } from "../types.ts";
import { SYSTEM_INSTRUCTION, MOCK_REPORT } from "../constants.tsx";

export const analyzeVulnerabilities = async (rawData: string, targetUrl: string): Promise<VulnerabilityReport> => {
    const apiKey = (window as any).process?.env?.OPENAI_API_KEY;

    // Check if API key is valid
    if (!apiKey || apiKey.trim() === "" || apiKey.includes("PLACEHOLDER") || apiKey.includes("TU_OPENAI_KEY")) {
        console.warn("⚠️ DEMO MODE: No OpenAI API key configured. Using mock data.");
        alert("🎭 MODO DEMO (OpenAI)\n\nNo hay API key de OpenAI configurada. Mostrando datos de ejemplo.\n\nObtén una clave en: https://platform.openai.com/api-keys");

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        return MOCK_REPORT;
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o", // O usa "gpt-3.5-turbo" si prefieres algo más económico/rápido
                messages: [
                    {
                        role: "system",
                        content: SYSTEM_INSTRUCTION
                    },
                    {
                        role: "user",
                        content: `URL OBJETIVO: ${targetUrl}\n\nTELEMETRÍA BRUTA:\n${rawData}`
                    }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        if (!content) throw new Error("La IA no generó contenido.");

        return JSON.parse(content) as VulnerabilityReport;

    } catch (err: any) {
        console.error("Critical AI Error:", err);

        // Fallback to demo mode on auth error
        if (err.message?.includes("Incorrect API key") || err.message?.includes("401")) {
            console.warn("⚠️ OpenAI API key invalid. Falling back to DEMO MODE");
            alert("🔑 API Key Inválida (OpenAI)\n\nLa clave de OpenAI es incorrecta. Mostrando datos de ejemplo.");

            // Simulate processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            return MOCK_REPORT;
        }

        throw new Error(err.message || "Error de comunicación con OpenAI.");
    }
};
