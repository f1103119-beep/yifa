import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Globetrotter AI Server ready" });
  });

  // Travel Advice API Route
  app.post("/api/travel-advice", async (req, res) => {
    try {
      const { city, country, duration, lang } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const prompt = `
        You are a world-class travel guide. Provide travel advice for a trip with the following details:
        City: ${city}
        Country: ${country}
        Duration: ${duration} days

        Your advice must include:
        1. A brief summary of why this destination is great.
        2. A list of 3-5 famous places to visit in ${city} or ${country}, with short descriptions and a specific image search keyword (e.g. "Eiffel Tower Paris").
        3. A list of 3-5 must-try local foods/drinks in ${city} or ${country}, with short descriptions and a specific image search keyword (e.g. "Pad Thai street food").

        Language: ${lang === 'zh' ? 'Traditional Chinese' : 'English'}.

        Response MUST be valid JSON:
        {
          "summary": "string",
          "places": [{"name": "string", "description": "string", "imageQuery": "string"}],
          "foods": [{"name": "string", "description": "string", "imageQuery": "string"}]
        }
      `;

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              places: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    imageQuery: { type: Type.STRING }
                  },
                  required: ["name", "description", "imageQuery"]
                }
              },
              foods: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    imageQuery: { type: Type.STRING }
                  },
                  required: ["name", "description", "imageQuery"]
                }
              }
            },
            required: ["summary", "places", "foods"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      // Robust JSON extraction
      let jsonStr = text.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      
      const advice = JSON.parse(jsonStr);

      res.json(advice);
    } catch (error: any) {
      console.error("Travel Advice Error:", error);
      res.status(500).json({ error: error.message || "Failed to get travel advice" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
