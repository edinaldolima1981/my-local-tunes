import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try multiple cobalt instances
    const instances = [
      "https://api.cobalt.tools",
      "https://cobalt-api.kwiatekmiki.com",
    ];

    let lastError = "";

    for (const instance of instances) {
      try {
        const response = await fetch(`${instance}/`, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            downloadMode: "auto",
            audioFormat: "mp3",
            videoQuality: "720",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        lastError = `${instance}: ${response.status} ${await response.text()}`;
      } catch (e) {
        lastError = `${instance}: ${e.message}`;
      }
    }

    // Fallback: return redirect URLs for manual download
    const encoded = encodeURIComponent(url);
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    return new Response(JSON.stringify({
      status: "fallback",
      message: "API indisponível, use um dos links abaixo",
      links: [
        { name: "Cobalt", url: `https://cobalt.tools/?url=${encoded}` },
        ...(videoId ? [{ name: "Y2Mate", url: `https://www.y2mate.com/download-youtube/${videoId}` }] : []),
        { name: "SaveFrom", url: `https://en.savefrom.net/#url=${encoded}` },
      ],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
