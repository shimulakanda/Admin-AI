import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // To support both local preview processes AND Vercel deployment cleanly
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) {
    const envKeys = Object.keys(process.env).filter(k => k.toLowerCase().includes('gemini') || k.toLowerCase().includes('api') || k.toLowerCase().includes('key'));
    return res.status(500).json({ 
      error: `API Key missing! If you set it in Vercel, ensure you checked the "Preview" AND "Production" checkboxes. Similar keys found: [${envKeys.join(', ')}]. Please edit the variable in Vercel settings, check all environments, save, and REDEPLOY.` 
    });
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
