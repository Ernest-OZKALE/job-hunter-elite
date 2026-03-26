export default async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "missing_env", details: "GEMINI_API_KEY is not set" });
        }

        // --- read body robustly ---
        let raw = "";
        if (typeof req.body === "string") {
            raw = req.body;
        } else if (req.body && typeof req.body === "object") {
            // Vercel a déjà parsé le JSON
            raw = JSON.stringify(req.body);
        } else {
            raw = await new Promise((resolve, reject) => {
                let data = "";
                req.on("data", (chunk) => (data += chunk));
                req.on("end", () => resolve(data));
                req.on("error", reject);
            });
        }

        let payload;
        try {
            payload = JSON.parse(raw);
        } catch (e) {
            return res.status(400).json({
                error: "invalid_json",
                message: e?.message || String(e),
                rawSample: raw.slice(0, 200),
                rawLen: raw.length,
            });
        }

        const text = (payload?.text || "").trim();
        const source_url = (payload?.source_url || "").trim();

        if (text.length < 20) {
            return res.status(400).json({
                error: "Invalid input",
                details: [{ path: ["text"], message: "String must contain at least 20 characters" }],
            });
        }

        // --- Gemini call ---
        const model = "gemini-3-flash-preview";
        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

        // Prompt: JSON only
        const system = `
You are an information extractor for job offers.
Return ONLY valid JSON (no markdown, no commentary).
Use this exact shape:

{
  "title": string|null,
  "company": string|null,
  "location": string|null,
  "contract_type": "CDI"|"CDD"|"INTERIM"|"FREELANCE"|"APPRENTICESHIP"|"STAGE"|"UNKNOWN",
  "remote_policy": "ONSITE"|"HYBRID"|"REMOTE"|"UNKNOWN",
  "seniority": "JUNIOR"|"MID"|"SENIOR"|"LEAD"|"UNKNOWN",
  "salary": { "currency":"EUR"|"USD"|null, "min": number|null, "max": number|null, "period":"YEAR"|"MONTH"|"DAY"|"HOUR"|null, "notes": string|null },
  "skills": { "must_have": string[], "nice_to_have": string[] },
  "responsibilities": string[],
  "requirements": string[],
  "benefits": string[],
  "languages": string[],
  "apply": { "url": string|null, "email": string|null, "instructions": string|null },
  "source_confidence": "LOW"|"MEDIUM"|"HIGH"
}
`.trim();

        const user = `
SOURCE_URL: ${source_url || "unknown"}
TEXT:
${text}
`.trim();

        const controller = new AbortController();
        const timeoutMs = 20000; // évite timeout Vercel
        const t = setTimeout(() => controller.abort(), timeoutMs);

        const r = await fetch(url, {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY,
            },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: system }] },
                    { role: "user", parts: [{ text: user }] },
                ],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 1024,
                },
            }),
        }).finally(() => clearTimeout(t));

        const geminiJson = await r.json().catch(() => null);
        if (!r.ok || !geminiJson) {
            return res.status(502).json({
                error: "upstream_error",
                status: r.status,
                sample: JSON.stringify(geminiJson)?.slice(0, 300) || null,
            });
        }

        // Récupère le texte généré
        const outText =
            geminiJson?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";

        let result;
        try {
            result = JSON.parse(outText);
        } catch {
            return res.status(502).json({
                error: "upstream_not_json",
                status: r.status,
                sample: outText.slice(0, 300),
            });
        }

        return res.status(200).json({ attempt: 1, result });
    } catch (err) {
        const isAbort = String(err?.name || "").toLowerCase().includes("abort");
        return res.status(isAbort ? 504 : 500).json({
            error: isAbort ? "upstream_timeout" : "proxy_failed",
            details: String(err?.message || err),
        });
    }
}
