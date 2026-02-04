export const config = {
    runtime: "nodejs",
    maxDuration: 60, // mets 60 pour commencer (si ton plan permet +, on montera)
};

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

    const upstreamUrl = "https://api.nodecore.dev/v1/magic-fill";

    try {
        const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

        const controller = new AbortController();
        const timeoutMs = 120000; // 120s
        const t = setTimeout(() => controller.abort(), timeoutMs);

        const r = await fetch(upstreamUrl, {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.MAGICFILL_BEARER}`,
                "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID,
                "CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET,
            },
            body: JSON.stringify(payload),
        });

        clearTimeout(t);

        const text = await r.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            return res.status(502).json({
                error: "upstream_not_json",
                status: r.status,
                upstreamUrl,
                sample: text.slice(0, 300),
            });
        }

        return res.status(r.status).json(data);
    } catch (err) {
        if (String(err?.name).includes("AbortError")) {
            return res.status(504).json({
                error: "upstream_timeout",
                upstreamUrl,
                timeoutMs: 120000,
            });
        }
        return res.status(500).json({
            error: "proxy_failed",
            details: String(err?.message || err),
        });
    }
}
