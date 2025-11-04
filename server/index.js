import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ---------------------------
// ✅ CORS
// ---------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("CORS blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json({ limit: "10mb" }));

// ---------------------------
// ✅ Gemini Client with v1 API
// ---------------------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ CRITICAL FIX: Use gemini-pro (most stable and widely available)
const model = genAI.getGenerativeModel({
  model: "models/gemini-2.5-flash"  // This model is available on all API keys
});

console.log("✅ Using Gemini model: gemini-pro");

// =======================================================================
// ✅ UTIL — Split text into safe chunks by character count
// =======================================================================
function splitIntoChunks(text, maxLength = 1500) {
  const chunks = [];
  let current = "";

  for (const part of text.split(" ")) {
    if ((current + part).length > maxLength) {
      chunks.push(current.trim());
      current = part + " ";
    } else {
      current += part + " ";
    }
  }

  if (current.trim().length > 0) chunks.push(current.trim());
  return chunks;
}

// =======================================================================
// ✅ UTIL — Retry wrapper (solves 429 Too Many Requests)
// =======================================================================
async function withRetry(fn, retries = 4) {
  let delay = 400;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const is429 = err.status === 429 || `${err}`.includes("429");
      const is503 = err.status === 503 || `${err}`.includes("503");
      
      if (is429 || is503) {
        console.log(`🔄 Gemini ${err.status || '429'} — retry ${i + 1}/${retries} in ${delay}ms`);
        if (i < retries - 1) {
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
        }
      } else {
        // If it's not a rate limit error, throw immediately
        console.error("❌ Non-retryable error:", err.message);
        throw err;
      }
    }
  }
  throw new Error("Gemini error after retries");
}

// =======================================================================
// ✅ CHUNK-BASED TRANSLATION
// =======================================================================
async function translateChunk(text, targetLang) {
  const prompt = `
Translate this EXACT text into **${targetLang}**.
If the source text contains any spelling or grammar mistakes, 
correct them naturally in the translation — but keep the original meaning.
Do NOT modify numbers, URLs, code, or formatting.
Return ONLY the translated text, nothing else.

TEXT:
${text}
`;

  const result = await withRetry(() =>
    model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    })
  );

  return result.response.text().trim();
}

// =======================================================================
// ✅ MAIN CHUNK TRANSLATION HANDLER
//    Takes a big JSON → extracts strings → translates chunk-by-chunk
// =======================================================================
async function translateJSONByChunks(targetLang, originalJson) {
  // Convert JSON to string
  const jsonStr = JSON.stringify(originalJson);

  // Split based on chars, not objects (fast, simple, safe)
  const chunks = splitIntoChunks(jsonStr, 1800);

  console.log(`✅ Translation chunks: ${chunks.length}`);

  // Translate sequentially (safe for rate limits)
  let translated = "";

  for (const chunk of chunks) {
    const translatedChunk = await translateChunk(chunk, targetLang);
    translated += translatedChunk;
  }

  // Try rebuilding JSON
  try {
    const fixed = translated.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
    return JSON.parse(fixed);
  } catch (err) {
    console.error("❌ JSON rebuild failed:", translated);
    throw new Error("Failed to rebuild translated JSON");
  }
}

// =======================================================================
// ✅ API: /api/translate (chunked version)
// =======================================================================
app.post("/api/translate", async (req, res) => {
  try {
    const { targetLang, data } = req.body;

    if (!targetLang || !data) {
      return res.status(400).json({ error: "targetLang and data required" });
    }

    const result = await translateJSONByChunks(targetLang, data);
    res.json(result);
  } catch (err) {
    console.error("❌ translate error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================================================================
// ✅ STREAMING VERSION OF CHUNK TRANSLATION (REAL-TIME TYPING MODE)
// =======================================================================
app.post("/api/translate-stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const { targetLang, data } = req.body;
    if (!targetLang || !data) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: "missing params" })}\n\n`);
      res.end();
      return;
    }

    const jsonStr = JSON.stringify(data);
    const chunks = splitIntoChunks(jsonStr, 1800);

    res.write(`event: start\ndata: ${JSON.stringify({ chunks: chunks.length })}\n\n`);

    for (let i = 0; i < chunks.length; i++) {
      const part = chunks[i];

      try {
        const translated = await translateChunk(part, targetLang);

        res.write(
          `event: chunk\ndata: ${JSON.stringify({
            index: i,
            text: translated
          })}\n\n`
        );

        // Small delay = human typing-like
        await new Promise((r) => setTimeout(r, 100));
      } catch (chunkError) {
        console.error(`❌ Error on chunk ${i}:`, chunkError.message);
        res.write(`event: error\ndata: ${JSON.stringify({ 
          error: `Translation failed at chunk ${i}: ${chunkError.message}` 
        })}\n\n`);
        res.end();
        return;
      }
    }

    res.write("event: done\ndata: {}\n\n");
    res.end();
  } catch (err) {
    console.error("❌ stream error:", err);
    res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// =====================================================================
// ✅ CV EXTRACTION (PDF → Text → Structured JSON)
// =====================================================================
async function extractCVData(text) {
  const prompt = `
You are a CV parser. Return ONLY valid JSON matching exactly this schema:

{
  "personalInfo": { "fullName": "", "professionalTitle": "", "avatarUrl": "" },
  "profile": "",
  "contact": { "email": "", "phone": "", "location": "", "github": "", "linkedin": "" },
  "skills": [],
  "technologies": [{ "id": "", "title": "", "items": "" }],
  "experiences": [{ "id": "", "jobTitle": "", "company": "", "missions": [] }],
  "languages": [{ "name": "", "flag": "", "level": "" }],
  "certifications": [{ "name": "", "issuer": "" }],
  "customSections": [],
  "sectionOrder": ["personal", "profile", "skills", "technologies", "experiences", "certifications", "languages"],
  "sectionTitles": {
    "profile": "Professional Profile",
    "skills": "Skills",
    "technologies": "Technical Environment",
    "experiences": "Professional Experience",
    "certifications": "Certifications",
    "languages": "Languages"
  }
}

RULES:
- If a field is missing, fill with "" or [].
- Extract ALL experiences & missions.
- Generate unique IDs.

CV TEXT:
${text}
`;

  try {
    const result = await model.generateContent(prompt);
    let output = result.response.text().trim();

    if (output.includes("```")) {
      const match = output.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) output = match[1].trim();
    }

    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON extracted");

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("❌ CV extraction error:", err);
    throw new Error("Failed to extract CV: " + err.message);
  }
}

// =====================================================================
// ✅ API: /api/extract-cv
// =====================================================================
app.post("/api/extract-cv", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    const cvData = await extractCVData(text);
    res.json(cvData);
  } catch (err) {
    console.error("❌ Extract CV endpoint:", err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================================
// ✅ TEST ENDPOINT - Check if model is working
// =====================================================================
app.get("/api/test-model", async (req, res) => {
  try {
    const result = await model.generateContent("Say 'Model is working!' in one sentence.");
    res.json({ 
      success: true, 
      response: result.response.text(),
      model: "gemini-1.5-flash",
      apiVersion: "v1"
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message,
      details: err.toString()
    });
  }
});

// =====================================================================
// ✅ LIST AVAILABLE MODELS (helpful for debugging)
// =====================================================================
  app.get("/api/list-models", async (req, res) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
      );

      const data = await response.json();

      if (data.error) {
        return res.status(500).json({ success: false, error: data.error.message });
      }

      res.json({
        success: true,
        availableModels: data.models.map(m => m.name),
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  });

// =====================================================================
// ✅ Start server
// =====================================================================
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🧪 Test model at: http://localhost:${PORT}/api/test-model`);
  console.log(`📋 List models at: http://localhost:${PORT}/api/list-models`);
});