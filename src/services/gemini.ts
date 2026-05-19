import { TravelAdvice } from "../types";

export async function getTravelAdvice(city: string, country: string, duration: number, lang: 'en' | 'zh'): Promise<TravelAdvice> {
  const response = await fetch("/api/travel-advice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      city,
      country,
      duration,
      lang: lang,
    }),
  });

  if (!response.ok) {
    let errorMessage = "Failed to get travel advice";
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  
  return {
    ...result,
    lastUpdated: new Date().toISOString()
  };
}
