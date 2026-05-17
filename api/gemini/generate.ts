import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // To support both local preview processes AND Vercel deployment cleanly
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not set in Vercel Environment Variables. Please add it in Vercel settings." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const { model, contents, config } = req.body;
    
    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Vercel API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate content" });
  }
}
