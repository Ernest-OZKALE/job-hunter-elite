export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

    // ---- Parse body safely (Vercel may already parse JSON) ----
    let payload;
    try {
        payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch (e) {
        return res.status(400).json({
            error: "invalid_json",
            message: String(e?.message || e),
            rawType: typeof req.body,
            rawSample: typeof req.body === "string" ? req.body.slice(0, 120) : null,
        });
    }

    if (!payload || typeof payload !== "object") {
        return res.status(400).json({ error: "invalid_payload", details: "body must be JSON object" });
    }

    const upstreamUrl = "https://api.nodecore.dev/v1/magic-fill";

    // ---- Ensure env vars exist ----
    const cid = process.env.CF_ACCESS_CLIENT_ID;
    const csec = process.env.CF_ACCESS_CLIENT_SECRET;
    const bearer = process.env.MAGICFILL_BEARER;

    if (!cid || !csec || !bearer) {
        return res.status(500).json({
            error: "missing_env_vars",
            has: {
                CF_ACCESS_CLIENT_ID: !!cid,
                CF_ACCESS_CLIENT_SECRET: !!csec,
                MAGICFILL_BEARER: !!bearer,
            },
        });
    }

    // ---- Upstream timeout (critical) ----
    const controller = new AbortController();
    const timeoutMs = 25000; // 25s (adjust if needed)
    const t = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const r = await fetch(upstreamUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${bearer}`,
                "CF-Access-Client-Id": cid,
                "CF-Access-Client-Secret": csec,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        const text = await r.text();
        clearTimeout(t);

        // If upstream returns HTML (cloudflare 502 page), return a clean error
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            return res.status(502).json({
                error: "upstream_not_json",
                upstreamStatus: r.status,
                upstreamUrl,
                sample: text.slice(0, 400),
            });
        }

        return res.status(r.status).json(data);
    } catch (err) {
        clearTimeout(t);

        const isAbort = String(err?.name || "").toLowerCase().includes("abort");
        return res.status(isAbort ? 504 : 502).json({
            error: isAbort ? "upstream_timeout" : "proxy_failed",
            upstreamUrl,
            details: String(err?.message || err),
            timeoutMs,
        });
    }
}



export const config = {
    runtime: "nodejs",
    maxDuration: 60, // ou 120 si ton plan Vercel le permet
};

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

    try {
        const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

        const upstreamUrl = "https://api.nodecore.dev/v1/magic-fill";

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

        // si upstream renvoie pas du JSON (HTML cloudflare), on remonte un 502 lisible
        let data;
        try { data = JSON.parse(text); }
        catch {
            return res.status(502).json({
                error: "upstream_not_json",
                status: r.status,
                upstreamUrl,
                sample: text.slice(0, 300),
            });
        }

        return res.status(r.status).json(data);

    } catch (err) {
        // si abort
        if (String(err?.name).includes("AbortError")) {
            return res.status(504).json({
                error: "upstream_timeout",
                upstreamUrl: "https://api.nodecore.dev/v1/magic-fill",
                details: "aborted by proxy timeout",
                timeoutMs: 120000,
            });
        }
        return res.status(500).json({ error: "proxy_failed", details: String(err?.message || err) });
    }
}
