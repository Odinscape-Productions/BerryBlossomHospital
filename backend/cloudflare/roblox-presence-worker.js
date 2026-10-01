const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'GET,OPTIONS','Content-Type':'application/json'};
const json=(x,s=200,extra={})=>new Response(JSON.stringify(x),{status:s,headers:{...cors,...extra}});
export default{
  async fetch(req){
    if(req.method==='OPTIONS')return new Response(null,{headers:cors});
    const u=new URL(req.url),cache=caches.default,cacheKey=new Request(u.toString(),req);
    if(u.pathname==='/health')return json({ok:true});
    const hit=await cache.match(cacheKey);if(hit)return hit;
    let response;
    if(u.pathname==='/resolve'){
      const username=(u.searchParams.get('username')||'').trim();if(!username)return json({error:'username required'},400);
      const r=await fetch('https://users.roblox.com/v1/usernames/users',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({usernames:[username],excludeBannedUsers:true})});
      const j=await r.json();response=json(j.data?.[0]||{},r.ok?200:r.status,{'Cache-Control':'public,max-age=3600'});
    }else if(u.pathname==='/presence'){
      const ids=(u.searchParams.get('ids')||'').split(',').map(Number).filter(Boolean).slice(0,100);if(!ids.length)return json({userPresences:[]});
      const r=await fetch('https://presence.roblox.com/v1/presence/users',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userIds:ids})});
      response=json(await r.json(),r.ok?200:r.status,{'Cache-Control':'public,max-age=30'});
    }else return json({error:'Not found'},404);
    if(response.ok) await cache.put(cacheKey,response.clone());return response;
  }
};
