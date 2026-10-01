
(async function(){
  const Data=window.BBData, root=document.getElementById('root'), modalRoot=document.getElementById('modalRoot'), toastRoot=document.getElementById('toastRoot');
  const DEPARTMENTS=['A&E','General Medicine','Surgery','Cardiology','Orthopaedics','Radiology','Paediatrics','Maternity & Women’s Health','Laboratory Services','Pharmacy','Nursing','Dental'];
  const DEPT_SLUG={'A&E':'ae','General Medicine':'general-medicine','Surgery':'surgery','Cardiology':'cardiology','Orthopaedics':'orthopaedics','Radiology':'radiology','Paediatrics':'paediatrics','Maternity & Women’s Health':'maternity','Laboratory Services':'laboratory','Pharmacy':'pharmacy','Nursing':'nursing','Dental':'dental'};
  const BANNERS=['blossom-courtyard','pastel-interior','strawberry-garden','halloween-autumn','moonlit-spooky','christmas-snow'];
  const BANNER_LABEL={'blossom-courtyard':'Blossom Courtyard','pastel-interior':'Pastel Hospital Interior','strawberry-garden':'Strawberry Garden','halloween-autumn':'Halloween Autumn','moonlit-spooky':'Moonlit Spooky Courtyard','christmas-snow':'Christmas Snow'};
  const FRAMES=['berry-blossom','medical','senior-staff','halloween','christmas','birthday'];
  const BADGES=['first-shift','10-hours','bls-passed','emergency','event','staff-week','staff-month'];
  const ACTIVITIES=['Available','With Patient','In Training','On Break','Responding to Emergency','In Surgery','On Ambulance Call','Unavailable'];
  const SECTIONS=[
    ['hospital','🏥','Hospital Live','See who is working and how each department is covered.'],
    ['training','🎓','Training','Book sessions, follow progress and manage training.'],
    ['applications','📋','Applications','Apply, track applications or review applicants.'],
    ['staff','👥','Staff Directory','Find staff and open their full profile cards.'],
    ['rota','🗓️','Rota','View shifts, overtime and applications.'],
    ['patients','🩺','RP Patients','Manage fictional roleplay patient cases only.'],
    ['ems','🚑','EMS & Codes','Dispatch calls and run emergency roleplay drills.'],
    ['events','🎃','Events','Join community events and scenario nights.'],
    ['rewards','🏅','Rewards','View achievements, recognition and progression.']
  ];
  let state={page:'home',data:null,presence:{},staffDept:'All',staffRole:'All',staffSearch:'',rotaDept:'All',patientUnit:'All',trainingDept:'All'};
  const legacyGender={Liam:'male',Sophie:'female',Amelia:'female',Isla:'female',Noah:'male',Chloe:'female',Mason:'male',Grace:'female',Rosie:'female'};

  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function toast(msg){toastRoot.innerHTML=`<div class="toast">${esc(msg)}</div>`;setTimeout(()=>toastRoot.innerHTML='',2200)}
  function fmt(v){try{return new Date(v).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}catch{return v||'TBC'}}
  function currentStatus(id=Data.profile?.id){return state.data?.status?.find(x=>x.user_id===id)||{on_shift:false,activity:'Unavailable'}}
  function themeName(t){return t==='halloween'?'Halloween':t==='christmas'?'Christmas':'Berry Blossom'}
  function bannerFor(p){return p?.banner_key&&BANNERS.includes(p.banner_key)?p.banner_key:defaultBannerFor(p)}
  function defaultBannerFor(p){if(!p)return'blossom-courtyard';const theme=state.data?.settings?.theme;if(theme==='halloween')return'halloween-autumn';if(theme==='christmas')return'christmas-snow';const idx=Math.abs([...String(p.id||p.display_name||'x')].reduce((a,c)=>a+c.charCodeAt(0),0))%3;return['blossom-courtyard','pastel-interior','strawberry-garden'][idx]}
  function deptSlug(dep){return DEPT_SLUG[dep]||'ae'}
  function avatarKey(p){
    const val=String(p?.avatar_key||'');
    if(/^(ae|general-medicine|surgery|cardiology|orthopaedics|radiology|paediatrics|maternity|laboratory|pharmacy|nursing|dental)-(male|female|mascot)$/.test(val)) return val;
    const dep=deptSlug(p?.department);
    const role=legacyGender[p?.display_name]||'female';
    return `${dep}-${role}`;
  }
  function avatarUrl(p){return `assets/avatars/${avatarKey(p)}.webp`}
  function presenceLabel(p){
    const pr=state.presence[p.id]; if(!pr)return p.roblox_username?['Not checked','grey']:['Offline','grey'];
    const place=String(pr.placeId||''),game=String(pr.gameId||''),cfg=Data.getConfig();
    const maple=(cfg.maplePlaceIds||[]).map(String).includes(place),cherry=state.data?.settings?.cherry_game_id&&game===String(state.data.settings.cherry_game_id);
    if(cherry)return['Cherry Blossom','green']; if(maple)return['In Maple','purple']; if(Number(pr.userPresenceType)===2)return['In Game','blue']; if(Number(pr.userPresenceType)===1)return['Online','green']; return['Offline','grey']
  }
  function applyTheme(t){document.body.dataset.theme=t||'standard';window.BBParticles?.setTheme(t||'standard')}
  function isAdmin(){return Data.profile?.role==='admin'} function isManager(){return isAdmin()||Data.profile?.is_head}

  function openModal(title,body){
    modalRoot.innerHTML=`<div class="modal-bg" id="modalBg"><div class="modal"><div class="modal-head"><h3>${esc(title)}</h3><button class="icon-btn" id="modalClose">✕</button></div>${body}</div></div>`;
    document.getElementById('modalClose').onclick=()=>modalRoot.innerHTML='';
    document.getElementById('modalBg').onclick=e=>{if(e.target.id==='modalBg')modalRoot.innerHTML=''}
  }
  function closeModal(){modalRoot.innerHTML=''}

  async function boot(){
    try{
      await Data.init();
      if(!Data.profile){renderAuth();return}
      if(Data.profile.account_status!=='active'){await renderApplicationGate();return}
      await enterApp();
    }catch(e){console.error(e);renderAuth();toast(e.message||'Could not start the app')}
  }

  function renderAuth(){
    applyTheme('standard');
    root.innerHTML=`<div class="app auth"><div class="auth-card"><div class="eyebrow">Berry Blossom Medical Centre</div><h1>Welcome</h1><p>A caring community, a brighter tomorrow.</p><div class="seg"><button class="active" data-auth="sign">Sign In</button><button data-auth="create">Create Account</button></div><form id="signForm" class="form"><div class="field"><label>Username</label><input id="signUser" autocomplete="username" placeholder="Username"></div><div class="field"><label>Password</label><input id="signPass" type="password" autocomplete="current-password" placeholder="Password"></div><button class="btn primary full">Sign In</button></form><form id="createForm" class="form hidden"><div class="field"><label>Display name</label><input id="regName" required></div><div class="field"><label>Username</label><input id="regUser" required></div><div class="field"><label>Date of birth</label><input id="regDob" type="date" required></div><div class="field"><label>Password</label><input id="regPass" type="password" minlength="6" required></div><button class="btn primary full">Create Account</button></form><div class="notice">${Data.isLive()?'Live backend connected.':'Demo mode. Use admin / admin or rosie / rosie, or connect Supabase in Backend Connection.'}</div><button class="btn secondary full" id="backendBtn">Backend Connection</button></div></div>`;
    document.querySelectorAll('[data-auth]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-auth]').forEach(x=>x.classList.toggle('active',x===b));signForm.classList.toggle('hidden',b.dataset.auth!=='sign');createForm.classList.toggle('hidden',b.dataset.auth!=='create')});
    signForm.onsubmit=async e=>{e.preventDefault();try{await Data.signIn(signUser.value.trim(),signPass.value);Data.profile.account_status==='active'?await enterApp():await renderApplicationGate()}catch(err){toast(err.message)}};
    createForm.onsubmit=async e=>{e.preventDefault();try{await Data.signUp({display_name:regName.value.trim(),username:regUser.value.trim(),dob:regDob.value,password:regPass.value});await renderApplicationGate()}catch(err){toast(err.message)}};
    backendBtn.onclick=backendModal;
  }

  function backendModal(){
    const c=Data.getConfig();
    openModal('Backend Connection',`<div class="notice">Use public client settings only. Never paste a Supabase service-role key, Roblox password or Roblox cookie here.</div><div class="form" style="margin-top:10px"><div class="field"><label>Supabase project URL</label><input id="cfgUrl" value="${esc(c.supabaseUrl||'')}"></div><div class="field"><label>Supabase anon key</label><textarea id="cfgAnon">${esc(c.supabaseAnonKey||'')}</textarea></div><div class="field"><label>Quiz Worker URL</label><input id="cfgQuiz" value="${esc(c.quizWorkerUrl||'')}"></div><div class="field"><label>Roblox Worker URL</label><input id="cfgRoblox" value="${esc(c.robloxWorkerUrl||'')}"></div><button class="btn primary full" id="cfgSave">Save and reload</button><button class="btn secondary full" id="cfgClear">Use demo mode</button></div>`);
    cfgSave.onclick=()=>{Data.setBackendConfig({mode:'auto',supabaseUrl:cfgUrl.value.trim(),supabaseAnonKey:cfgAnon.value.trim(),quizWorkerUrl:cfgQuiz.value.trim(),robloxWorkerUrl:cfgRoblox.value.trim(),maplePlaceIds:c.maplePlaceIds||['8704997000']});location.reload()};
    cfgClear.onclick=()=>{Data.clearBackendConfig();location.reload()}
  }

  async function renderApplicationGate(){
    const p=Data.profile,status=await Data.applicationStatus();
    if(p.account_status==='active'){await enterApp();return}
    if(status?.status==='pending'){root.innerHTML=`<div class="app auth"><div class="auth-card"><div class="eyebrow">Application submitted</div><h1>Pending Review</h1><p>Your assessment reached the pass threshold and management now has your full application. The score stays hidden while pending.</p><button class="btn secondary full" id="gateSignout">Sign out</button></div></div>`;gateSignout.onclick=async()=>{await Data.signOut();renderAuth()};return}
    if(status?.status==='declined'){root.innerHTML=`<div class="app auth"><div class="auth-card"><div class="eyebrow">Application result</div><h1>Application not accepted</h1><p>You can submit a fresh application when you are ready.</p><button class="btn primary full" id="gateReapply">Start new application</button><button class="btn secondary full" id="gateSignout">Sign out</button></div></div>`;gateReapply.onclick=startApplication;gateSignout.onclick=async()=>{await Data.signOut();renderAuth()};return}
    startApplication();
  }

  let appDraft={step:1,department:'A&E',experience:'',written:'',questions:[],answers:{}};
  function startApplication(){appDraft={step:1,department:'A&E',experience:'',written:'',questions:[],answers:{}};renderAppStep()}
  async function renderAppStep(){
    applyTheme('standard');
    if(appDraft.step===1){
      root.innerHTML=`<div class="app auth"><div class="auth-card"><div class="eyebrow">Application · 1 of 3</div><h1>Join Berry Blossom</h1><div class="form"><div class="field"><label>Department</label><select id="appDept">${DEPARTMENTS.map(d=>`<option>${esc(d)}</option>`).join('')}</select></div><div class="field"><label>Roleplay experience</label><textarea id="appExperience"></textarea></div><div class="field"><label>Why do you want to join?</label><textarea id="appWritten"></textarea></div><button class="btn primary full" id="appNext">Medical assessment</button></div></div></div>`;
      appNext.onclick=async()=>{appDraft.department=appDept.value;appDraft.experience=appExperience.value.trim();appDraft.written=appWritten.value.trim();if(!appDraft.experience||!appDraft.written)return toast('Complete both written sections');try{appDraft.questions=await Data.getQuiz(appDraft.department);appDraft.step=2;renderAppStep()}catch(e){toast(e.message)}}
    } else if(appDraft.step===2){
      root.innerHTML=`<div class="app auth" style="place-items:start center"><div class="auth-card" style="margin-top:18px"><div class="eyebrow">Application · 2 of 3</div><h1>Medical assessment</h1><p>10 roleplay-focused questions. You need 70% to reach management review.</p><div class="list">${appDraft.questions.map((q,i)=>`<div class="card" style="box-shadow:none"><b>${i+1}. ${esc(q.text)}</b><div class="form" style="margin-top:8px">${q.options.map((o,j)=>`<label style="display:flex;gap:7px;font-size:11px"><input type="radio" name="q${i}" value="${j}">${esc(o)}</label>`).join('')}</div></div>`).join('')}</div><button class="btn primary full" id="quizNext">Review</button></div></div>`;
      quizNext.onclick=()=>{for(let i=0;i<appDraft.questions.length;i++){const el=document.querySelector(`input[name=q${i}]:checked`);if(!el)return toast('Answer every question');appDraft.answers[i]=Number(el.value)}appDraft.step=3;renderAppStep()}
    } else {
      root.innerHTML=`<div class="app auth"><div class="auth-card"><div class="eyebrow">Application · 3 of 3</div><h1>Review and submit</h1><div class="card" style="box-shadow:none"><b>${esc(appDraft.department)}</b><p>${esc(appDraft.experience)}</p></div><div class="notice">If your assessment reaches 70%, your full application moves to management review. Applicants do not see the score while pending.</div><button class="btn primary full" id="appSubmit" style="margin-top:10px">Submit application</button></div></div>`;
      appSubmit.onclick=async()=>{try{await Data.submitApplication({department:appDraft.department,experience:appDraft.experience,written_answer:appDraft.written,answers:appDraft.questions.map((q,i)=>({id:q.id,choiceIndex:appDraft.answers[i]}))});await renderApplicationGate()}catch(e){toast(e.message)}}
    }
  }

  async function enterApp(){
    await refresh();
    Data.subscribe(async()=>{try{await refresh(false)}catch{}});
  }

  async function refresh(render=true){
    state.data=await Data.loadState(); applyTheme(state.data.settings?.theme||'standard');
    state.presence=await Data.robloxPresence(state.data.profiles||[]);
    if(render) renderShell();
    else renderPage();
  }

  function topAvatar(){return avatarUrl(Data.profile)}
  function renderShell(){
    root.innerHTML=`<div class="app"><div class="drawer-backdrop" id="drawerBack"></div><aside class="drawer" id="drawer"><div class="drawer-head"><img src="assets/ui/icon-192.png"><div><b>Berry Blossom</b><small>MEDICAL CENTRE</small></div></div><div class="menu-list"><button class="menu-btn" data-page="home"><span class="menu-ico">🏠</span><span>Home</span></button>${SECTIONS.map(s=>`<button class="menu-btn" data-page="${s[0]}"><span class="menu-ico">${s[1]}</span><span>${s[2]}</span></button>`).join('')}</div></aside><div class="shell"><header class="topbar"><button class="icon-btn" id="menuOpen">☰</button><div class="brand"><b>Berry Blossom</b><small>MEDICAL CENTRE</small></div><div class="top-actions"><button class="profile-top-btn" id="profileTop"><img src="${topAvatar()}"></button><button class="icon-btn" id="settingsTop">⚙</button></div></header><main id="content" class="content"></main></div></div>`;
    menuOpen.onclick=toggleDrawer;drawerBack.onclick=closeDrawer;profileTop.onclick=()=>go('profile');settingsTop.onclick=settingsModal;
    document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{go(b.dataset.page);closeDrawer()});
    renderPage()
  }
  function toggleDrawer(){drawer.classList.toggle('open');drawerBack.classList.toggle('open')}
  function closeDrawer(){drawer.classList.remove('open');drawerBack.classList.remove('open')}
  function go(page){state.page=page;renderPage();scrollTo({top:0,behavior:'smooth'})}

  function titleBlock(kicker,title,desc){return `<div class="page-title"><div class="eyebrow">${esc(kicker)}</div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div>`}
  function renderPage(){
    document.querySelectorAll('.menu-btn').forEach(b=>b.classList.toggle('active',b.dataset.page===state.page));
    const fn={home:renderHome,hospital:renderHospital,training:renderTraining,applications:renderApplications,staff:renderStaff,rota:renderRota,patients:renderPatients,ems:renderEms,events:renderEvents,rewards:renderRewards,profile:renderProfile}[state.page]||renderHome;
    fn()
  }

  function renderHome(){
    const p=Data.profile,theme=state.data.settings.theme||'standard';
    content.innerHTML=`<div class="welcome"><div class="welcome-copy"><div class="eyebrow">${themeName(theme)} Theme</div><h1>Welcome back, ${esc(p.display_name)}.</h1><p>This is your main welcome page. Choose where you want to go next.</p></div></div><div class="section-grid">${SECTIONS.map(s=>`<button class="section-card" data-home-go="${s[0]}"><span class="icon">${s[1]}</span><b>${s[2]}</b><small>${s[3]}</small></button>`).join('')}</div>`;
    document.querySelectorAll('[data-home-go]').forEach(b=>b.onclick=()=>go(b.dataset.homeGo))
  }

  function renderHospital(){
    const statuses=state.data.status||[],active=state.data.profiles.filter(p=>currentStatus(p.id).on_shift),targets=state.data.settings.coverage_targets||{};
    content.innerHTML=titleBlock('Live hospital','Hospital Live','One clean overview of who is working and where coverage stands.')+`<div class="card"><div class="card-head"><div><h2>My shift status</h2><p>${esc(currentStatus().activity)}</p></div><span class="pill ${currentStatus().on_shift?'green':'grey'}">${currentStatus().on_shift?'On shift':'Off shift'}</span></div><div class="select-wrap"><label>Current activity</label><select id="activitySelect">${ACTIVITIES.map(a=>`<option ${a===currentStatus().activity?'selected':''}>${a}</option>`).join('')}</select></div><button class="btn primary full" id="clockBtn">${currentStatus().on_shift?'End shift':'Start shift'}</button></div><div class="card"><div class="card-head"><div><h2>Current staff</h2><p>${active.length} staff currently clocked in.</p></div></div><div class="list">${active.map(p=>staffRow(p)).join('')||'<div class="notice">Nobody is currently clocked in.</div>'}</div></div><div class="card"><div class="card-head"><div><h2>Department coverage</h2><p>Live staffing against management targets.</p></div>${isManager()?'<button class="btn secondary" id="coverageEdit">Edit</button>':''}</div><div class="list">${Object.entries(targets).map(([dep,target])=>{const n=active.filter(p=>p.department===dep).length;return`<div class="row"><div class="meta"><b>${esc(dep)}</b><small>${n>=target?'Covered':'Needs cover'}</small></div><span class="pill ${n>=target?'green':'orange'}">${n}/${target}</span></div>`}).join('')}</div></div>`;
    activitySelect.onchange=async()=>{try{await Data.setActivity(activitySelect.value);await refresh(false)}catch(e){toast(e.message)}};
    clockBtn.onclick=async()=>{try{await Data.clockToggle(activitySelect.value);await refresh(false)}catch(e){toast(e.message)}};
    if(document.getElementById('coverageEdit'))coverageEdit.onclick=coverageModal;
    bindStaffButtons()
  }
  function coverageModal(){
    const targets=state.data.settings.coverage_targets||{};
    openModal('Department coverage',`<div class="form">${Object.entries(targets).map(([d,n],i)=>`<div class="field"><label>${esc(d)}</label><input data-cov="${esc(d)}" type="number" min="0" value="${n}"></div>`).join('')}<button class="btn primary full" id="coverageSave">Save targets</button></div>`);
    coverageSave.onclick=async()=>{const next={};document.querySelectorAll('[data-cov]').forEach(e=>next[e.dataset.cov]=Number(e.value||0));try{await Data.setCoverage(next);closeModal();await refresh(false)}catch(e){toast(e.message)}}
  }

  function renderTraining(){
    let list=state.data.trainings||[];if(state.trainingDept!=='All')list=list.filter(t=>t.department===state.trainingDept);
    content.innerHTML=titleBlock('Learning','Training','Training lives here, not scattered around the rest of the app.')+`<div class="card"><div class="select-wrap"><label>Training category</label><select id="trainingFilter"><option>All</option>${['General','Emergency Response',...DEPARTMENTS].map(d=>`<option ${d===state.trainingDept?'selected':''}>${esc(d)}</option>`).join('')}</select></div>${isManager()?'<button class="btn secondary full" id="trainingCreate">Create training session</button>':''}</div><div class="card"><div class="list">${list.map(t=>{const joined=state.data.training_attendance.some(a=>a.training_id===t.id&&a.user_id===Data.profile.id);return`<div class="row"><img class="thumb" src="assets/badges/bls-passed.webp"><div class="meta"><b>${esc(t.title)}</b><small>${esc(t.department)} · ${fmt(t.starts_at)} · ${esc(t.location||'Training Centre')}</small></div><button class="btn ${joined?'secondary':'primary'}" data-training="${t.id}">${joined?'Leave':'Join'}</button></div>`}).join('')||'<div class="notice">No training sessions match this filter.</div>'}</div></div>`;
    trainingFilter.onchange=()=>{state.trainingDept=trainingFilter.value;renderTraining()};
    document.querySelectorAll('[data-training]').forEach(b=>b.onclick=async()=>{try{await Data.joinTraining(b.dataset.training);await refresh(false)}catch(e){toast(e.message)}});
    if(document.getElementById('trainingCreate'))trainingCreate.onclick=createTrainingModal
  }
  function createTrainingModal(){openModal('Create training',`<div class="form"><div class="field"><label>Title</label><input id="trTitle"></div><div class="field"><label>Department</label><select id="trDept">${['General','Emergency Response',...DEPARTMENTS].map(d=>`<option>${esc(d)}</option>`).join('')}</select></div><div class="field"><label>Starts</label><input id="trStart" type="datetime-local"></div><div class="field"><label>Capacity</label><input id="trCap" type="number" value="12"></div><div class="field"><label>Location</label><input id="trLoc" value="Training Centre"></div><button class="btn primary full" id="trSave">Create session</button></div>`);trSave.onclick=async()=>{try{await Data.createTraining({title:trTitle.value||'Training Session',department:trDept.value,starts_at:new Date(trStart.value).toISOString(),capacity:Number(trCap.value||12),location:trLoc.value||'Training Centre'});closeModal();await refresh(false)}catch(e){toast(e.message)}}}

  function renderApplications(){
    const apps=state.data.applications||[];
    if(isAdmin()){
      content.innerHTML=titleBlock('Management','Applications','Review applicants without mixing the workflow into other pages.')+`<div class="card"><div class="select-wrap"><label>Department</label><select id="appAdminFilter"><option>All Departments</option>${DEPARTMENTS.map(d=>`<option>${esc(d)}</option>`).join('')}</select></div><div id="appAdminList" class="list"></div></div>`;appAdminFilter.onchange=renderAdminApps;renderAdminApps();return
    }
    content.innerHTML=titleBlock('Applications','Applications','Your application information and future application tools live here.')+`<div class="card"><h2>Staff account active</h2><p>Your Berry Blossom account is active. Your application score is ${Data.profile.application_score??'recorded privately'}.</p></div>`
  }
  function renderAdminApps(){const dep=appAdminFilter.value;const apps=(state.data.applications||[]).filter(a=>dep==='All Departments'||a.department===dep);appAdminList.innerHTML=apps.map(a=>`<button class="row" data-app="${a.id}" style="width:100%;text-align:left"><div class="meta"><b>${esc(a.applicant_name)}</b><small>${esc(a.department)} · submitted ${fmt(a.submitted_at)}</small></div><span class="pill blue">${a.score}%</span></button>`).join('')||'<div class="notice">No pending applications.</div>';document.querySelectorAll('[data-app]').forEach(b=>b.onclick=()=>reviewAppModal(b.dataset.app))}
  function reviewAppModal(id){const a=state.data.applications.find(x=>x.id===id);openModal('Application Review',`<div class="metrics"><div class="metric"><b>${a.score}%</b><span>Assessment</span></div><div class="metric"><b>${esc(a.department)}</b><span>Department</span></div></div><div class="card" style="box-shadow:none"><h3>Experience</h3><p>${esc(a.experience)}</p></div><div class="card" style="box-shadow:none"><h3>Written response</h3><p>${esc(a.written_answer)}</p></div><div class="field"><label>Management notes</label><textarea id="reviewNotes"></textarea></div><div class="grid2" style="margin-top:10px"><button class="btn danger" id="reviewDecline">Decline</button><button class="btn primary" id="reviewApprove">Approve</button></div>`);reviewDecline.onclick=()=>reviewDecision('declined');reviewApprove.onclick=()=>reviewDecision('approved');async function reviewDecision(decision){try{await Data.reviewApplication(id,decision,reviewNotes.value);closeModal();await refresh(false)}catch(e){toast(e.message)}}}

  function renderStaff(){
    const roles=[...new Set(state.data.profiles.map(p=>p.rank).filter(Boolean))].sort();
    content.innerHTML=titleBlock('Community','Staff Directory','Use straightforward dropdowns and search, then open full member profiles.')+`<div class="card"><div class="field"><label>Search</label><input id="staffSearch" value="${esc(state.staffSearch)}" placeholder="Search staff..."></div><div class="grid2" style="margin-top:10px"><div class="select-wrap"><label>Department</label><select id="staffDept"><option>All</option>${DEPARTMENTS.map(d=>`<option ${d===state.staffDept?'selected':''}>${esc(d)}</option>`).join('')}</select></div><div class="select-wrap"><label>Role</label><select id="staffRole"><option>All</option>${roles.map(r=>`<option ${r===state.staffRole?'selected':''}>${esc(r)}</option>`).join('')}</select></div></div></div><div id="staffList" class="list"></div>`;
    const rer=()=>{state.staffSearch=staffSearch.value;state.staffDept=staffDept.value;state.staffRole=staffRole.value;let ps=state.data.profiles.filter(p=>(state.staffDept==='All'||p.department===state.staffDept)&&(state.staffRole==='All'||p.rank===state.staffRole)&&[p.display_name,p.rank,p.department].join(' ').toLowerCase().includes(state.staffSearch.toLowerCase()));staffList.innerHTML=ps.map(p=>staffRow(p)).join('')||'<div class="notice">No staff match those filters.</div>';bindStaffButtons()};staffSearch.oninput=rer;staffDept.onchange=rer;staffRole.onchange=rer;rer()
  }
  function staffRow(p){const st=currentStatus(p.id),pr=presenceLabel(p);return`<button class="row staff-card" data-staff="${p.id}" style="width:100%;text-align:left"><img class="avatar-square" src="${avatarUrl(p)}"><div class="meta"><b>${esc(p.display_name)}</b><small>${esc(p.rank)} · ${esc(p.department||'Unassigned')}</small></div><span class="pill ${st.on_shift?'green':pr[1]}">${st.on_shift?'On Shift':pr[0]}</span></button>`}
  function bindStaffButtons(){document.querySelectorAll('[data-staff]').forEach(b=>b.onclick=()=>profilePopup(b.dataset.staff))}
  function profilePopup(id){
    const p=state.data.profiles.find(x=>x.id===id);if(!p)return;const st=currentStatus(id),pr=presenceLabel(p),banner=bannerFor(p);
    openModal(p.display_name,`<div class="profile-popup-banner" style="background-image:url('assets/banners/${banner}.webp')"></div><div class="profile-popup-body"><div class="profile-popup-head"><img src="${avatarUrl(p)}"><div><h2>${esc(p.display_name)}</h2><div style="font-size:11px;color:var(--muted)">@${esc(p.username||'staff')} · ${esc(p.rank)}</div><div style="margin-top:5px"><span class="pill ${st.on_shift?'green':pr[1]}">${st.on_shift?'On Shift':pr[0]}</span></div></div></div><div class="metrics" style="margin-top:14px"><div class="metric"><b>${p.service_points||0}</b><span>Service Points</span></div><div class="metric"><b>${p.merits||0}</b><span>Merits</span></div></div><div class="card" style="box-shadow:none;margin-top:10px"><h3>About</h3><p>${esc(p.bio||'Berry Blossom staff member.')}</p><p><b>Department:</b> ${esc(p.department||'Unassigned')}<br><b>Maple role:</b> ${esc(p.maple_role||'Staff')}<br><b>Unit:</b> ${esc(p.unit||'General')}</p></div>${id===Data.profile.id?'<button class="btn primary full" id="popupEdit">Edit my profile</button>':''}</div>`);if(document.getElementById('popupEdit'))popupEdit.onclick=()=>{closeModal();go('profile')}
  }

  function renderRota(){
    let shifts=state.data.shifts||[];if(state.rotaDept!=='All')shifts=shifts.filter(s=>s.department===state.rotaDept);
    content.innerHTML=titleBlock('Scheduling','Rota','Shifts and overtime live here and nowhere else.')+`<div class="card"><div class="select-wrap"><label>Department</label><select id="rotaFilter"><option>All</option>${DEPARTMENTS.map(d=>`<option ${d===state.rotaDept?'selected':''}>${esc(d)}</option>`).join('')}</select></div>${isManager()?'<button class="btn secondary full" id="shiftCreate">Create shift</button>':''}</div><div class="list">${shifts.map(s=>{const m=state.data.shift_members.find(x=>x.shift_id===s.id&&x.user_id===Data.profile.id);return`<div class="row"><div class="meta"><b>${esc(s.title)}</b><small>${esc(s.department)} · ${fmt(s.starts_at)} · capacity ${s.capacity}</small></div><button class="btn ${m?'secondary':'primary'}" data-shift="${s.id}">${m?'Withdraw':'Apply'}</button></div>`}).join('')||'<div class="notice">No shifts match this filter.</div>'}</div>`;
    rotaFilter.onchange=()=>{state.rotaDept=rotaFilter.value;renderRota()};document.querySelectorAll('[data-shift]').forEach(b=>b.onclick=async()=>{try{await Data.applyShift(b.dataset.shift);await refresh(false)}catch(e){toast(e.message)}});if(document.getElementById('shiftCreate'))shiftCreate.onclick=createShiftModal
  }
  function createShiftModal(){openModal('Create shift',`<div class="form"><div class="field"><label>Title</label><input id="shTitle"></div><div class="field"><label>Department</label><select id="shDept">${DEPARTMENTS.map(d=>`<option>${esc(d)}</option>`).join('')}</select></div><div class="field"><label>Starts</label><input id="shStart" type="datetime-local"></div><div class="field"><label>Ends</label><input id="shEnd" type="datetime-local"></div><div class="field"><label>Capacity</label><input id="shCap" type="number" value="4"></div><button class="btn primary full" id="shSave">Create shift</button></div>`);shSave.onclick=async()=>{try{await Data.createShift({title:shTitle.value||'Open Shift',department:shDept.value,starts_at:new Date(shStart.value).toISOString(),ends_at:new Date(shEnd.value).toISOString(),capacity:Number(shCap.value||4)});closeModal();await refresh(false)}catch(e){toast(e.message)}}}

  function renderPatients(){
    const units=[...new Set((state.data.patients||[]).map(p=>p.unit).filter(Boolean))];let list=state.data.patients||[];if(state.patientUnit!=='All')list=list.filter(p=>p.unit===state.patientUnit);
    content.innerHTML=titleBlock('Roleplay only','RP Patients','Fictional roleplay records only. Never enter real patient information.')+`<div class="card"><div class="select-wrap"><label>Unit</label><select id="patientFilter"><option>All</option>${units.map(u=>`<option ${u===state.patientUnit?'selected':''}>${esc(u)}</option>`).join('')}</select></div><button class="btn secondary full" id="patientAdd">Add fictional case</button></div><div class="list">${list.map(p=>`<div class="row"><div class="meta"><b>${esc(p.alias)}</b><small>${esc(p.unit)} · ${esc(p.stage)} · ${esc(p.scenario)}</small></div><span class="pill blue">${esc(p.stage)}</span></div>`).join('')||'<div class="notice">No RP patient cases.</div>'}</div>`;
    patientFilter.onchange=()=>{state.patientUnit=patientFilter.value;renderPatients()};patientAdd.onclick=patientModal
  }
  function patientModal(){openModal('Add RP patient',`<div class="form"><div class="field"><label>Alias</label><input id="ptAlias"></div><div class="field"><label>Unit</label><input id="ptUnit"></div><div class="field"><label>Scenario</label><textarea id="ptScenario"></textarea></div><button class="btn primary full" id="ptSave">Add case</button></div>`);ptSave.onclick=async()=>{try{await Data.createPatient({alias:ptAlias.value||'RP Patient',unit:ptUnit.value||'General Medicine',stage:'Waiting',scenario:ptScenario.value||'Awaiting assessment'});closeModal();await refresh(false)}catch(e){toast(e.message)}}}

  function renderEms(){
    content.innerHTML=titleBlock('Emergency roleplay','EMS & Codes','Dispatch calls and emergency drills in one focused section.')+`<div class="card"><div class="card-head"><div><h2>EMS calls</h2><p>${(state.data.ems||[]).length} active or recorded calls.</p></div><button class="btn secondary" id="emsAdd">New call</button></div><div class="list">${(state.data.ems||[]).map(e=>`<div class="row"><div class="meta"><b>${esc(e.location)}</b><small>${esc(e.scenario)}</small></div><span class="pill orange">${esc(e.status)}</span></div>`).join('')}</div></div><div class="card"><div class="card-head"><div><h2>Emergency codes</h2><p>Roleplay drills only.</p></div></div><div class="list">${(state.data.codes||[]).map(c=>`<div class="row"><div class="meta"><b>Code ${esc(c.code)}</b><small>${esc(c.label)}</small></div>${isManager()?`<button class="btn ${c.active?'danger':'primary'}" data-code="${c.id}" data-active="${c.active?'1':'0'}">${c.active?'End':'Start'}</button>`:`<span class="pill ${c.active?'orange':'grey'}">${c.active?'Active':'Inactive'}</span>`}</div>`).join('')}</div></div>`;emsAdd.onclick=emsModal;document.querySelectorAll('[data-code]').forEach(b=>b.onclick=async()=>{try{await Data.setCode(b.dataset.code,b.dataset.active!=='1');await refresh(false)}catch(e){toast(e.message)}})
  }
  function emsModal(){openModal('New EMS call',`<div class="form"><div class="field"><label>Location</label><input id="emsLoc"></div><div class="field"><label>Scenario</label><textarea id="emsScenario"></textarea></div><button class="btn primary full" id="emsSave">Create call</button></div>`);emsSave.onclick=async()=>{try{await Data.createEms({location:emsLoc.value||'Unknown location',scenario:emsScenario.value||'Roleplay emergency',status:'Unassigned'});closeModal();await refresh(false)}catch(e){toast(e.message)}}}

  function renderEvents(){
    content.innerHTML=titleBlock('Community','Events','Seasonal and community roleplay events have their own clean home.')+`<div class="card">${isManager()?'<button class="btn secondary full" id="eventCreate">Create event</button>':''}</div><div class="list">${(state.data.events||[]).map(e=>{const joined=(state.data.event_rsvps||[]).some(r=>r.event_id===e.id&&r.user_id===Data.profile.id);return`<div class="row"><div class="meta"><b>${esc(e.title)}</b><small>${fmt(e.starts_at)} · ${esc(e.scenario)} · capacity ${e.capacity}</small></div><button class="btn ${joined?'secondary':'primary'}" data-event="${e.id}">${joined?'Leave':'RSVP'}</button></div>`}).join('')||'<div class="notice">No events are scheduled.</div>'}</div>`;document.querySelectorAll('[data-event]').forEach(b=>b.onclick=async()=>{try{await Data.toggleEvent(b.dataset.event);await refresh(false)}catch(e){toast(e.message)}});if(document.getElementById('eventCreate'))eventCreate.onclick=eventModal
  }
  function eventModal(){openModal('Create event',`<div class="form"><div class="field"><label>Title</label><input id="evTitle"></div><div class="field"><label>Starts</label><input id="evStart" type="datetime-local"></div><div class="field"><label>Capacity</label><input id="evCap" type="number" value="20"></div><div class="field"><label>Scenario</label><textarea id="evScenario"></textarea></div><button class="btn primary full" id="evSave">Create event</button></div>`);evSave.onclick=async()=>{try{await Data.createEvent({title:evTitle.value||'Community Event',starts_at:new Date(evStart.value).toISOString(),capacity:Number(evCap.value||20),scenario:evScenario.value||'Community roleplay event'});closeModal();await refresh(false)}catch(e){toast(e.message)}}}

  function renderRewards(){
    const earned=new Set((state.data.user_rewards||[]).map(x=>x.reward_id));const week=state.data.profiles.find(p=>p.id===state.data.recognition?.staff_week),month=state.data.profiles.find(p=>p.id===state.data.recognition?.staff_month);
    content.innerHTML=titleBlock('Progression','Rewards','Achievements and staff recognition live together here.')+`<div class="card"><div class="card-head"><div><h2>My achievements</h2><p>${earned.size} unlocked.</p></div></div><div class="reward-grid">${BADGES.map(b=>`<div class="reward" style="${earned.has(b)||Data.mode==='demo'?'':'opacity:.35;filter:grayscale(1)'}"><img src="assets/badges/${b}.webp"><b>${esc(b.replaceAll('-',' '))}</b></div>`).join('')}</div></div><div class="grid2"><div class="card"><h3>Staff of the Week</h3>${week?`<button class="row staff-card" data-staff="${week.id}" style="width:100%;text-align:left;margin-top:8px"><img class="avatar-square" src="${avatarUrl(week)}"><div class="meta"><b>${esc(week.display_name)}</b><small>${esc(week.rank)}</small></div></button>`:'<p>Not set.</p>'}</div><div class="card"><h3>Staff of the Month</h3>${month?`<button class="row staff-card" data-staff="${month.id}" style="width:100%;text-align:left;margin-top:8px"><img class="avatar-square" src="${avatarUrl(month)}"><div class="meta"><b>${esc(month.display_name)}</b><small>${esc(month.rank)}</small></div></button>`:'<p>Not set.</p>'}</div></div>`;bindStaffButtons()
  }

  function renderProfile(){
    const p=Data.profile,st=currentStatus(),banner=bannerFor(p),dep=deptSlug(p.department),choices=['male','female','mascot'].map(r=>`${dep}-${r}`);
    content.innerHTML=titleBlock('Your account','My Profile','Your identity, avatar, banner and profile details.')+`<div class="profile-main-banner" style="background-image:url('assets/banners/${banner}.webp')"><div class="profile-name"><img src="${avatarUrl(p)}"><div><h2>${esc(p.display_name)}</h2><p>@${esc(p.username)} · ${esc(p.rank)} · ${esc(p.department||'Unassigned')}</p></div></div></div><div class="metrics" style="margin:12px 0"><div class="metric"><b>${p.service_points||0}</b><span>Service Points</span></div><div class="metric"><b>${p.merits||0}</b><span>Merits</span></div><div class="metric"><b>${p.certificate_count||0}</b><span>Certificates</span></div><div class="metric"><b>${st.on_shift?'On':'Off'}</b><span>Shift</span></div></div><div class="card"><div class="card-head"><div><h2>Avatar</h2><p>Three choices are available for your department.</p></div></div><div class="avatar-picker">${choices.map(k=>`<button class="avatar-choice ${avatarKey(p)===k?'selected':''}" data-avatar-choice="${k}"><img src="assets/avatars/${k}.webp"><b>${k.endsWith('male')?'Male':k.endsWith('female')?'Female':'Medical Mascot'}</b></button>`).join('')}</div></div><div class="card"><div class="card-head"><div><h2>Profile banner</h2><p>Choose a background for your profile and staff popup.</p></div></div><div class="banner-picker">${BANNERS.map(b=>`<button class="banner-choice" data-banner-choice="${b}"><img src="assets/banners/${b}.webp"><b>${BANNER_LABEL[b]}</b></button>`).join('')}</div></div><div class="card"><div class="field"><label>Bio</label><textarea id="profileBio">${esc(p.bio||'')}</textarea></div><div class="field" style="margin-top:9px"><label>Status message</label><input id="profileStatus" value="${esc(p.status_message||'')}"></div><button class="btn primary full" id="profileSaveText" style="margin-top:10px">Save profile text</button></div>`;
    document.querySelectorAll('[data-avatar-choice]').forEach(b=>b.onclick=async()=>{try{await Data.updateProfile({avatar_key:b.dataset.avatarChoice});await refresh(true);go('profile')}catch(e){toast(e.message)}});
    document.querySelectorAll('[data-banner-choice]').forEach(b=>b.onclick=async()=>{try{await Data.updateProfile({banner_key:b.dataset.bannerChoice});await refresh(false)}catch(e){toast(e.message)}});
    profileSaveText.onclick=async()=>{try{await Data.updateProfile({bio:profileBio.value,status_message:profileStatus.value});await refresh(false);toast('Profile saved')}catch(e){toast(e.message)}}
  }

  function settingsModal(){
    const p=Data.profile,t=state.data.settings.theme||'standard';
    openModal('Settings',`<div class="form"><div class="field"><label>Display name</label><input id="setName" value="${esc(p.display_name)}"></div><div class="field"><label>Date of birth</label><input id="setDob" type="date" value="${esc(p.dob||'')}"></div><div class="field"><label>Roblox username</label><input id="setRoblox" value="${esc(p.roblox_username||'')}"></div><button class="btn primary full" id="setSave">Save account</button>${isAdmin()?`<div class="card" style="box-shadow:none;margin-top:10px"><h3>Global theme</h3><div class="banner-picker" style="margin-top:8px">${['standard','halloween','christmas'].map(x=>`<button class="banner-choice" data-theme-choice="${x}"><img src="assets/themes/${x}-preview.webp"><b>${themeName(x)} ${x===t?'✓':''}</b></button>`).join('')}</div></div>`:`<div class="notice">Global theme: <b>${themeName(t)}</b>. Only administrators can change it.</div>`}<button class="btn secondary full" id="backendSettings">Backend Connection</button><button class="btn danger full" id="signoutSettings">Sign out</button></div>`);
    setSave.onclick=async()=>{try{await Data.updateProfile({display_name:setName.value.trim()||p.display_name,dob:setDob.value,roblox_username:setRoblox.value.trim()});closeModal();await refresh(true)}catch(e){toast(e.message)}};
    document.querySelectorAll('[data-theme-choice]').forEach(b=>b.onclick=async()=>{try{await Data.setTheme(b.dataset.themeChoice);closeModal();await refresh(true);toast('Theme changed')}catch(e){toast(e.message)}});
    backendSettings.onclick=backendModal;signoutSettings.onclick=async()=>{await Data.signOut();closeModal();renderAuth()}
  }

  boot();
})();
