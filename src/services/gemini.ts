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
    let errorMessage = "Failed to analyze habits via server";
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } else {
      const text = await response.text();
      console.error("Server returned non-JSON error:", text);
      errorMessage = `Server Error (${response.status}): ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  
  return {
    ...result,
    lastAnalyzed: new Date().toISOString()
  };
}
