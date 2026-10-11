const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization,content-type',
  'Access-Control-Allow-Methods':'GET,POST,OPTIONS',
  'Content-Type':'application/json'
};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});

async function authUser(req,env){
  const auth=req.headers.get('authorization')||'';
  if(!auth.startsWith('Bearer ')) return null;
  const r=await fetch(`${env.SUPABASE_URL}/auth/v1/user`,{headers:{apikey:env.SUPABASE_ANON_KEY,authorization:auth}});
  if(!r.ok) return null;
  return await r.json();
}
async function rest(env,path,opts={}){
  const headers={apikey:env.SUPABASE_SERVICE_ROLE_KEY,authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'content-type':'application/json',...(opts.headers||{})};
  return fetch(`${env.SUPABASE_URL}/rest/v1/${path}`,{...opts,headers});
}
async function quizFor(env,department){
  const general=await env.QUIZ_BANK.get('quiz:general',{type:'json'});
  const dept=await env.QUIZ_BANK.get(`quiz:${department}`,{type:'json'});
  if(!general||!dept) return null;
  return [...general.questions.slice(0,5),...dept.questions.slice(0,5)];
}
export default{
  async fetch(req,env){
    if(req.method==='OPTIONS') return new Response(null,{headers:cors});
    const u=new URL(req.url);
    if(u.pathname==='/health') return json({ok:true});
    if(u.pathname==='/quiz'&&req.method==='GET'){
      const department=u.searchParams.get('department')||'';
      const questions=await quizFor(env,department);
      if(!questions) return json({error:'Quiz bank not configured for this department'},404);
      return json({questions:questions.map(({id,text,options})=>({id,text,options}))});
    }
    if(u.pathname==='/submit'&&req.method==='POST'){
      const user=await authUser(req,env);if(!user) return json({error:'Invalid or expired session'},401);
      const body=await req.json();
      const department=String(body.department||''),experience=String(body.experience||'').trim(),written=String(body.written_answer||'').trim(),answers=Array.isArray(body.answers)?body.answers:[];
      if(!department||!experience||!written) return json({error:'Application is incomplete'},400);
      const questions=await quizFor(env,department);if(!questions) return json({error:'Quiz bank not configured'},404);
      const qmap=Object.fromEntries(questions.map(q=>[q.id,q]));
      let total=0,correct=0;const stored=[];
      for(const a of answers){const q=qmap[a.id];if(q){total++;const idx=Number(a.choiceIndex),ok=idx===Number(q.correctIndex);if(ok)correct++;stored.push({id:a.id,question:q.text,choiceIndex:idx,selected:q.options[idx]||'',correctOption:q.options[Number(q.correctIndex)]||'',isCorrect:ok});}}
      if(total!==questions.length) return json({error:'Every assessment question must be answered'},400);
      const score=Math.round(correct/total*100),status=score>=70?'pending':'declined';
      const profileRes=await rest(env,`profiles?id=eq.${user.id}&select=display_name`);const profile=(await profileRes.json())[0];if(!profile)return json({error:'Profile not found'},404);
      const insert=await rest(env,'applications',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({user_id:user.id,applicant_name:profile.display_name,department,experience,written_answer:written,score,status,answers:stored})});
      if(!insert.ok) return json({error:'Could not save application',detail:await insert.text()},500);
      await rest(env,`profiles?id=eq.${user.id}`,{method:'PATCH',body:JSON.stringify({account_status:status,department,updated_at:new Date().toISOString()})});
      return json({status});
    }
    return json({error:'Not found'},404);
  }
};
