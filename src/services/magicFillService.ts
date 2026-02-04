// src/services/magicFillService.ts

export type MagicFillRequest = {
    text: string;
    source_url?: string;
};

export type MagicFillResponse = any;

// ✅ accepte soit une string, soit un objet {text, source_url}
export type MagicFillInput = string | MagicFillRequest;

async function extractFromText(input: MagicFillInput): Promise<MagicFillResponse> {
    const payload: MagicFillRequest =
        typeof input === "string"
            ? { text: input, source_url: "" }
            : { text: input.text, source_url: input.source_url ?? "" };

    const r = await fetch("/api/magic-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const raw = await r.text().catch(() => "");

    if (!r.ok) {
        throw new Error(`MagicFill HTTP ${r.status}: ${raw || "No body"}`);
    }

    try {
        return JSON.parse(raw);
    } catch {
        return raw as any;
    }
}

const MagicFillService = {
    extractFromText,
};

export default MagicFillService;
export { extractFromText };
