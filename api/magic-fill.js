export default async function handler(req, res) {
    // CORS (optionnel mais ok)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

    try {
        // ✅ Next/Vercel parse souvent déjà le JSON
        // - si req.body est un objet -> OK
        // - si req.body est une string -> on parse
        const payload =
            typeof req.body === "string" ? JSON.parse(req.body) : req.body;

        if (!payload || typeof payload !== "object") {
            return res.status(400).json({
                error: "invalid_payload",
                details: "body must be JSON object",
                receivedType: typeof payload,
            });
        }

        const upstreamUrl = "https://api.nodecore.dev/v1/magic-fill";

        const r = await fetch(upstreamUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // 🔥 les 3 secrets viennent de Vercel env vars
                "Authorization": `Bearer ${process.env.MAGICFILL_BEARER}`,
                "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID,
                "CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET,
            },
            body: JSON.stringify(payload),
        });

        const text = await r.text(); // on lit en texte pour éviter crash JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            // si jamais Cloudflare renvoie HTML (502), on le renvoie tel quel
            return res.status(502).json({
                error: "upstream_not_json",
                status: r.status,
                upstreamUrl,
                sample: text.slice(0, 300),
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
