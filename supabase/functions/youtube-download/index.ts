import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function cleanUrl(url: string): string {
  try {
    const u = new URL(url);
    const nested = u.searchParams.get("url");
    if (nested) return cleanUrl(decodeURIComponent(nested));
  } catch {}
  return url;
}

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
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
    const videoId = extractVideoId(url);
    console.log("[youtube-download] Processing URL:", url, "videoId:", videoId);

    if (!videoId) {
      return new Response(JSON.stringify({ 
        error: "URL inválida. Cole um link de vídeo do YouTube (ex: youtube.com/watch?v=...)" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const encoded = encodeURIComponent(url);

    // Return direct links to reliable download sites
    return new Response(JSON.stringify({
      status: "redirect",
      url: `https://ssyoutube.com/watch?v=${videoId}`,
      alternatives: [
        { name: "SSYouTube", url: `https://ssyoutube.com/watch?v=${videoId}` },
        { name: "Y2Mate", url: `https://www.y2mate.com/youtube/${videoId}` },
        { name: "SaveFrom", url: `https://en.savefrom.net/1-youtube-video-downloader-394/#url=${encoded}` },
        { name: "9xBuddy", url: `https://9xbuddy.xyz/process?url=${encoded}` },
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
