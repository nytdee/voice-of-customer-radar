import { normalizeRootCause } from "./rootCause";
import {
  buildTaggingUserPrompt,
  ROOT_CAUSE_TAGGING_SYSTEM_PROMPT,
  type AiTag,
  type TaggingRow,
} from "./tagging";

const CHUNK_SIZE = 20;

export interface AiTaggingConfig {
  configured: boolean;
  model: string;
  baseUrl: string;
}

export function aiTaggingConfig(): AiTaggingConfig {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
  return {
    configured: Boolean(apiKey),
    model: process.env.AI_MODEL || "gpt-4o-mini",
    baseUrl: (process.env.AI_API_BASE || "https://api.openai.com/v1").replace(/\/$/, ""),
  };
}

function parseTagPayload(content: string): Array<Record<string, unknown>> {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return a JSON object.");

  const parsed: unknown = JSON.parse(cleaned.slice(start, end + 1));
  if (Array.isArray(parsed)) return parsed as Array<Record<string, unknown>>;
  if (parsed && typeof parsed === "object") {
    const record = parsed as Record<string, unknown>;
    for (const key of ["tags", "results", "reviews"]) {
      if (Array.isArray(record[key])) return record[key] as Array<Record<string, unknown>>;
    }
  }
  throw new Error("Model response did not contain a tags array.");
}

async function tagChunk(rows: TaggingRow[], config: AiTaggingConfig): Promise<AiTag[]> {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0,
      messages: [
        { role: "system", content: ROOT_CAUSE_TAGGING_SYSTEM_PROMPT },
        { role: "user", content: buildTaggingUserPrompt(rows) },
      ],
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`AI tagging failed (${response.status}). ${body.slice(0, 200)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI tagging returned an empty response.");

  const allowed = new Set(rows.map((row) => row.key));
  return parseTagPayload(content)
    .map((item) => {
      const key = String(item.key ?? item.review_id ?? "");
      const cause = normalizeRootCause(item.root_cause ?? item.tag ?? item.label);
      return {
        key,
        root_cause: cause,
        reason: typeof item.reason === "string" ? item.reason.slice(0, 160) : undefined,
      };
    })
    .filter((tag) => allowed.has(tag.key));
}

export async function tagRowsWithLlm(rows: TaggingRow[]): Promise<AiTag[]> {
  const config = aiTaggingConfig();
  if (!config.configured) throw new Error("AI tagging is not configured.");

  const tags: AiTag[] = [];
  for (let index = 0; index < rows.length; index += CHUNK_SIZE) {
    const chunk = rows.slice(index, index + CHUNK_SIZE);
    tags.push(...(await tagChunk(chunk, config)));
  }
  return tags;
}
