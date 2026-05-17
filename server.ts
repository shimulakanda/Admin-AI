import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import bodyParser from "body-parser";

let aiClient: GoogleGenAI | null = null;
const getAi = () => {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!key) {
      throw new Error(`API Key missing! If you set it in Vercel, ensure you checked the "Preview" AND "Production" checkboxes. Please edit the variable in Vercel settings, check all environments, save, and REDEPLOY.`);
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(bodyParser.json({ limit: "50mb" }));

  // API router
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const ai = getAi();
      const { model, contents, config } = req.body;
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
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
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
