export default async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

    // Helper: read raw body if needed
    const readRawBody = async (req) => {
        return await new Promise((resolve, reject) => {
            let data = "";
            req.setEncoding("utf8");
            req.on("data", (chunk) => (data += chunk));
            req.on("end", () => resolve(data));
            req.on("error", reject);
        });
    };

    try {
        let payload;

        // 1) Essaye avec req.body si dispo
        if (req.body !== undefined) {
            if (typeof req.body === "string") {
                payload = JSON.parse(req.body);
            } else if (Buffer.isBuffer(req.body)) {
                payload = JSON.parse(req.body.toString("utf8"));
            } else {
                // objet déjà parsé
                payload = req.body;
            }
        } else {
            // 2) Sinon, lis le stream
            const raw = await readRawBody(req);
            payload = JSON.parse(raw);
        }

        if (!payload || typeof payload !== "object") {
            return res.status(400).json({
                error: "invalid_payload",
                details: "body must be a JSON object",
                receivedType: typeof payload,
            });
        }

        const upstreamUrl = "https://api.nodecore.dev/v1/magic-fill";

        const r = await fetch(upstreamUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.MAGICFILL_BEARER}`,
                "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID,
                "CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET,
            },
            body: JSON.stringify(payload),
        });

        const text = await r.text();

        // Upstream parfois renvoie HTML (cloudflare 5xx)
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
        // 🔥 diagnostic si c’est un parsing JSON
        const msg = String(err?.message || err);

        // essaye de récupérer un raw body pour debug (si pas déjà consommé)
        let rawSample = null;
        try {
            const raw = await readRawBody(req);
            rawSample = {
                length: raw.length,
                head: raw.slice(0, 200),
            };
        } catch {
            // ignore
        }

        return res.status(500).json({
            error: "proxy_failed",
            details: msg,
            debug: {
                contentType: req.headers["content-type"],
                hasReqBody: req.body !== undefined,
                reqBodyType: req.body === undefined ? null : (Buffer.isBuffer(req.body) ? "buffer" : typeof req.body),
                rawSample,
            },
        });
    }
}
