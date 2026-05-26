import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, artist, duration } = await req.json();
    if (!title) {
      return new Response(JSON.stringify({ error: 'title required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const params = new URLSearchParams({ track_name: String(title) });
    if (artist) params.set('artist_name', String(artist));
    if (duration) params.set('duration', String(Math.round(Number(duration))));

    // Try /get first (most accurate)
    let lrc: string | null = null;
    let plain: string | null = null;

    try {
      const getRes = await fetch(`https://lrclib.net/api/get?${params.toString()}`, {
        headers: { 'User-Agent': 'soul.gg (https://soul.gg)' },
      });
      if (getRes.ok) {
        const data = await getRes.json();
        lrc = data?.syncedLyrics || null;
        plain = data?.plainLyrics || null;
      }
    } catch (_) { /* fallthrough to search */ }

    if (!lrc) {
      // Fallback to search
      const searchRes = await fetch(`https://lrclib.net/api/search?${params.toString()}`, {
        headers: { 'User-Agent': 'soul.gg (https://soul.gg)' },
      });
      if (searchRes.ok) {
        const results = await searchRes.json();
        const hit = Array.isArray(results)
          ? results.find((r: any) => r.syncedLyrics) || results[0]
          : null;
        if (hit) {
          lrc = hit.syncedLyrics || null;
          plain = plain || hit.plainLyrics || null;
        }
      }
    }

    return new Response(
      JSON.stringify({ lrc, plain, found: Boolean(lrc || plain) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
