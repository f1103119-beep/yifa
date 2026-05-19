import { DailyLog, AnalysisResult } from "../types";

export async function analyzeHabits(log: DailyLog, lang: 'en' | 'zh'): Promise<AnalysisResult> {
  const mealSummary = log.meals.map(m => `${m.category}: ${m.content}`).join('\n');
  
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan: mealSummary,
      water: log.waterIntake,
      lang: lang,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to analyze habits via server");
  }

  const result = await response.json();
  
  return {
    ...result,
    lastAnalyzed: new Date().toISOString()
  };
}
