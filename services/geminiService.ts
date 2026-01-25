
import { GoogleGenAI } from "@google/genai";
import { VulnerabilityReport } from "../types.ts";
import { SYSTEM_INSTRUCTION, MOCK_REPORT } from "../constants.tsx";

export const analyzeVulnerabilities = async (rawData: string, targetUrl: string): Promise<VulnerabilityReport> => {
  const apiKey = (window as any).process?.env?.API_KEY;

  // Check if API key is valid
  if (!apiKey || apiKey.trim() === "" || apiKey.includes("TU_API_KEY") || apiKey.includes("PLACEHOLDER") || apiKey.includes("YOUR_VALID_API_KEY_HERE")) {
    console.warn("⚠️ DEMO MODE: No API key configured. Using mock data.");
    alert("🎭 MODO DEMO\n\nNo hay API key configurada. Mostrando datos de ejemplo.\n\nPara usar IA real, obtén una clave en:\nhttps://aistudio.google.com/apikey");

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return MOCK_REPORT;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: `URL OBJETIVO: ${targetUrl}\n\nTELEMETRÍA BRUTA:\n${rawData}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.1,
        topP: 0.95
      }
    });

    const text = response.text;
    if (!text) throw new Error("La IA no generó contenido.");

    // Limpieza de posibles caracteres extraños que Gemini a veces añade
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;

    return JSON.parse(cleanJson) as VulnerabilityReport;
  } catch (err: any) {
    console.error("Critical AI Error:", err);

    // If API key is invalid, fallback to demo mode
    if (err.message?.includes("API key not valid") || err.message?.includes("INVALID_ARGUMENT")) {
      console.warn("⚠️ API key invalid. Falling back to DEMO MODE");
      alert("🔑 API Key Inválida\n\nLa clave de API no es válida. Mostrando datos de ejemplo.\n\nObtén una clave válida en:\nhttps://aistudio.google.com/apikey");

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      return MOCK_REPORT;
    }

    throw new Error(err.message || "Error de comunicación con el cerebro de IA.");
  }
};
