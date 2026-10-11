
(async function(){
  const Data=window.BBData, root=document.getElementById('root'), modalRoot=document.getElementById('modalRoot'), toastRoot=document.getElementById('toastRoot');
  const DEPARTMENTS=['A&E','General Medicine','Surgery','Cardiology','Orthopaedics','Radiology','Paediatrics','Maternity & Women’s Health','Laboratory Services','Pharmacy','Nursing','Dental'];
  const DEPT_SLUG={'A&E':'ae','General Medicine':'general-medicine','Surgery':'surgery','Cardiology':'cardiology','Orthopaedics':'orthopaedics','Radiology':'radiology','Paediatrics':'paediatrics','Maternity & Women’s Health':'maternity','Laboratory Services':'laboratory','Pharmacy':'pharmacy','Nursing':'nursing','Dental':'dental'};
  // Every banner is a true 3:1 image. Legacy keys remain supported for existing profiles.
  const BANNERS=['standard-blossom','halloween-lobby','christmas-lobby','executive-gold','clinical-blue','blossom-courtyard','pastel-interior','strawberry-garden','halloween-autumn','moonlit-spooky','christmas-snow'];
  const BANNER_LABEL={'standard-blossom':'Berry Blossom · Standard','halloween-lobby':'Halloween Reception','christmas-lobby':'Christmas Reception','executive-gold':'Executive Gold','clinical-blue':'Clinical Blue','blossom-courtyard':'Legacy Blossom Courtyard','pastel-interior':'Legacy Pastel Interior','strawberry-garden':'Legacy Strawberry Garden','halloween-autumn':'Legacy Halloween Autumn','moonlit-spooky':'Legacy Moonlit Spooky','christmas-snow':'Legacy Christmas Snow'};
  const FRAMES=['berry-blossom','medical','senior-staff','halloween','christmas','birthday'];
  const BADGES=['first-shift','10-hours','bls-passed','emergency','event','staff-week','staff-month'];
  const ACTIVITIES=['Available','With Patient','In Training','On Break','Responding to Emergency','In Surgery','On Ambulance Call','Unavailable'];
  const SECTIONS=[
    ['hospital','hospital','Hospital Live','See who is working and how each department is covered.'],
    ['staffboard','staff','Staff Board','A live hospital-style nameplate board grouped by department.'],
    ['training','training','Training','Book sessions, follow progress and manage training.'],
    ['applications','applications','Applications','Apply, track applications or review applicants.'],
    ['staff','staff','Staff Directory','Find staff and open their full profile cards.'],
    ['rota','calendar','Rota','View shifts, overtime and applications.'],
    ['patients','health','RP Patients','Manage fictional roleplay patient cases only.'],
    ['ems','ambulance','EMS & Codes','Dispatch calls and run emergency roleplay drills.'],
    ['events','notifications','Events','Join community events and scenario nights.'],
    ['rewards','trophy','Rewards','View achievements, recognition and progression.']
  ];
  let state={page:'home',labDept:'A&E',labAvatar:'ae-male-1',labFrame:'berry-blossom',labBanner:'standard-blossom',data:null,presence:{},mapFloor:0,mapSelectedRoom:null,officeAccess:{security:false,executive:null},boardFilter:'All',staffDept:'All',staffRole:'All',staffSearch:'',rotaDept:'All',patientUnit:'All',trainingDept:'All'};
  const legacyGender={Liam:'male',Sophie:'female',Amelia:'female',Isla:'female',Noah:'male',Chloe:'female',Mason:'male',Grace:'female',Rosie:'female'};

  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function toast(msg){toastRoot.innerHTML=`<div class="toast">${esc(msg)}</div>`;setTimeout(()=>toastRoot.innerHTML='',2200)}
  function fmt(v){try{return new Date(v).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}catch{return v||'TBC'}}
  function currentStatus(id=Data.profile?.id){return state.data?.status?.find(x=>x.user_id===id)||{on_shift:false,activity:'Unavailable'}}
  function themeName(t){return t==='halloween'?'Halloween':t==='christmas'?'Christmas':'Berry Blossom'}
  function bannerFor(p){return p?.banner_key&&BANNERS.includes(p.banner_key)?p.banner_key:defaultBannerFor(p)}
  function defaultBannerFor(p){const theme=state.data?.settings?.theme;return theme==='halloween'?'halloween-lobby':theme==='christmas'?'christmas-lobby':'standard-blossom'}
  function frameFor(p){const f=FRAMES.includes(p?.frame_key)?p.frame_key:'berry-blossom';return f==='birthday'&&!p?.preview_all&&!frameAllowed('birthday',p)?'berry-blossom':f}
  function frameAllowed(frame,p=Data.profile){
    if(frame==='senior-staff'&&!((p?.role==='admin')||p?.is_head))return false;
    if(frame==='birthday'){
      if(!p?.dob)return false;
      // Compare month and day in local calendar; birth year does not matter.
      const now=new Date(),parts=String(p.dob).slice(5,10);
      return parts===`${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    }
    return true;
  }
  function avatarMarkup(p,extra=''){
    return `<span class="profile-avatar-shell ${extra}"><img class="profile-avatar-photo" src="${avatarUrl(p)}" alt="${esc(p?.display_name||'Staff')} profile picture"><img class="profile-avatar-frame" src="assets/frames/${frameFor(p)}.webp" alt="" aria-hidden="true"></span>`;
  }
  function bannerMarkup(p,kind='main'){
    return `<div class="profile-cover profile-cover-${kind}"><img src="assets/banners/${bannerFor(p)}.webp" alt="Profile banner" loading="lazy"></div>`;
  }
  function mayUseLab(){return isAdmin()||(Data.mode==='demo'&&Data.profile?.username==='berrytester')}
  function navSections(){return mayUseLab()?[...SECTIONS,['cosmetics','profile','Cosmetics Lab','Preview all profile art and rewards without changing other accounts.']]:SECTIONS}
  function deptSlug(dep){return DEPT_SLUG[dep]||'ae'}
  function avatarKey(p){
    const val=String(p?.avatar_key||'');
    if(/^(ae|general-medicine|surgery|cardiology|orthopaedics|radiology|paediatrics|maternity|laboratory|pharmacy|nursing|dental)-(male|female|mascot)-[1-3]$/.test(val)) return val;
    if(/^(ae|general-medicine|surgery|cardiology|orthopaedics|radiology|paediatrics|maternity|laboratory|pharmacy|nursing|dental)-hod-(male|female|mascot)$/.test(val)) return val;
    const dep=deptSlug(p?.department),role=legacyGender[p?.display_name]||'female';
    return p?.is_head?`${dep}-hod-${role}`:`${dep}-${role}-1`;
  }
    function avatarUrl(p){const k=avatarKey(p);return k.includes('-hod-')?`assets/avatars-hod/${k}.webp`:`assets/avatars/${k}.webp`}
  function iconUrl(k){return `assets/icons/${k}.png`}
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
    try{state.officeAccess=await Data.getMyOfficeAccess()}catch(e){state.officeAccess={security:isAdmin(),executive:null};console.warn('Office access unavailable',e)}
    if(render) renderShell();
    else renderPage();
  }

  function topAvatar(){return avatarUrl(Data.profile)}
  function renderShell(){
    root.innerHTML=`<div class="app"><div class="drawer-backdrop" id="drawerBack"></div><aside class="drawer" id="drawer"><div class="drawer-head"><img src="assets/ui/icon-192.png"><div><b>Berry Blossom</b><small>MEDICAL CENTRE</small></div></div><div class="menu-list"><button class="menu-btn" data-page="home"><span class="menu-ico"><img src="assets/icons/home.png"></span><span>Home</span></button>${navSections().map(s=>`<button class="menu-btn" data-page="${s[0]}"><span class="menu-ico"><img src="${iconUrl(s[1])}"></span><span>${s[2]}</span></button>`).join('')}</div></aside><div class="shell"><header class="topbar"><button class="icon-btn" id="menuOpen"><img src="assets/icons/menu.png"></button><div class="brand"><b>Berry Blossom</b><small>MEDICAL CENTRE</small></div><div class="top-actions"><button class="profile-top-btn" id="profileTop"><img src="${topAvatar()}"></button><button class="icon-btn" id="settingsTop"><img src="assets/icons/settings.png"></button></div></header><main id="content" class="content"></main></div></div>`;
    menuOpen.onclick=toggleDrawer;drawerBack.onclick=closeDrawer;profileTop.onclick=()=>go('profile');settingsTop.onclick=settingsModal;
    document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{go(b.dataset.page);closeDrawer()});
    renderPage()
  }
  function toggleDrawer(){drawer.classList.toggle('open');drawerBack.classList.toggle('open')}
  function closeDrawer(){drawer.classList.remove('open');drawerBack.classList.remove('open')}
  function go(page){state.page=page;renderPage();scrollTo({top:0,behavior:'smooth'})}

  function titleBlock(kicker,title,desc){return `<div class="page-title"><div class="eyebrow">${esc(kicker)}</div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div>`}
  function renderPage(){
    document.body.classList.toggle('map-page',state.page==='home');
    const brand=document.querySelector('.brand');
    if(brand){const names={home:'Berry Blossom',staffboard:'Staff Board',department:'Department',securityoffice:'Security Office',directoroffice:'Directors’ Office'};const title=names[state.page]||navSections().find(x=>x[0]===state.page)?.[2]||'My Profile';brand.querySelector('b').textContent=title;brand.querySelector('small').textContent=state.page==='home'?'MEDICAL CENTRE':'BERRY BLOSSOM';}
    document.querySelectorAll('.menu-btn').forEach(b=>b.classList.toggle('active',b.dataset.page===state.page));
    const fn={home:renderHome,staffboard:renderStaffBoard,department:renderDepartment,securityoffice:renderSecurityOffice,directoroffice:renderDirectorsOffice,hospital:renderHospital,training:renderTraining,applications:renderApplications,staff:renderStaff,rota:renderRota,patients:renderPatients,ems:renderEms,events:renderEvents,rewards:renderRewards,profile:renderProfile,cosmetics:mayUseLab()?renderCosmeticsLab:renderHome}[state.page]||renderHome;
    fn()
  }

  // Schematic navigation layout for Berry Blossom. Not a survey of the Roblox Maple Hospital building.
  const FLOOR_PLANS=[
    {label:'Lower Ground',number:'B1',rooms:[['laboratory','Laboratory Services','🧪'],['radiology','Radiology','🩻'],['pharmacy','Pharmacy','💊'],['security','Security Office','🛡️']]},
    {label:'Ground Floor',number:'G',rooms:[['ae','A&E','🚑'],['general','General Medicine','🩺'],['nursing','Nursing','💗'],['dental','Dental','🦷']]},
    {label:'First Floor',number:'1',rooms:[['surgery','Surgery','🏥'],['cardiology','Cardiology','🫀'],['orthopaedics','Orthopaedics','🦴'],['stafflounge','Staff Lounge','☕']]},
    {label:'Second Floor',number:'2',rooms:[['paediatrics','Paediatrics','🧸'],['maternity','Maternity & Women’s Health','🌸'],['trainingroom','Training Centre','📚'],['familylounge','Family Lounge','🛋️']]},
    {label:'Third Floor',number:'3',rooms:[['directors','Directors’ Office','👑'],['administration','Administration','📋'],['conference','Conference Suite','🤝'],['roofgarden','Roof Garden','🌿']]}
  ];
  const ROOM_DEPARTMENTS={laboratory:'Laboratory Services',radiology:'Radiology',pharmacy:'Pharmacy',ae:'A&E',general:'General Medicine',nursing:'Nursing',dental:'Dental',surgery:'Surgery',cardiology:'Cardiology',orthopaedics:'Orthopaedics',paediatrics:'Paediatrics',maternity:'Maternity & Women’s Health'};
  function onDuty(dep){return (state.data?.profiles||[]).filter(p=>p.account_status==='active'&&currentStatus(p.id).on_shift&&(!dep||dep==='All'||p.department===dep));}
  function professionalTitle(p){
    const txt=String([p.maple_role,p.rank].filter(Boolean).join(' ')).toLowerCase();
    if(/doctor|surgeon|consultant|physician|cardiologist|dentist/.test(txt))return 'Dr';
    if(/nurse|midwi/.test(txt))return /midwi/.test(txt)?'Midwife':'Nurse';
    if(/paramedic|medic|ems/.test(txt))return 'Paramedic';
    if(/pharmac/.test(txt))return 'Pharmacist';
    if(/radiograph/.test(txt))return 'Radiographer';
    if(/security|officer/.test(txt))return 'Officer';
    if(/director/.test(txt))return 'Director';
    return p.rank||'Staff';
  }
  function nameplate(p){
    const st=currentStatus(p.id);return `<button class="staff-nameplate" data-staff="${esc(p.id)}" aria-label="Open ${esc(p.display_name)} profile"><span class="plate-pin"></span><span class="plate-detail"><strong>${esc(professionalTitle(p))} ${esc(p.display_name)}</strong><small>${esc(p.rank||'Staff')} <span aria-hidden="true">·</span> ${esc(st.activity||'Available')}</small></span><span class="plate-duty"><span class="duty-lamp"></span> ON DUTY</span></button>`;
  }
  function departmentBoard(dep,showHeading=true){const staff=onDuty(dep);return `<div class="ward-board"><div class="ward-board-rail"><span>● STAFF ON DUTY</span><span>${staff.length} ACTIVE</span></div>${showHeading?`<h3>${esc(dep)} <small>STAFF ROSTER</small></h3>`:''}<div class="ward-plaques">${staff.length?staff.map(nameplate).join(''):'<div class="empty-plaques">No staff clocked in for this department</div>'}</div><div class="ward-board-footer">BERRY BLOSSOM · LIVE STAFF DIRECTORY</div></div>`;}
  function openRoom(id){
    if(ROOM_DEPARTMENTS[id]){state.mapSelectedRoom=ROOM_DEPARTMENTS[id];go('department');return}
    if(id==='security'){
      if(state.officeAccess?.security){go('securityoffice')}else toast('Restricted: authorised security and administrators only');return;
    }
    if(id==='directors'){
      if(state.officeAccess?.executive){go('directoroffice')}else executiveActivationModal();return;
    }
    const destinations={trainingroom:'training',stafflounge:'staffboard',familylounge:'staffboard',administration:'hospital',conference:'events',roofgarden:'events'};
    go(destinations[id]||'hospital');
  }
  function renderHome(){
    const theme=state.data?.settings?.theme||'standard',fl=FLOOR_PLANS[state.mapFloor],count=onDuty().length;
    const upcoming=(state.data?.events||[]).filter(e=>new Date(e.starts_at).getTime()>=Date.now()-86400000).sort((a,b)=>new Date(a.starts_at)-new Date(b.starts_at))[0];
    content.innerHTML=`<div class="map-home"><div class="map-intro"><span class="map-kicker">${esc(themeName(theme))} · HOSPITAL DIRECTORY</span><h1>Explore the hospital</h1><p>Choose a floor, then tap a room to see its team. ${count} staff on duty right now.</p>${upcoming?`<button class="map-event-ribbon" id="mapEventLink">✦ UPCOMING EVENT · ${esc(upcoming.title)} · ${fmt(upcoming.starts_at)} →</button>`:""}</div><div class="map-workspace"><div class="map-sidebar"><button class="floor-arrow" data-floor-step="1" aria-label="Go up one floor">▲ <span>UP</span></button><div class="floor-rail">${FLOOR_PLANS.map((floor,i)=>`<button class="floor-stop ${state.mapFloor===i?'chosen':''}" data-floor="${i}" aria-pressed="${state.mapFloor===i}"><b>${floor.number}</b><small>${esc(floor.label)}</small></button>`).reverse().join('')}</div><button class="floor-arrow" data-floor-step="-1" aria-label="Go down one floor">▼ <span>DOWN</span></button></div><div class="map-building"><div class="floor-head"><div><small>BERRY BLOSSOM · FLOOR ${fl.number}</small><h2>${esc(fl.label)}</h2></div><span class="map-live-dot">● LIVE</span></div><div class="floor-plan" role="group" aria-label="Rooms on ${esc(fl.label)}"><div class="plan-wing">${fl.rooms.map(([id,name,emoji],i)=>{const staff=ROOM_DEPARTMENTS[id]?onDuty(ROOM_DEPARTMENTS[id]).length:null;const locked=id==='security'&&!state.officeAccess?.security||id==='directors'&&!state.officeAccess?.executive;return `<button class="map-room ${locked?'restricted':''}" data-room="${id}" title="${esc(name)}"><span class="room-icon">${emoji}</span><span class="room-name">${esc(name)}</span><small>${staff===null?(locked?'🔒 Authorised entry':'VISIT ROOM'):`${staff} ON DUTY`}</small></button>`}).join('')}</div><div class="central-hall"><span class="hall-label">MAIN CORRIDOR</span><div class="hall-markers"><span>EXIT</span><span>✚</span><span>LIFT</span></div></div><div class="floor-legend"><span><i class="legend-open"></i> Department</span><span><i class="legend-private"></i> Restricted</span><span>Conceptual hospital layout</span></div></div><div class="map-bottom"><button class="btn secondary" data-map-shortcut="staffboard">Staff Board (${count})</button><button class="btn secondary" data-map-shortcut="hospital">My Shift</button></div></div></div></div>`;
    if(document.getElementById('mapEventLink'))mapEventLink.onclick=()=>go('events');
    document.querySelectorAll('[data-floor]').forEach(b=>b.onclick=()=>{state.mapFloor=Number(b.dataset.floor);renderHome()});
    document.querySelectorAll('[data-floor-step]').forEach(b=>b.onclick=()=>{state.mapFloor=Math.min(FLOOR_PLANS.length-1,Math.max(0,state.mapFloor+Number(b.dataset.floorStep)));renderHome()});
    document.querySelectorAll('[data-room]').forEach(b=>b.onclick=()=>openRoom(b.dataset.room));
    document.querySelectorAll('[data-map-shortcut]').forEach(b=>b.onclick=()=>go(b.dataset.mapShortcut));
    const rail=document.querySelector('.map-sidebar');if(rail){rail.onwheel=e=>{if(Math.abs(e.deltaY)>4){e.preventDefault();const next=Math.min(4,Math.max(0,state.mapFloor+(e.deltaY<0?1:-1)));if(next!==state.mapFloor){state.mapFloor=next;renderHome()}}};let sy=0;rail.addEventListener('touchstart',e=>{sy=e.touches[0].clientY},{passive:true});rail.addEventListener('touchend',e=>{const d=sy-e.changedTouches[0].clientY;if(Math.abs(d)>35){state.mapFloor=Math.max(0,Math.min(4,state.mapFloor+(d>0?1:-1)));renderHome()}},{passive:true})}
  }
  function renderStaffBoard(){const staff=onDuty(),d=state.boardFilter;content.innerHTML=titleBlock('Live Roster','Staff Board',`${staff.length} clocked-in staff across ${DEPARTMENTS.length} departments. Tap a nameplate to open a profile.`)+`<div class="card"><div class="field"><label>Filter by department</label><select id="wardBoardFilter"><option value="All">All departments</option>${DEPARTMENTS.map(x=>`<option ${d===x?'selected':''}>${esc(x)}</option>`).join('')}</select></div></div><div class="board-collection">${(d==='All'?DEPARTMENTS:[d]).map(dep=>departmentBoard(dep)).join('')}</div>`;wardBoardFilter.onchange=()=>{state.boardFilter=wardBoardFilter.value;renderStaffBoard()};bindStaffButtons();}
  function renderDepartment(){const dep=state.mapSelectedRoom;if(!DEPARTMENTS.includes(dep)){go('home');return}content.innerHTML=`<button class="back-to-map" id="backMap">← Hospital map</button>`+titleBlock('Department',dep,'Current staffing, shift activity and the department nameplate board.')+`<div class="metrics"><div class="metric"><b>${onDuty(dep).length}</b><span>Clocked in</span></div><div class="metric"><b>${state.data.profiles.filter(x=>x.department===dep&&x.account_status==='active').length}</b><span>Registered staff</span></div></div>`+departmentBoard(dep);backMap.onclick=()=>go('home');bindStaffButtons();}
  function renderSecurityOffice(){if(!state.officeAccess?.security){toast('Not authorised for the Security Office');go('home');return}const staff=onDuty();content.innerHTML=`<button class="back-to-map" id="backMap">← Hospital map</button>`+titleBlock('Restricted Access','Security Office','For authorised administrators and security staff only.')+`<div class="card"><div class="card-head"><h2>On-duty overview</h2><span class="pill green">${staff.length} ACTIVE</span></div><p>Staff shown below are clocked in. This view contains no sensitive staff records.</p></div>${departmentBoard('All',false)}`+(isAdmin()?`<div class="card"><h2>Security staff access</h2><p>Grant or remove Security Office access for an active staff member. This is validated by the live backend.</p><div class="field"><label>Staff member</label><select id="securityStaffTarget">${state.data.profiles.filter(x=>x.id!==Data.profile.id).map(x=>`<option value="${esc(x.id)}">${esc(x.display_name)} · ${esc(x.username)}</option>`).join('')}</select></div><div class="map-bottom"><button class="btn secondary" data-security-action="true">Grant Access</button><button class="btn secondary" data-security-action="false">Revoke Access</button></div></div>`:'');backMap.onclick=()=>go('home');bindStaffButtons();document.querySelectorAll('[data-security-action]').forEach(b=>b.onclick=async()=>{try{await Data.setSecurityAccess(securityStaffTarget.value,b.dataset.securityAction==='true');toast('Security role updated')}catch(e){toast(e.message)}})}
  function renderDirectorsOffice(){if(!state.officeAccess?.executive){executiveActivationModal();go('home');return}const r=state.officeAccess.executive;content.innerHTML=`<button class="back-to-map" id="backMap">← Hospital map</button>`+titleBlock('Executive Suite','Directors’ Office',`${r==='owner'?'Hospital Owner':'Hospital Director'} · ${Data.profile.display_name}`)+`<div class="card"><h2>Welcome, ${esc(Data.profile.display_name)}</h2><p>Executive access was verified against your username and private activation code. The code is never displayed or stored in your browser profile.</p></div><div class="metrics"><div class="metric"><b>${onDuty().length}</b><span>Staff on duty</span></div><div class="metric"><b>${DEPARTMENTS.filter(x=>onDuty(x).length).length}</b><span>Departments staffed</span></div></div>${departmentBoard('All',false)}<button class="btn secondary full" id="directorHospitalLink">Hospital Live</button>`;backMap.onclick=()=>go('home');directorHospitalLink.onclick=()=>go('hospital');bindStaffButtons();}
  function executiveActivationModal(){
    if(Data.mode!=='supabase'){openModal('Executive Access',`<div class="notice">Owner and Director activation is only available with a configured live Supabase backend. This demo cannot grant secure privileges.</div>`);return}
    openModal('Executive Office · Activation',`<p>Only pre-authorised Owner and Director usernames can unlock this office. Your activation code is used once and will not appear in your profile.</p><div class="form"><div class="field"><label>Account username</label><input id="execUsername" value="${esc(Data.profile.username)}" autocomplete="username" readonly></div><div class="field"><label>Private activation code</label><input id="execCode" type="password" autocomplete="off" minlength="16" maxlength="72" placeholder="Enter your private code"></div><button id="execActivate" class="btn primary full">Activate Office Access</button></div>`);
    execActivate.onclick=async()=>{const btn=execActivate;btn.disabled=true;try{await Data.activateExecutiveAccess(execCode.value);execCode.value='';state.officeAccess=await Data.getMyOfficeAccess();closeModal();if(state.officeAccess.executive)go('directoroffice');else toast('Activation was not granted')}catch(e){toast(e.message)}finally{btn.disabled=false}};
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
  function staffRow(p){const st=currentStatus(p.id),pr=presenceLabel(p);return`<button class="row staff-card" data-staff="${p.id}" style="width:100%;text-align:left">${avatarMarkup(p,'staff-avatar')}<div class="meta"><b>${esc(p.display_name)}</b><small>${esc(p.rank)} · ${esc(p.department||'Unassigned')}</small></div><span class="pill ${st.on_shift?'green':pr[1]}">${st.on_shift?'On Shift':pr[0]}</span></button>`}
  function bindStaffButtons(){document.querySelectorAll('[data-staff]').forEach(b=>b.onclick=()=>profilePopup(b.dataset.staff))}
  function profilePopup(id){
    const p=state.data.profiles.find(x=>x.id===id);if(!p)return;
    const st=currentStatus(id),pr=presenceLabel(p);
    openModal(p.display_name,`${bannerMarkup(p,'popup')}<div class="profile-popup-body"><div class="profile-popup-head">${avatarMarkup(p)}<div><h2>${esc(p.display_name)}</h2><div style="font-size:11px;color:var(--muted)">@${esc(p.username||'staff')} · ${esc(p.rank)}</div><div style="margin-top:5px"><span class="pill ${st.on_shift?'green':pr[1]}">${st.on_shift?'On Shift':pr[0]}</span></div></div></div><div class="metrics" style="margin-top:14px"><div class="metric"><b>${p.service_points||0}</b><span>Service Points</span></div><div class="metric"><b>${p.merits||0}</b><span>Merits</span></div></div><div class="card" style="box-shadow:none;margin-top:10px"><h3>About</h3><p>${esc(p.bio||'Berry Blossom staff member.')}</p><p><b>Department:</b> ${esc(p.department||'Unassigned')}<br><b>Maple role:</b> ${esc(p.maple_role||'Staff')}<br><b>Unit:</b> ${esc(p.unit||'General')}</p></div>${id===Data.profile.id?'<button class="btn primary full" id="popupEdit">Edit my profile</button>':''}</div>`);
    if(document.getElementById('popupEdit'))popupEdit.onclick=()=>{closeModal();go('profile')};
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
    const p=Data.profile,st=currentStatus(),dep=deptSlug(p.department),selected=avatarKey(p);
    const choices=['male','female','mascot'].flatMap(r=>[1,2,3].map(n=>`${dep}-${r}-${n}`));
    if(p.is_head||isAdmin())choices.push(...['male','female','mascot'].map(r=>`${dep}-hod-${r}`));
    content.innerHTML=titleBlock('Your account','My Profile','Your identity, picture frame, banner and profile details.')+`
      <div class="profile-hero">${bannerMarkup(p)}<div class="profile-hero-info">${avatarMarkup(p)}<div><h2>${esc(p.display_name)}</h2><p>@${esc(p.username)} · ${esc(p.rank)} · ${esc(p.department||'Unassigned')}</p></div></div></div>
      <div class="metrics" style="margin:12px 0"><div class="metric"><b>${p.service_points||0}</b><span>Service Points</span></div><div class="metric"><b>${p.merits||0}</b><span>Merits</span></div><div class="metric"><b>${p.certificate_count||0}</b><span>Certificates</span></div><div class="metric"><b>${st.on_shift?'On':'Off'}</b><span>Shift</span></div></div>
      <div class="card"><div class="card-head"><div><h2>Profile picture</h2><p>Choose from ${p.is_head||isAdmin()?'your department avatars and gold HoD portraits':'nine department avatars'}.</p></div></div><div class="avatar-picker">${choices.map(k=>`<button class="avatar-choice ${selected===k?'selected':''}" data-avatar-choice="${k}"><img src="${k.includes('-hod-')?'assets/avatars-hod/':'assets/avatars/'}${k}.webp" loading="lazy" alt="${esc(k)}"><b>${esc(k.split('-').slice(-2).join(' '))}</b></button>`).join('')}</div></div>
      <div class="card"><div class="card-head"><div><h2>Picture frame</h2><p>Transparent overlays now appear on your profile and staff card.</p></div></div><div class="frame-picker">${FRAMES.map(f=>{const enabled=frameAllowed(f,p);return `<button class="frame-choice ${frameFor(p)===f?'selected':''}" data-frame-choice="${f}" ${enabled?'':'disabled'} title="${enabled?'':'Not available for this account today'}"><span class="frame-swatch"><img src="${avatarUrl(p)}" class="frame-base" alt=""><img src="assets/frames/${f}.webp" class="frame-overlay" alt=""></span><b>${esc(f.replaceAll('-',' '))}</b>${enabled?'':'<small>Locked</small>'}</button>`}).join('')}</div><div class="notice" style="margin-top:10px">Birthday frame unlocks on your birthday. Gold senior-staff frame is for admin and Heads of Department. Admins can preview every frame in Cosmetics Lab.</div></div>
      <div class="card"><div class="card-head"><div><h2>Profile banner</h2><p>New 3:1 artwork displays without cutting off the sides on mobile.</p></div></div><div class="banner-picker">${BANNERS.map(b=>`<button class="banner-choice ${bannerFor(p)===b?'selected':''}" data-banner-choice="${b}"><img src="assets/banners/${b}.webp" loading="lazy" alt="${esc(BANNER_LABEL[b])}"><b>${esc(BANNER_LABEL[b])}</b></button>`).join('')}</div></div>
      ${mayUseLab()?'<button class="btn secondary full" id="openCosmeticsLab" style="margin-bottom:14px">Open Cosmetics Lab · preview everything</button>':''}
      <div class="card"><div class="field"><label>Bio</label><textarea id="profileBio">${esc(p.bio||'')}</textarea></div><div class="field" style="margin-top:9px"><label>Status message</label><input id="profileStatus" value="${esc(p.status_message||'')}"></div><button class="btn primary full" id="profileSaveText" style="margin-top:10px">Save profile text</button></div>`;
    document.querySelectorAll('[data-avatar-choice]').forEach(b=>b.onclick=async()=>{try{await Data.updateProfile({avatar_key:b.dataset.avatarChoice});await refresh(true);go('profile');toast('Profile picture updated')}catch(e){toast(e.message)}});
    document.querySelectorAll('[data-frame-choice]').forEach(b=>b.onclick=async()=>{const f=b.dataset.frameChoice;if(!frameAllowed(f))return toast('This frame is not unlocked');try{await Data.updateProfile({frame_key:f});await refresh(false);toast('Frame saved')}catch(e){toast(e.message)}});
    document.querySelectorAll('[data-banner-choice]').forEach(b=>b.onclick=async()=>{try{await Data.updateProfile({banner_key:b.dataset.bannerChoice});await refresh(false);toast('Banner saved')}catch(e){toast(e.message)}});
    if(document.getElementById('openCosmeticsLab'))openCosmeticsLab.onclick=()=>go('cosmetics');
    profileSaveText.onclick=async()=>{try{await Data.updateProfile({bio:profileBio.value,status_message:profileStatus.value});await refresh(false);toast('Profile saved')}catch(e){toast(e.message)}};
  }

  function renderCosmeticsLab(){
    if(!mayUseLab()){go('home');return}
    const scrollY=window.scrollY, selectedDept=state.labDept;
    const avatarList=DEPARTMENTS.filter(d=>selectedDept==='All'||d===selectedDept).flatMap(d=>{
      const slug=deptSlug(d);
      return [...['male','female','mascot'].flatMap(r=>[1,2,3].map(n=>`${slug}-${r}-${n}`)),...['male','female','mascot'].map(r=>`${slug}-hod-${r}`)];
    });
    const face=state.labAvatar, preview={display_name:'Berry Blossom Tester',username:'berrytester',rank:'Cosmetics Preview',department:selectedDept==='All'?'A&E':selectedDept,avatar_key:face,frame_key:state.labFrame,banner_key:state.labBanner,preview_all:true};
    const ICONS=['home','hospital','training','applications','staff','calendar','health','ambulance','notifications','trophy','profile','settings','achievement','add','back','close','edit','clock','chat','search','menu','laboratory','radiology','pharmacy','dental','maternity'];
    content.innerHTML=titleBlock('Administration · demo previews','Cosmetics Lab','Every avatar, transparent frame and banner in one testing studio. Selections here only preview until you explicitly apply them to your own profile.')+`
      <div class="notice">${Data.mode==='demo'?'DEMO TEST ACCOUNT: berrytester / preview123 (browser-only). No live Supabase access is created.':'LIVE MODE: only authenticated administrators can open this preview. No demo login or shared admin credentials are created.'}</div>
      <div class="card cosmetics-stage"><h2>Live profile preview</h2><div class="profile-hero">${bannerMarkup(preview)}<div class="profile-hero-info">${avatarMarkup(preview)}<div><h2>${esc(preview.display_name)}</h2><p>Banner and frame preview · no changes saved</p></div></div></div><div class="cosmetics-actions"><button class="btn secondary" id="labReset">Reset preview</button><button class="btn primary" id="labApply">Apply selected look to my profile</button></div></div>
      <div class="card"><div class="field"><label>Avatar department</label><select id="labDept">${['All',...DEPARTMENTS].map(d=>`<option value="${esc(d)}" ${d===selectedDept?'selected':''}>${esc(d==='All'?'All departments (144 pictures)':d)}</option>`).join('')}</select></div><div class="card-head" style="margin-top:12px"><div><h2>Profile pictures</h2><p>${avatarList.length} images, including gold Heads of Department. All portraits are individual assets.</p></div></div><div class="avatar-picker cosmetics-avatar-grid">${avatarList.map(k=>`<button class="avatar-choice ${face===k?'selected':''}" data-lab-avatar="${k}"><img loading="lazy" src="${k.includes('-hod-')?'assets/avatars-hod/':'assets/avatars/'}${k}.webp" alt="${esc(k)}"><b>${esc(k.replaceAll('-',' '))}</b></button>`).join('')}</div></div>
      <div class="card"><h2>Transparent profile frames</h2><p>Birthday and gold frames can always be previewed here.</p><div class="frame-picker">${FRAMES.map(f=>`<button class="frame-choice ${state.labFrame===f?'selected':''}" data-lab-frame="${f}"><span class="frame-swatch"><img class="frame-base" src="${avatarUrl(preview)}" alt=""><img class="frame-overlay" src="assets/frames/${f}.webp" alt=""></span><b>${esc(f.replaceAll('-',' '))}</b></button>`).join('')}</div></div>
      <div class="card"><h2>All profile banners</h2><div class="banner-picker">${BANNERS.map(b=>`<button class="banner-choice ${state.labBanner===b?'selected':''}" data-lab-banner="${b}"><img src="assets/banners/${b}.webp" loading="lazy" alt="${esc(BANNER_LABEL[b])}"><b>${esc(BANNER_LABEL[b])}</b></button>`).join('')}</div></div>
      <div class="card"><h2>Achievements & rewards</h2><div class="reward-grid">${BADGES.map(b=>`<div class="reward"><img loading="lazy" src="assets/badges/${b}.webp" alt="${esc(b)}"><b>${esc(b.replaceAll('-',' '))}</b></div>`).join('')}</div></div>
      <div class="card"><h2>App icons</h2><div class="reward-grid">${ICONS.map(k=>`<div class="reward"><img loading="lazy" src="${iconUrl(k)}" alt="${esc(k)}"><b>${esc(k)}</b></div>`).join('')}</div></div>
      <div class="card"><h2>Global theme artwork</h2><p>Preview only. This does not alter the hospital's global theme.</p><div class="theme-gallery">${['standard','halloween','christmas'].map(t=>`<div><img loading="lazy" src="assets/themes/${t}-preview.webp" alt="${themeName(t)}"><b>${themeName(t)}</b></div>`).join('')}</div></div>`;
    labDept.onchange=()=>{state.labDept=labDept.value;state.labAvatar=`${deptSlug(state.labDept==='All'?'A&E':state.labDept)}-male-1`;renderCosmeticsLab()};
    document.querySelectorAll('[data-lab-avatar]').forEach(b=>b.onclick=()=>{state.labAvatar=b.dataset.labAvatar;renderCosmeticsLab()});
    document.querySelectorAll('[data-lab-frame]').forEach(b=>b.onclick=()=>{state.labFrame=b.dataset.labFrame;renderCosmeticsLab()});
    document.querySelectorAll('[data-lab-banner]').forEach(b=>b.onclick=()=>{state.labBanner=b.dataset.labBanner;renderCosmeticsLab()});
    labReset.onclick=()=>{state.labDept='A&E';state.labAvatar='ae-male-1';state.labFrame='berry-blossom';state.labBanner='standard-blossom';renderCosmeticsLab()};
    labApply.onclick=async()=>{
      const isHod=state.labAvatar.includes('-hod-');
      if(isHod&&!isManager())return toast('Only admin or department heads may equip gold portraits');
      if(!frameAllowed(state.labFrame))return toast('Preview available. This frame is not currently unlocked for your account.');
      try{await Data.updateProfile({avatar_key:state.labAvatar,frame_key:state.labFrame,banner_key:state.labBanner});await refresh(true);go('profile');toast('New profile look saved')}
      catch(e){toast(e.message)}
    };
    window.scrollTo(0,scrollY);
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
