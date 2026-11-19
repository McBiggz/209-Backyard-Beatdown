// The site's Cloudflare Worker: serves the game, plus /turn, which hands out short-lived relay (TURN) logins so online play works
// on cell data and strict Wi-Fi. Needs two secrets on the Worker: TURN_KEY_ID and TURN_KEY_API_TOKEN (Cloudflare Realtime > TURN).
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/turn') {
      const h = { 'content-type': 'application/json', 'cache-control': 'no-store' };
      if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) return new Response(JSON.stringify({ iceServers: [], note: 'relay not set up' }), { headers: h });
      try {
        const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`, {
          method: 'POST', headers: { authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify({ ttl: 86400 }) });
        if (!r.ok) return new Response(JSON.stringify({ iceServers: [], note: 'relay error ' + r.status }), { headers: h });
        const j = await r.json(); return new Response(JSON.stringify({ iceServers: j.iceServers || [] }), { headers: h });
      } catch (e) { return new Response(JSON.stringify({ iceServers: [], note: 'relay unreachable' }), { headers: h }); }
    }
    return env.ASSETS.fetch(req);
  }
};
