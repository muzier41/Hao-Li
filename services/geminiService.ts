import { GoogleGenAI, Type } from "@google/genai";
import { CompanyType } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize only if key exists, handled gracefully in functions
let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

export const classifyCompany = async (companyName: string): Promise<{ industry: string; companyType: CompanyType }> => {
  // Fallback if no API key
  if (!ai) {
    console.warn("Gemini API Key not found. Using mock classification.");
    return { industry: '未分类', companyType: CompanyType.Other };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Identify the company "${companyName}".
      1. Provide the Industry in Simplified Chinese (short string, e.g., "互联网", "金融", "新能源").
      2. Provide the Company Type matching one of these exact English keys: 'State Owned', 'Foreign', 'Internet', 'Consulting', 'Startup', 'Other'.
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            industry: { type: Type.STRING },
            companyType: { 
              type: Type.STRING, 
              enum: [
                'State Owned', 'Foreign', 'Internet', 'Consulting', 'Startup', 'Other'
              ] 
            },
          },
          required: ["industry", "companyType"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    const data = JSON.parse(text);
    
    return {
      industry: data.industry || '未知',
      companyType: data.companyType as CompanyType || CompanyType.Other,
    };
  } catch (error) {
    console.error("Gemini classification failed:", error);
    return { industry: '未知', companyType: CompanyType.Other };
  }
};