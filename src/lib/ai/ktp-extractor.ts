import { groq } from "~/lib/groq";

export async function extractKtpData(imageBase64: string): Promise<{
  name: string | null;
  nik: string | null;
}> {
  const fallback = { name: null, nik: null };

  try {
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract the following fields from this Indonesian KTP (identity card) image:
- Full name (nama)
- NIK (16-digit Indonesian ID number)

Return STRICT JSON only, no explanation, no markdown:
{"name": "string", "nik": "string"}

If you cannot detect a field, use null for that field.
Example when not detected: {"name": null, "nik": null}`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 256,
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) return fallback;

    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) return fallback;

    const obj = parsed as Record<string, unknown>;

    return {
      name: typeof obj.name === "string" ? obj.name : null,
      nik: typeof obj.nik === "string" ? obj.nik : null,
    };
  } catch {
    return fallback;
  }
}
