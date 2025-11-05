import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

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
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json({ limit: "20mb" }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const primaryModel = genAI.getGenerativeModel({
  model: "models/gemini-2.0-flash-lite"
});

const fallbackModel = genAI.getGenerativeModel({
  model: "models/gemini-2.0-flash-lite-001"
});


// Persistent translation cache (survives server restarts)
const translationStore = new Map();
const CACHE_FILE = './translation-cache.json';

// Load cache from file on startup
try {
  const fs = await import('fs');
  if (fs.existsSync(CACHE_FILE)) {
    const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    Object.entries(cacheData).forEach(([key, value]) => {
      translationStore.set(key, value);
    });
    console.log(`Loaded ${translationStore.size} cached translations`);
  }
} catch (err) {
  console.log('No cache file found, starting fresh');
}

// Save cache to file
function saveCacheToFile() {
  try {
    import('fs').then(fs => {
      const cacheObj = Object.fromEntries(translationStore);
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheObj, null, 2));
    });
  } catch (err) {
    console.error('Failed to save cache:', err);
  }
}

// Auto-save cache every 5 minutes
setInterval(saveCacheToFile, 5 * 60 * 1000);

// Save cache on exit
process.on('SIGINT', () => {
  saveCacheToFile();
  process.exit();
});

const chunkCache = new Map();

function smartSplitChunks(text, maxLength = 1000) {
  const chunks = [];
  let current = "";

  const words = text.split(" ");

  for (const word of words) {
    const testChunk = current + (current ? " " : "") + word;

    if (testChunk.length > maxLength && current) {
      chunks.push(current.trim());
      current = word;
    } else {
      current = testChunk;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.filter(c => c.length > 0);
}

async function withRetryAndFallback(fn, retries = 4) {
  let delay = 300;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn(primaryModel);
    } catch (err) {
      const is429 = err.status === 429 || `${err}`.includes("429");
      const is503 = err.status === 503 || `${err}`.includes("503");

      if (is429 || is503) {
        if (i === 2) {
          try {
            return await fn(fallbackModel);
          } catch (fallbackErr) {
            console.error("Fallback model failed:", fallbackErr.message);
          }
        }

        if (i < retries - 1) {
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
        }
      } else {
        throw err;
      }
    }
  }
  throw new Error("Translation failed after retries");
}

async function translateChunk(text, targetLang, model = primaryModel) {
  const cacheKey = `${targetLang}:${text.substring(0, 50)}`;

  // Check persistent cache first
  if (translationStore.has(cacheKey)) {
    return translationStore.get(cacheKey);
  }

  // Check in-memory cache
  if (chunkCache.has(cacheKey)) {
    return chunkCache.get(cacheKey);
  }

  const prompt = `You are a highly reliable translation engine.
Translate ONLY human-readable text values in this JSON to ${targetLang}.

STRICT RULES:
- DO NOT change JSON keys.
- DO NOT change array structure.
- DO NOT translate identifiers, ids, keys, URLs, emails, or paths.
- DO NOT add new fields.
- DO NOT remove any fields.
- Return ONLY valid JSON.
- If you cannot translate a value, keep it unchanged.
- Preserve formatting and punctuation.
- Fix any spelling or grammar mistakes naturally.

TEXT:
${text}
`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const translated = result.response.text().trim();

  // Store in both caches
  chunkCache.set(cacheKey, translated);
  translationStore.set(cacheKey, translated);

  // Periodically save to disk (debounced)
  if (translationStore.size % 10 === 0) {
    saveCacheToFile();
  }

  return translated;
}

function healJSON(jsonString) {
  let healed = jsonString.trim();

  healed = healed.replace(/,\s*}/g, "}");
  healed = healed.replace(/,\s*]/g, "]");
  healed = healed.replace(/}\s*{/g, "},{");
  healed = healed.replace(/]\s*\[/g, "],[");

  if (!healed.startsWith("{") && !healed.startsWith("[")) {
    healed = "{" + healed;
  }

  if (!healed.endsWith("}") && !healed.endsWith("]")) {
    healed = healed + "}";
  }

  const openBraces = (healed.match(/{/g) || []).length;
  const closeBraces = (healed.match(/}/g) || []).length;
  const openBrackets = (healed.match(/\[/g) || []).length;
  const closeBrackets = (healed.match(/]/g) || []).length;

  if (openBraces > closeBraces) {
    healed += "}".repeat(openBraces - closeBraces);
  }
  if (openBrackets > closeBrackets) {
    healed += "]".repeat(openBrackets - closeBrackets);
  }

  return healed;
}

async function translateInParallel(chunks, targetLang, maxConcurrent = 3) {
  const results = new Array(chunks.length);
  const queue = chunks.map((chunk, index) => ({ chunk, index }));

  const workers = [];

  for (let i = 0; i < maxConcurrent; i++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const item = queue.shift();
          if (!item) break;

          try {
            const translated = await withRetryAndFallback(
              (model) => translateChunk(item.chunk, targetLang, model)
            );
            results[item.index] = translated;
          } catch (err) {
            console.error(`Chunk ${item.index} failed:`, err.message);
            results[item.index] = item.chunk;
          }
        }
      })()
    );
  }

  await Promise.all(workers);
  return results;
}

app.post("/api/translate-fast", async (req, res) => {
  try {
    const { targetLang, data } = req.body;

    if (!targetLang || !data) {
      return res.status(400).json({ error: "targetLang and data required" });
    }

    const jsonStr = JSON.stringify(data);
    const chunks = smartSplitChunks(jsonStr, 1000);

    const translatedChunks = await translateInParallel(chunks, targetLang, 5);

    const combined = translatedChunks.join("");
    const healed = healJSON(combined);

    try {
      const result = JSON.parse(healed);
      res.json(result);
    } catch (parseErr) {
      console.error("JSON parse failed:", healed.substring(0, 200));
      throw new Error("Failed to parse translated JSON");
    }
  } catch (err) {
    console.error("Fast translate error:", err);
    res.status(500).json({ error: err.message });
  }
});

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
    const chunks = smartSplitChunks(jsonStr, 1000);

    res.write(`event: start\ndata: ${JSON.stringify({ chunks: chunks.length })}\n\n`);

    const translatedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      const part = chunks[i];

      try {
        const translated = await withRetryAndFallback(
          (model) => translateChunk(part, targetLang, model)
        );

        translatedChunks.push(translated);

        res.write(
          `event: chunk\ndata: ${JSON.stringify({
            index: i,
            text: translated,
            progress: Math.round(((i + 1) / chunks.length) * 100)
          })}\n\n`
        );

        await new Promise((r) => setTimeout(r, 50));
      } catch (chunkError) {
        console.error(`Error on chunk ${i}:`, chunkError.message);
        res.write(`event: error\ndata: ${JSON.stringify({
          error: `Translation failed at chunk ${i}: ${chunkError.message}`
        })}\n\n`);
        res.end();
        return;
      }
    }

    const combined = translatedChunks.join("");
    const healed = healJSON(combined);

    try {
      JSON.parse(healed);
      res.write("event: done\ndata: {}\n\n");
    } catch (err) {
      res.write(`event: error\ndata: ${JSON.stringify({
        error: "Failed to validate final JSON"
      })}\n\n`);
    }

    res.end();
  } catch (err) {
    console.error("Stream error:", err);
    res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

async function extractCVData(text) {
  const prompt = `You are a CV parser. Return ONLY valid JSON matching exactly this schema:

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
    const result = await primaryModel.generateContent(prompt);
    let output = result.response.text().trim();

    if (output.includes("```")) {
      const match = output.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) output = match[1].trim();
    }

    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON extracted");

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("CV extraction error:", err);
    throw new Error("Failed to extract CV: " + err.message);
  }
}

app.post("/api/extract-cv", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    const cvData = await extractCVData(text);
    res.json(cvData);
  } catch (err) {
    console.error("Extract CV endpoint:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/test-model", async (req, res) => {
  try {
    const result = await primaryModel.generateContent("Say 'Model is working!' in one sentence.");
    res.json({
      success: true,
      response: result.response.text(),
      model: "gemini-2.0-flash-exp",
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Test model at: http://localhost:${PORT}/api/test-model`);
});
