export const config = {
    api: {
        bodyParser: true, // laisse Vercel parser
    },
};

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

    try {
        // 1) payload (objet ou string)
        let payload = req.body;

        // Si c'est une string JSON
        if (typeof payload === "string" && payload.trim().length) {
            payload = JSON.parse(payload);
        }

        // Si Vercel a donné null/undefined (rare) -> erreur claire
        if (!payload || typeof payload !== "object") {
            return res.status(400).json({
                error: "invalid_json",
                message: "Body is empty or not a JSON object",
                receivedType: typeof payload,
            });
        }

        // 2) Validation soft (pour éviter les 404/502 débiles)
        if (typeof payload.text !== "string" || payload.text.trim().length < 20) {
            return res.status(400).json({
                error: "invalid_input",
                details: "payload.text must be a string (>= 20 chars)",
                gotLen: typeof payload.text === "string" ? payload.text.length : null,
            });
        }

        const upstreamUrl = "https://api.nodecore.dev/v1/magic-fill";

        const r = await fetch(upstreamUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.MAGICFILL_BEARER}`,
                "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID,
                "CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET,
            },
            body: JSON.stringify(payload),
        });

        const text = await r.text();

        // Upstream non JSON (502 Cloudflare HTML / 404 vide, etc.)
        let data;
        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            return res.status(502).json({
                error: "upstream_not_json",
                status: r.status,
                upstreamUrl,
                sample: text.slice(0, 300),
            });
        }

        // Si upstream renvoie vide
        if (data === null) {
            return res.status(502).json({
                error: "upstream_empty",
                status: r.status,
                upstreamUrl,
            });
        }

        return res.status(r.status).json(data);
    } catch (err) {
        return res.status(500).json({
            error: "proxy_failed",
            details: String(err?.message || err),
        });
    }
}
