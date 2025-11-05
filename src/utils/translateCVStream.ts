export async function translateCVStream(
  targetLang: string,
  data: any,
  onPartial: (text: string) => void,
  onDone: () => void
) {
  const response = await fetch("http://localhost:4000/api/translate-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetLang, data }),
  });

  if (!response.ok) {
    console.error("Stream HTTP error:", response.status);
    throw new Error("Stream failed");
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("event: chunk")) {
        const dataLine = line.split("data: ")[1];
        const { text } = JSON.parse(dataLine);
        onPartial(text);
      }

      if (line.startsWith("event: done")) {
        onDone();
        return;
      }

      // ✅ Handle error events
      if (line.startsWith("event: error")) {
        const dataLine = line.split("data: ")[1];
        const { error } = JSON.parse(dataLine);
        throw new Error(error);
      }
    }
  }
}