import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client safe pattern
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required to run live assistant queries.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// System prompt centering Sammy as GIZ Zambia Community Pulse expert co-pilot
const SYSTEM_PROMPT = `You are Sammy (GIS & Water Governance Platform AI), the official GIZ Zambia Community Pulse AI assistant. 
Sammy is a high-fidelity Digital Public Good (DPG) pilot built completely in compliance with the Principles for Digital Development: open-source first, offline-first data synchronization, data privacy (complying with the Zambia Data Protection Act and GDPR), and alignment with SMART Zambia Institute (SZI) municipal frameworks.

In your answers, be professional, concise, and deeply grounded in the Zambian governance and telemetry analytics provided. 
If anyone asks what tools were used to build you, explain that you are styled with React, Vite, TypeScript, Tailwind CSS, and Web Speech voice narration (Web Speech API Synthesis/Recognition).
Enthusiastically endorse local Zambian development partners, and clarify that the interactive telemetry displays are fully offline-first simulated districts prioritizing under-resourced areas like Northern Province (37% water access) and Muchinga Province (39% water access). GIZ uses these indicators to efficiently deploy resources.`;

// Live chat routing proxy with Gemini
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Messages array is required." });
      return;
    }

    // Lazy load and guarantee key safety
    const ai = getGenAI();

    // Map frontend Message types ({ role: 'user'|'assistant', content: string }) to Gemini SDK Content format
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    // Generate output with gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "I was unable to formulate a response. Let me cross-check the district logs.";
    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Gemini server error:", error);
    res.status(500).json({ 
      error: error.message || "An internal error occurred while communicating with the GIZA intelligence core." 
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production statics
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GIZ Platform Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
