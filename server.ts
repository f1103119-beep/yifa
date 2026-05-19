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
    res.json({ status: "ok", message: "Server is internal and ready" });
  });

  // AI Analysis API Route
  app.post("/api/analyze", async (req, res) => {
    try {
      const { plan, water, lang } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      console.log("Analyzing habits:", { planLength: plan.length, water });
      const prompt = `
        Analyze the following daily food and water intake:
        Meals:
        ${plan}
        Water Intake: ${water}ml

        Please provide:
        1. A health rating from 1 to 10 (10 being perfect).
        2. Detailed feedback on the choices made today.
        3. 3-5 actionable suggestions for improvement.

        Language: ${lang === 'zh' ? 'Traditional Chinese' : 'English'}.
      `;

      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text) throw new Error("No response from AI");
      
      const analysis = JSON.parse(text);
      res.json(analysis);
    } catch (error: any) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze habits" });
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
