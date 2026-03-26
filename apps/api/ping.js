export const config = { runtime: "edge" };

export default function handler() {
    return new Response(JSON.stringify({ ok: true, from: "ping-edge" }), {
        status: 200,
        headers: { "content-type": "application/json" },
    });
}
