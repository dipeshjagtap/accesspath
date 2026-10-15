/**
 * Ping Gemini with the server-side API key only (no database).
 * Reads GEMINI_API_KEY / GOOGLE_API_KEY from env (.env.local via --env-file).
 */
import { config } from "dotenv";

config({ path: ".env.local" });

import { GoogleGenAI } from "@google/genai";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const model = process.env.VERTEX_AI_MODEL || "gemini-2.0-flash";

  if (!apiKey) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          error: "GEMINI_API_KEY is not set in the environment / .env.local",
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
    return;
  }

  const started = Date.now();
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: 'Reply with exactly: {"status":"ok"}',
      config: {
        temperature: 0,
        maxOutputTokens: 32,
        responseMimeType: "application/json",
      },
    });

    const text =
      response.text?.trim() ||
      response.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("")
        .trim() ||
      "";

    console.log(
      JSON.stringify(
        {
          ok: true,
          model,
          latencyMs: Date.now() - started,
          keyPresent: true,
          keyPrefix: `${apiKey.slice(0, 4)}…`,
          sample: text.slice(0, 120),
        },
        null,
        2,
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const sanitized = message
      .replace(/AIza[0-9A-Za-z_-]+/g, "***")
      .replace(/AQ\.[0-9A-Za-z_-]+/g, "***");
    console.log(
      JSON.stringify(
        {
          ok: false,
          model,
          latencyMs: Date.now() - started,
          keyPresent: true,
          keyPrefix: `${apiKey.slice(0, 4)}…`,
          error: sanitized,
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  }
}

main();
