import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Extract clean YouTube URL from potentially nested/encoded URLs
function cleanUrl(url: string): string {
  // If someone pasted a downloader URL like you2downloader.com/?url=ENCODED
  try {
    const u = new URL(url);
    const nested = u.searchParams.get("url");
    if (nested) {
      return cleanUrl(decodeURIComponent(nested));
    }
  } catch {}
  return url;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url: rawUrl } = await req.json();

    if (!rawUrl) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = cleanUrl(rawUrl);
    console.log("[youtube-download] Processing URL:", url);

    // Try multiple public cobalt instances with correct API format
    const instances = [
      "https://api.cobalt.tools",
      "https://cobalt-api.ayo.tf",
      "https://cobalt.api.timelessnesses.me",
    ];

    let lastError = "";

    for (const instance of instances) {
      try {
        console.log(`[youtube-download] Trying instance: ${instance}`);
        
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

        const text = await response.text();
        console.log(`[youtube-download] ${instance} status: ${response.status}, body: ${text.substring(0, 200)}`);

        if (response.ok) {
          try {
            const data = JSON.parse(text);
            
            // Cobalt returns { status: "tunnel"|"redirect", url: "..." }
            if (data.url || data.status === "tunnel" || data.status === "redirect") {
              return new Response(JSON.stringify(data), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            }
            
            // Cobalt returns { status: "picker", picker: [...] }
            if (data.status === "picker" && data.picker) {
              return new Response(JSON.stringify(data), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              });
            }

            lastError = `${instance}: unexpected response: ${text.substring(0, 100)}`;
          } catch {
            lastError = `${instance}: invalid JSON: ${text.substring(0, 100)}`;
          }
        } else {
          lastError = `${instance}: ${response.status} ${text.substring(0, 100)}`;
        }
      } catch (e) {
        lastError = `${instance}: ${e.message}`;
        console.error(`[youtube-download] ${instance} error:`, e.message);
      }
    }

    console.log("[youtube-download] All instances failed, returning fallback. Last error:", lastError);

    // Fallback: return redirect URLs for manual download
    const encoded = encodeURIComponent(url);
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    return new Response(JSON.stringify({
      status: "fallback",
      message: "API indisponível, use um dos links abaixo",
      error: lastError,
      links: [
        { name: "Cobalt", url: `https://cobalt.tools/?url=${encoded}` },
        ...(videoId ? [{ name: "Y2Mate", url: `https://www.y2mate.com/download-youtube/${videoId}` }] : []),
        { name: "SaveFrom", url: `https://en.savefrom.net/#url=${encoded}` },
      ],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[youtube-download] Fatal error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
