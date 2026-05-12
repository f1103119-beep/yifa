import { GoogleGenAI, Type } from "@google/genai";
import { DailyLog, AnalysisResult } from "../types";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please set it in the Secrets panel.");
  }
  return new GoogleGenAI({ apiKey });
};

export async function analyzeHabits(log: DailyLog, lang: 'en' | 'zh'): Promise<AnalysisResult> {
  const ai = getAI();
  const mealSummary = log.meals.map(m => `${m.category}: ${m.content}`).join('\n');
  const prompt = `
    Analyze the following daily food and water intake:
    Meals:
    ${mealSummary}
    Water Intake: ${log.waterIntake}ml

    Please provide:
    1. A health rating from 1 to 10 (10 being perfect).
    2. Detailed feedback on the choices made today.
    3. 3-5 actionable suggestions for improvement.

    Language: ${lang === 'zh' ? 'Traditional Chinese' : 'English'}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are a professional nutritionist. You always respond in a structured JSON format.
        Schema:
        {
          "rating": number (1-10),
          "feedback": string,
          "suggestions": string[]
        }`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rating: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["rating", "feedback", "suggestions"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
      ...result,
      lastAnalyzed: new Date().toISOString()
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
}
