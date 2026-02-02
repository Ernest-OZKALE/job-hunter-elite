export const config = { runtime: "edge" };

export default async function handler(req) {
    // Preflight CORS
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 200,
            headers: corsHeaders(),
        });
    }

    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "method_not_allowed" }), {
            status: 405,
            headers: { ...corsHeaders(), "content-type": "application/json" },
        });
    }

    let payload;
    try {
        payload = await req.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: "invalid_json" }), {
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

        // Renvoie tel quel (JSON ou non)
        return new Response(text, {
            status: r.status,
            headers: { ...corsHeaders(), "content-type": r.headers.get("content-type") || "text/plain" },
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: "proxy_failed", details: String(e?.message || e) }), {
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
