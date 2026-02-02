export default async function handler(req, res) {
    // CORS setup for Vercel managed functions (optional but good practice)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // The upstream backend (Cloudflare Tunnel)
    const upstream = "https://api.nodecore.dev/v1/magic-fill";

    try {
        const { text, source_url } = req.body;

        // Validate input
        if (!text) {
            return res.status(400).json({ error: "Missing 'text' in request body" });
        }

        const outputResponse = await fetch(upstream, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Inject secrets server-side
                "Authorization": `Bearer ${process.env.MAGICFILL_BEARER || ""}`,
                "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID || "",
                "CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET || "",
            },
            body: JSON.stringify({
                text,
                source_url: source_url || "https://job-hunter-elite.vercel.app"
            }),
        });

        // Handle upstream errors
        // Handle upstream errors
        if (!outputResponse.ok) {
            const errorText = await outputResponse.text();
            console.error(`Upstream Error (${outputResponse.status}):`, errorText);

            let errorDetails = errorText;
            try {
                const jsonError = JSON.parse(errorText);
                errorDetails = jsonError;
            } catch (e) {
                // Not JSON, keep text
            }

            return res.status(outputResponse.status).json({
                error: "Upstream Service Error",
                statusCode: outputResponse.status,
                details: errorDetails,
                upstreamUrl: upstream
            });
        }

        // Forward the response
        const data = await outputResponse.json();
        return res.status(200).json(data);

    } catch (e) {
        console.error("Proxy Error:", e);
        return res.status(500).json({ error: "proxy_failed", details: String(e) });
    }
}
