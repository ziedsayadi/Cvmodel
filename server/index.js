import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const primaryModel = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash-lite" }); // More stable model
const fallbackModel = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash-lite" });

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "50mb" }));

// Cache directory setup
const CACHE_DIR = path.join(__dirname, "translation-cache");
const CACHE_INDEX_FILE = path.join(CACHE_DIR, "index.json");

// Initialize cache directory
async function initCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    console.log("✅ Translation cache directory initialized");
  } catch (err) {
    console.error("❌ Failed to create cache directory:", err);
  }
}

// Load cache index
async function loadCacheIndex() {
  try {
    const data = await fs.readFile(CACHE_INDEX_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Save cache index
async function saveCacheIndex(index) {
  try {
    await fs.writeFile(CACHE_INDEX_FILE, JSON.stringify(index, null, 2));
  } catch (err) {
    console.error("❌ Failed to save cache index:", err);
  }
}

// Generate cache key from CV data
function generateCacheKey(data, targetLang) {
  const content = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `${targetLang}_${Math.abs(hash).toString(36)}`;
}

// Get cached translation
async function getCachedTranslation(cacheKey) {
  try {
    const cacheIndex = await loadCacheIndex();
    const cacheEntry = cacheIndex[cacheKey];
    
    if (!cacheEntry) return null;
    
    // Check if cache is expired (7 days)
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (now - cacheEntry.timestamp > maxAge) {
      console.log(`⏰ Cache expired for ${cacheKey}`);
      return null;
    }
    
    const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
    const data = await fs.readFile(cacheFile, "utf-8");
    console.log(`✅ Cache hit: ${cacheKey}`);
    return JSON.parse(data);
  } catch (err) {
    console.log(`❌ Cache miss: ${cacheKey}`);
    return null;
  }
}

// Save cached translation
async function saveCachedTranslation(cacheKey, data, targetLang) {
  try {
    const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
    await fs.writeFile(cacheFile, JSON.stringify(data, null, 2));
    
    const cacheIndex = await loadCacheIndex();
    cacheIndex[cacheKey] = {
      timestamp: Date.now(),
      language: targetLang,
      file: `${cacheKey}.json`
    };
    await saveCacheIndex(cacheIndex);
    
    console.log(`💾 Cached translation: ${cacheKey}`);
  } catch (err) {
    console.error("❌ Failed to save cache:", err);
  }
}

// Smart chunk splitting - improved to preserve JSON structure
function smartSplitChunks(jsonStr, maxLength = 800) {
  const chunks = [];
  let current = "";
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    
    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      current += char;
      continue;
    }
    
    if (char === '"' && !escapeNext) {
      inString = !inString;
    }
    
    if (!inString) {
      if (char === '{' || char === '[') braceCount++;
      if (char === '}' || char === ']') braceCount--;
    }
    
    current += char;
    
    // Split at safe boundaries (after complete objects/arrays)
    if (current.length >= maxLength && braceCount === 0 && !inString) {
      chunks.push(current.trim());
      current = "";
    }
  }
  
  if (current.trim()) {
    chunks.push(current.trim());
  }
  
  return chunks.filter(c => c.length > 0);
}

// Improved JSON healing
function healJSON(text) {
  let healed = text.trim();
  
  // Remove markdown code blocks
  healed = healed.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // Remove trailing commas before closing brackets
  healed = healed.replace(/,(\s*[}\]])/g, '$1');
  
  // Ensure proper quote escaping
  healed = healed.replace(/([^\\])"/g, '$1"');
  
  // Add missing closing brackets
  const openBraces = (healed.match(/{/g) || []).length;
  const closeBraces = (healed.match(/}/g) || []).length;
  const openBrackets = (healed.match(/\[/g) || []).length;
  const closeBrackets = (healed.match(/\]/g) || []).length;
  
  if (openBraces > closeBraces) {
    healed += '}'.repeat(openBraces - closeBraces);
  }
  if (openBrackets > closeBrackets) {
    healed += ']'.repeat(openBrackets - closeBrackets);
  }
  
  return healed;
}

// Enhanced retry with fallback
async function withRetryAndFallback(fn, retries = 5) {
  let delay = 500; // Increased initial delay
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Use fallback model after 2 failed attempts
      const model = attempt >= 2 ? fallbackModel : primaryModel;
      return await fn(model);
    } catch (err) {
      const is429 = err.status === 429 || `${err}`.includes("429") || `${err}`.includes("quota");
      const is503 = err.status === 503 || `${err}`.includes("503");
      
      console.log(`⚠️ Attempt ${attempt + 1}/${retries} failed:`, err.message);
      
      if (is429 || is503) {
        if (attempt < retries - 1) {
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2; // Exponential backoff
          continue;
        }
      } else {
        throw err;
      }
    }
  }
  throw new Error("Translation failed after all retries");
}

// Translate a single chunk
async function translateChunk(text, targetLang, model = primaryModel) {
  const prompt = `You are a professional translation engine. Translate ONLY the human-readable text values in this JSON to ${targetLang}.

CRITICAL RULES:
1. DO NOT translate JSON keys, IDs, or structural elements
2. DO NOT change array lengths or structures
3. DO NOT add or remove fields
4. Return ONLY valid JSON (no markdown, no comments)
5. Preserve all special characters and formatting
6. If unsure, keep the original text unchanged

JSON to translate:
${text}

Return the translated JSON:`;

  const result = await model.generateContent(prompt);
  let translated = result.response.text();
  
  // Clean up the response
  translated = healJSON(translated);
  
  return translated;
}

// Streaming translation endpoint
app.post("/api/translate-stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
  
  try {
    const { targetLang, data } = req.body;
    
    if (!targetLang || !data) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: "Missing parameters" })}\n\n`);
      res.end();
      return;
    }
    
    // Check cache first
    const cacheKey = generateCacheKey(data, targetLang);
    const cached = await getCachedTranslation(cacheKey);
    
    if (cached) {
      res.write(`event: start\ndata: ${JSON.stringify({ chunks: 1, cached: true })}\n\n`);
      res.write(`event: chunk\ndata: ${JSON.stringify({ 
        index: 0, 
        text: JSON.stringify(cached), 
        progress: 100 
      })}\n\n`);
      res.write(`event: done\ndata: ${JSON.stringify({ cached: true })}\n\n`);
      res.end();
      return;
    }
    
    const jsonStr = JSON.stringify(data);
    const chunks = smartSplitChunks(jsonStr, 800); // Smaller chunks for better handling
    
    console.log(`📦 Translating ${chunks.length} chunks to ${targetLang}`);
    res.write(`event: start\ndata: ${JSON.stringify({ chunks: chunks.length })}\n\n`);
    
    const translatedChunks = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        console.log(`🔄 Translating chunk ${i + 1}/${chunks.length}`);
        
        const translated = await withRetryAndFallback(
          (model) => translateChunk(chunk, targetLang, model)
        );
        
        translatedChunks.push(translated);
        
        const progress = Math.round(((i + 1) / chunks.length) * 100);
        res.write(
          `event: chunk\ndata: ${JSON.stringify({
            index: i,
            text: translated,
            progress: progress
          })}\n\n`
        );
        
        // Small delay to prevent overwhelming the client
        await new Promise((r) => setTimeout(r, 100));
        
      } catch (chunkError) {
        console.error(`❌ Chunk ${i} failed:`, chunkError.message);
        res.write(`event: error\ndata: ${JSON.stringify({
          error: `Translation failed at chunk ${i + 1}: ${chunkError.message}`
        })}\n\n`);
        res.end();
        return;
      }
    }
    
    // Combine and validate
    const combined = translatedChunks.join("");
    const healed = healJSON(combined);
    
    try {
      const finalResult = JSON.parse(healed);
      
      // Save to cache
      await saveCachedTranslation(cacheKey, finalResult, targetLang);
      
      console.log(`✅ Translation complete: ${targetLang}`);
      res.write(`event: done\ndata: ${JSON.stringify({ success: true })}\n\n`);
    } catch (err) {
      console.error("❌ Final JSON validation failed:", err.message);
      console.error("Healed JSON:", healed.substring(0, 500));
      res.write(`event: error\ndata: ${JSON.stringify({
        error: "Failed to validate final JSON",
        details: err.message
      })}\n\n`);
    }
    
    res.end();
  } catch (err) {
    console.error("❌ Stream error:", err);
    res.write(`event: error\ndata: ${JSON.stringify({ 
      error: err.message || "Translation failed" 
    })}\n\n`);
    res.end();
  }
});

// Fast parallel translation endpoint (improved)
app.post("/api/translate-fast", async (req, res) => {
  try {
    const { targetLang, data } = req.body;
    
    if (!targetLang || !data) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    
    // Check cache
    const cacheKey = generateCacheKey(data, targetLang);
    const cached = await getCachedTranslation(cacheKey);
    
    if (cached) {
      console.log(`✅ Returning cached translation: ${cacheKey}`);
      return res.json(cached);
    }
    
    const jsonStr = JSON.stringify(data);
    const chunks = smartSplitChunks(jsonStr, 800);
    
    console.log(`📦 Fast translating ${chunks.length} chunks`);
    
    // Translate chunks in parallel (max 3 concurrent to avoid rate limits)
    const translatedChunks = [];
    const batchSize = 3;
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchPromises = batch.map((chunk, idx) => 
        withRetryAndFallback((model) => translateChunk(chunk, targetLang, model))
          .catch(err => {
            console.error(`Chunk ${i + idx} failed:`, err.message);
            return chunk; // Return original on failure
          })
      );
      
      const batchResults = await Promise.all(batchPromises);
      translatedChunks.push(...batchResults);
    }
    
    const combined = translatedChunks.join("");
    const healed = healJSON(combined);
    
    const finalResult = JSON.parse(healed);
    
    // Save to cache
    await saveCachedTranslation(cacheKey, finalResult, targetLang);
    
    res.json(finalResult);
  } catch (err) {
    console.error("❌ Fast translate error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Clear cache endpoint
app.post("/api/clear-cache", async (req, res) => {
  try {
    const files = await fs.readdir(CACHE_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        await fs.unlink(path.join(CACHE_DIR, file));
      }
    }
    console.log("🗑️ Cache cleared");
    res.json({ message: "Cache cleared successfully" });
  } catch (err) {
    console.error("❌ Failed to clear cache:", err);
    res.status(500).json({ error: err.message });
  }
});

// Cache statistics endpoint
app.get("/api/cache-stats", async (req, res) => {
  try {
    const cacheIndex = await loadCacheIndex();
    const stats = {
      totalTranslations: Object.keys(cacheIndex).length,
      languages: {},
      cacheSize: 0
    };
    
    for (const key in cacheIndex) {
      const lang = cacheIndex[key].language;
      stats.languages[lang] = (stats.languages[lang] || 0) + 1;
    }
    
    const files = await fs.readdir(CACHE_DIR);
    for (const file of files) {
      const stat = await fs.stat(path.join(CACHE_DIR, file));
      stats.cacheSize += stat.size;
    }
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test endpoint
app.get("/api/test-model", async (req, res) => {
  try {
    const result = await primaryModel.generateContent("Say 'OK' if you're working");
    res.json({ status: "ok", response: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize and start server
initCacheDir().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Cache directory: ${CACHE_DIR}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, cleaning up...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT received, cleaning up...');
  process.exit(0);
});