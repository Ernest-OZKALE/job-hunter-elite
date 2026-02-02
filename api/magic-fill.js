export const config = { runtime: "edge" };

export default async function handler(req) {
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 200, headers: corsHeaders() });
    }

    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "method_not_allowed" }), {
            status: 405,
            headers: { ...corsHeaders(), "content-type": "application/json" },
        });
    }

    // ✅ Lecture brute
    const raw = await req.text();

    // 🔎 DEBUG si vide
    if (!raw || raw.trim().length === 0) {
        return new Response(JSON.stringify({
            error: "empty_body",
            hint: "Le body n'arrive pas jusqu'à la fonction (ou est vidé)",
        }), {
            status: 400,
            headers: { ...corsHeaders(), "content-type": "application/json" },
        });
    }

    // ✅ JSON parse manuel (plus tolérant, et on peut montrer la cause)
    let payload;
    try {
        // Protection BOM (très courant sous Windows)
        const cleaned = raw.replace(/^\uFEFF/, "");
        payload = JSON.parse(cleaned);
    } catch (e) {
        return new Response(JSON.stringify({
            error: "invalid_json",
            message: String(e?.message || e),
            rawSample: raw.slice(0, 200),
            rawLen: raw.length,
        }), {
            status: 400,
            headers: { ...corsHeaders(), "content-type": "application/json" },
        });
    }

    const upstreamUrl = "https://api.nodecore.dev/v1/magic-fill";

    try {
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
        return new Response(text, {
            status: r.status,
            headers: {
                ...corsHeaders(),
                "content-type": r.headers.get("content-type") || "text/plain",
            },
        });
    } catch (e) {
        return new Response(JSON.stringify({
            error: "proxy_failed",
            details: String(e?.message || e),
        }), {
            status: 502,
            headers: { ...corsHeaders(), "content-type": "application/json" },
        });
    }
}

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
}
