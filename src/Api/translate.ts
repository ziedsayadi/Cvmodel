import type { CVData } from "../types/cv";

export async function translateCV(targetLang: string, data: CVData): Promise<CVData> {
  try {
    const response = await fetch("http://localhost:4000/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetLang, data }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    // Return the translated CVData
    return (await response.json()) as CVData;
  } catch (err) {
    console.error("Translation API error:", err);
    throw err;
  }
}
