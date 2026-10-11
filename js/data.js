(function(){
  const cfg=window.BB_CONFIG||{};
  const LOCAL_KEY='bbmc_v14_local';
  const OVERRIDE_KEY='bbmc_v14_backend';
  const SYNTH_DOMAIN='berryblossom.local';

  const seed={
    settings:{theme:'standard',cherry_game_id:'DEMO-CHERRY',coverage_targets:{'A&E':5,'Paediatrics':4,'Maternity & Women’s Health':4,'Surgery':4,'Radiology':3}},
    currentUserId:null,
    accounts:[
      {id:'u_admin',username:'admin',password:'admin',profile_id:'s_admin'},
      {id:'u_rosie',username:'rosie',password:'rosie',profile_id:'s_rosie'}
    ],
    profiles:[
      {id:'s_admin',username:'admin',display_name:'Liam',dob:'1993-05-21',role:'admin',account_status:'active',department:'A&E',rank:'Senior Nurse',maple_role:'Nurse',unit:'Emergency Room',is_head:false,service_points:1240,merits:8,certificate_count:6,roblox_username:'',avatar_key:'nurse',frame_key:'berry-blossom',flare:'Clinical Star',application_score:null},
      {id:'s_rosie',username:'rosie',display_name:'Rosie',dob:'1997-06-14',role:'staff',account_status:'active',department:'A&E',rank:'Senior Nurse',maple_role:'Nurse',unit:'Emergency Room',is_head:false,service_points:1780,merits:5,certificate_count:7,roblox_username:'',avatar_key:'paediatrics',frame_key:'medical',flare:'Care Champion',application_score:84},
      {id:'s_sophie',username:'sophie',display_name:'Sophie',role:'staff',account_status:'active',department:'A&E',rank:'Head of A&E',maple_role:'Doctor',unit:'Emergency Room',is_head:true,service_points:2650,merits:12,certificate_count:11,avatar_key:'doctor',frame_key:'senior-staff',flare:'Department Head'},
      {id:'s_amelia',username:'amelia',display_name:'Amelia',role:'staff',account_status:'active',department:'Paediatrics',rank:'Nurse',maple_role:'Nurse',unit:'Paediatric Unit',is_head:false,service_points:920,merits:3,certificate_count:4,avatar_key:'paediatrics',frame_key:'berry-blossom',flare:''},
      {id:'s_isla',username:'isla',display_name:'Isla',role:'staff',account_status:'active',department:'Surgery',rank:'Doctor',maple_role:'Surgeon',unit:'Theatre',is_head:false,service_points:1450,merits:6,certificate_count:7,avatar_key:'surgeon',frame_key:'medical',flare:''},
      {id:'s_noah',username:'noah',display_name:'Noah',role:'staff',account_status:'active',department:'A&E',rank:'Paramedic',maple_role:'Medic',unit:'EMS',is_head:false,service_points:1110,merits:4,certificate_count:5,avatar_key:'doctor',frame_key:'medical',flare:'Rapid Responder'},
      {id:'s_chloe',username:'chloe',display_name:'Chloe',role:'staff',account_status:'active',department:'Maternity & Women’s Health',rank:'Nurse',maple_role:'Nurse',unit:'Labor & Delivery',is_head:false,service_points:820,merits:2,certificate_count:4,avatar_key:'paediatrics',frame_key:'berry-blossom',flare:''},
      {id:'s_mason',username:'mason',display_name:'Mason',role:'staff',account_status:'active',department:'Radiology',rank:'Doctor',maple_role:'Doctor',unit:'Radiology',is_head:false,service_points:1320,merits:5,certificate_count:6,avatar_key:'radiology',frame_key:'medical',flare:''},
      {id:'s_grace',username:'grace',display_name:'Grace',role:'staff',account_status:'active',department:'Pharmacy',rank:'Pharmacist',maple_role:'Pharmacist',unit:'Pharmacy',is_head:false,service_points:760,merits:2,certificate_count:3,avatar_key:'pharmacy',frame_key:'berry-blossom',flare:''}
    ],
    status:[
      {user_id:'s_admin',on_shift:false,activity:'Available',updated_at:new Date().toISOString()},
      {user_id:'s_rosie',on_shift:true,activity:'With Patient',updated_at:new Date().toISOString()},
      {user_id:'s_sophie',on_shift:true,activity:'Available',updated_at:new Date().toISOString()},
      {user_id:'s_amelia',on_shift:true,activity:'In Training',updated_at:new Date().toISOString()},
      {user_id:'s_isla',on_shift:true,activity:'In Surgery',updated_at:new Date().toISOString()},
      {user_id:'s_noah',on_shift:true,activity:'On Ambulance Call',updated_at:new Date().toISOString()},
      {user_id:'s_chloe',on_shift:false,activity:'Unavailable',updated_at:new Date().toISOString()},
      {user_id:'s_mason',on_shift:true,activity:'Available',updated_at:new Date().toISOString()},
      {user_id:'s_grace',on_shift:false,activity:'Unavailable',updated_at:new Date().toISOString()}
    ],
    shifts:[
      {id:'sh1',title:'A&E Shift',department:'A&E',starts_at:'2026-10-01T18:00:00+01:00',ends_at:'2026-10-01T22:00:00+01:00',capacity:5},
      {id:'sh2',title:'Paediatric Shift',department:'Paediatrics',starts_at:'2026-10-02T19:00:00+01:00',ends_at:'2026-10-02T22:00:00+01:00',capacity:4},
      {id:'sh3',title:'Surgery Support',department:'Surgery',starts_at:'2026-10-03T20:00:00+01:00',ends_at:'2026-10-03T23:00:00+01:00',capacity:4}
    ],
    shift_members:[{shift_id:'sh1',user_id:'s_rosie',status:'assigned'},{shift_id:'sh1',user_id:'s_sophie',status:'assigned'},{shift_id:'sh1',user_id:'s_noah',status:'assigned'}],
    events:[{id:'ev1',title:'Halloween Emergency Night',starts_at:'2026-10-31T19:30:00+00:00',capacity:24,scenario:'Seasonal multi-department emergency roleplay'}],
    event_rsvps:[],
    passport_signoffs:[{user_id:'s_admin',item:'Hospital Tour',signed_by:'s_sophie'},{user_id:'s_admin',item:'Maple Role Selected',signed_by:'s_sophie'}],
    competencies:[{id:'cp1',user_id:'s_admin',title:'Basic Life Support (BLS)',department:'General',training_id:'tr1',signed_by:'s_sophie'}],
    recognition:{id:'global',staff_week:'s_sophie',staff_month:'s_rosie'},
    trainings:[
      {id:'tr1',title:'Basic Life Support (BLS)',department:'General',starts_at:'2026-10-01T18:00:00+01:00',capacity:14,location:'A&E Training Room'},
      {id:'tr2',title:'Paediatric Care',department:'Paediatrics',starts_at:'2026-10-02T19:00:00+01:00',capacity:10,location:'Training Centre'},
      {id:'tr3',title:'Emergency Response',department:'Emergency Response',starts_at:'2026-10-05T18:00:00+01:00',capacity:12,location:'Simulation Ward'}
    ],
    training_attendance:[{training_id:'tr1',user_id:'s_rosie',status:'booked'}],
    announcements:[{id:'a1',title:'Halloween Event Week!',body:'Spooky uniforms, rewards and events are now live.',published_at:'2026-10-01T00:00:00+01:00'}],
    patients:[{id:'p1',alias:'RP-101 Clover',unit:'A&E',stage:'Assessment',scenario:'Fall with arm injury'},{id:'p2',alias:'RP-102 Aster',unit:'Paediatrics',stage:'Observation',scenario:'Fever and dehydration'}],
    requests:[{id:'r1',request_type:'Laboratory',patient_alias:'RP-102 Aster',status:'Pending',notes:'Roleplay sample panel'},{id:'r2',request_type:'Imaging',patient_alias:'RP-101 Clover',status:'Pending',notes:'Arm imaging roleplay request'},{id:'r3',request_type:'Pharmacy',patient_alias:'RP-103 Rose',status:'Pending',notes:'Medication workflow roleplay'}],
    ems:[{id:'e1',location:'Town Centre',scenario:'Fall with possible fracture',status:'Assigned'}],
    codes:[{id:'c1',code:'BLUE',label:'Cardiac Arrest',active:false},{id:'c2',code:'RED',label:'Fire Emergency',active:false},{id:'c3',code:'YELLOW',label:'Missing Patient',active:false}],
    applications:[{id:'ap1',user_id:'app_demo',applicant_name:'MintyPlayer',department:'Nursing',experience:'I enjoy organised Maple Hospital roleplay and supporting newer players.',written_answer:'I want to contribute to a friendly, high quality hospital community.',score:80,status:'pending',submitted_at:new Date().toISOString()}],
    rewards:['first-shift','10-hours','bls-passed','emergency','event'],
    user_rewards:[{user_id:'s_admin',reward_id:'first-shift'},{user_id:'s_admin',reward_id:'10-hours'},{user_id:'s_admin',reward_id:'bls-passed'}]
  };

  const clone=x=>JSON.parse(JSON.stringify(x));
  function localLoad(){try{return Object.assign(clone(seed),JSON.parse(localStorage.getItem(LOCAL_KEY)||'{}'))}catch{return clone(seed)}}
  function localSave(s){localStorage.setItem(LOCAL_KEY,JSON.stringify(s))}
  function overrides(){try{return JSON.parse(localStorage.getItem(OVERRIDE_KEY)||'{}')}catch{return {}}}
  function config(){return Object.assign({},cfg,overrides())}
  function emailFor(username){return `${String(username).trim().toLowerCase().replace(/[^a-z0-9._-]/g,'_')}@${SYNTH_DOMAIN}`}

  const Data={
    client:null, mode:'demo', session:null, profile:null, local:localLoad(), channel:null,
    async init(){
      const c=config();
      if(c.mode!=='demo' && c.supabaseUrl && c.supabaseAnonKey && !window.supabase?.createClient){
        await new Promise((resolve,reject)=>{const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';sc.onload=resolve;sc.onerror=()=>reject(new Error('Could not load Supabase client library'));document.head.appendChild(sc)});
      }
      if(c.mode!=='demo' && c.supabaseUrl && c.supabaseAnonKey && window.supabase?.createClient){
        this.client=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
        this.mode='supabase';
        const {data}=await this.client.auth.getSession();this.session=data.session||null;
        if(this.session) await this.refreshProfile();
      }else{
        this.mode='demo';
        const a=this.local.accounts.find(x=>x.id===this.local.currentUserId);this.session=a?{user:{id:a.profile_id,email:emailFor(a.username)}}:null;this.profile=a?this.local.profiles.find(p=>p.id===a.profile_id)||null:null;
      }
      return this;
    },
    getConfig(){return config()},
    setBackendConfig(v){localStorage.setItem(OVERRIDE_KEY,JSON.stringify(v));},
    clearBackendConfig(){localStorage.removeItem(OVERRIDE_KEY)},
    isLive(){return this.mode==='supabase'},
    async refreshProfile(){
      if(this.mode!=='supabase'||!this.session)return null;
      const {data,error}=await this.client.from('profiles').select('*').eq('id',this.session.user.id).single();if(error)throw error;this.profile=data;return data;
    },
    async signIn(username,password){
      if(this.mode==='supabase'){
        const {data,error}=await this.client.auth.signInWithPassword({email:emailFor(username),password});if(error)throw error;this.session=data.session;await this.refreshProfile();return this.profile;
      }
      const a=this.local.accounts.find(x=>x.username.toLowerCase()===String(username).trim().toLowerCase()&&x.password===password);if(!a)throw new Error('Incorrect username or password');this.local.currentUserId=a.id;localSave(this.local);this.session={user:{id:a.profile_id}};this.profile=this.local.profiles.find(p=>p.id===a.profile_id);return this.profile;
    },
    async signUp({username,password,display_name,dob}){
      if(this.mode==='supabase'){
        const {data,error}=await this.client.auth.signUp({email:emailFor(username),password,options:{data:{username,display_name,dob}}});if(error)throw error;if(!data.session)throw new Error('Account created, but Supabase email confirmation is enabled. Disable email confirmation for this username-only setup, then sign in again.');this.session=data.session;await this.refreshProfile();return this.profile;
      }
      if(this.local.accounts.some(x=>x.username.toLowerCase()===username.toLowerCase()))throw new Error('Username already exists');
      const pid='s_'+Math.random().toString(36).slice(2,10),aid='u_'+Math.random().toString(36).slice(2,10);this.local.accounts.push({id:aid,username,password,profile_id:pid});this.local.profiles.push({id:pid,username,display_name,dob,role:'applicant',account_status:'needs_application',department:null,rank:'Applicant',maple_role:null,unit:null,is_head:false,service_points:0,merits:0,certificate_count:0,roblox_username:'',avatar_key:'nurse',frame_key:'berry-blossom',flare:'',application_score:null});this.local.currentUserId=aid;localSave(this.local);this.session={user:{id:pid}};this.profile=this.local.profiles.find(p=>p.id===pid);return this.profile;
    },
    async signOut(){if(this.mode==='supabase')await this.client.auth.signOut();else{this.local.currentUserId=null;localSave(this.local)}this.session=null;this.profile=null;this.unsubscribe()},
    async applicationStatus(){
      if(!this.profile)return null;
      if(this.mode==='supabase'){
        const {data,error}=await this.client.rpc('get_my_application_status');if(error)throw error;return Array.isArray(data)?data[0]||null:data;
      }
      return this.local.applications.filter(a=>a.user_id===this.profile.id).sort((a,b)=>new Date(b.submitted_at)-new Date(a.submitted_at))[0]||null;
    },
    async getQuiz(department){
      const c=config();
      if(this.mode==='supabase'&&c.quizWorkerUrl){const r=await fetch(c.quizWorkerUrl.replace(/\/$/,'')+`/quiz?department=${encodeURIComponent(department)}`);if(!r.ok)throw new Error('Assessment service unavailable');return (await r.json()).questions||[]}
      const general=[
        {id:'g1',text:'What does BP usually mean on a hospital observation set?',options:['Blood pressure','Body position','Bed priority','Breathing point']},
        {id:'g2',text:'Which action best supports infection control?',options:['Hand hygiene before and after patient contact','Reuse dirty gloves','Ignore spills','Share used dressings']},
        {id:'g3',text:'A patient suddenly becomes very short of breath and unwell. What is the safest roleplay response?',options:['Reassess, communicate and escalate urgently','Ignore it','Wait until shift end','Send them away alone']},
        {id:'g4',text:'What does HR usually mean on observations?',options:['Heart rate','Hospital room','Heat range','Health result']},
        {id:'g5',text:'What makes a useful handover?',options:['Clear, relevant and structured communication','A long unrelated story','No communication','Only the room number']}
      ];
      return [...general,...Array.from({length:5},(_,i)=>({id:'d'+(i+1),text:`${department}: which action best supports safe roleplay?`,options:['Confirm the situation, communicate clearly and escalate appropriately','Ignore changes','Guess the process','Skip handover']}))];
    },
    async submitApplication(payload){
      const c=config();
      if(this.mode==='supabase'){
        if(!c.quizWorkerUrl)throw new Error('Quiz Worker URL is not configured');
        const {data}=await this.client.auth.getSession();const token=data.session?.access_token;if(!token)throw new Error('Your session expired');
        const r=await fetch(c.quizWorkerUrl.replace(/\/$/,'')+'/submit',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+token},body:JSON.stringify(payload)});const j=await r.json();if(!r.ok)throw new Error(j.error||'Could not submit application');await this.refreshProfile();return j;
      }
      // Demo score: all first options are correct.
      const score=Math.round((payload.answers.filter(a=>Number(a.choiceIndex)===0).length/Math.max(1,payload.answers.length))*100),status=score>=70?'pending':'declined';
      this.local.applications.push({id:'ap_'+Math.random().toString(36).slice(2,9),user_id:this.profile.id,applicant_name:this.profile.display_name,department:payload.department,experience:payload.experience,written_answer:payload.written_answer,score,status,submitted_at:new Date().toISOString()});this.profile.account_status=status;this.profile.department=payload.department;localSave(this.local);return {status};
    },
    async loadState(){
      if(this.mode==='demo')return this.localState();
      const c=this.client;
      const [settings,profiles,status,shifts,members,trainings,attendance,events,eventRsvps,passport,competencies,recognition,announcements,patients,requests,ems,codes,rewards,userRewards]=await Promise.all([
        c.from('app_settings').select('*').eq('id','global').single(),c.from('profiles').select('*').eq('account_status','active').order('display_name'),c.from('staff_status').select('*'),c.from('shifts').select('*').order('starts_at'),c.from('shift_members').select('*'),c.from('trainings').select('*').order('starts_at'),c.from('training_attendance').select('*'),c.from('events').select('*').order('starts_at'),c.from('event_rsvps').select('*'),c.from('passport_signoffs').select('*'),c.from('competencies').select('*'),c.from('recognition').select('*').eq('id','global').maybeSingle(),c.from('announcements').select('*').eq('active',true).order('published_at',{ascending:false}),c.from('rp_patients').select('*').order('created_at',{ascending:false}),c.from('hospital_requests').select('*').order('created_at',{ascending:false}),c.from('ems_calls').select('*').order('created_at',{ascending:false}),c.from('emergency_codes').select('*').order('code'),c.from('rewards').select('*'),c.from('user_rewards').select('*').eq('user_id',this.profile.id)
      ]);
      for(const q of [settings,profiles,status,shifts,members,trainings,attendance,events,eventRsvps,passport,competencies,recognition,announcements,patients,requests,ems,codes,rewards,userRewards])if(q.error)console.warn(q.error);
      let applications=[];if(this.profile.role==='admin'){const q=await c.from('applications').select('*').eq('status','pending').order('submitted_at');applications=q.data||[]}
      return {settings:settings.data||{theme:'standard'},profiles:profiles.data||[],status:status.data||[],shifts:shifts.data||[],shift_members:members.data||[],trainings:trainings.data||[],training_attendance:attendance.data||[],events:events.data||[],event_rsvps:eventRsvps.data||[],passport_signoffs:passport.data||[],competencies:competencies.data||[],recognition:recognition.data||{},announcements:announcements.data||[],patients:patients.data||[],requests:requests.data||[],ems:ems.data||[],codes:codes.data||[],applications,rewards:rewards.data||[],user_rewards:userRewards.data||[]};
    },
    localState(){return {settings:this.local.settings,profiles:this.local.profiles,status:this.local.status,shifts:this.local.shifts,shift_members:this.local.shift_members,trainings:this.local.trainings,training_attendance:this.local.training_attendance,events:this.local.events||[],event_rsvps:this.local.event_rsvps||[],passport_signoffs:this.local.passport_signoffs||[],competencies:this.local.competencies||[],recognition:this.local.recognition||{},announcements:this.local.announcements,patients:this.local.patients,requests:this.local.requests,ems:this.local.ems,codes:this.local.codes,applications:this.local.applications.filter(a=>a.status==='pending'),rewards:this.local.rewards.map(id=>({id,name:id.replaceAll('-',' ')})),user_rewards:this.local.user_rewards.filter(x=>x.user_id===this.profile?.id)}} ,
    async clockToggle(activity='Available'){
      if(this.mode==='supabase'){
        const st=await this.client.from('staff_status').select('*').eq('user_id',this.profile.id).maybeSingle();if(st.error)throw st.error;
        const fn=st.data?.on_shift?'clock_out':'clock_in';const {error}=await this.client.rpc(fn,fn==='clock_in'?{p_activity:activity}:{});if(error)throw error;return;
      }
      let s=this.local.status.find(x=>x.user_id===this.profile.id);if(!s){s={user_id:this.profile.id,on_shift:false,activity:'Unavailable'};this.local.status.push(s)}s.on_shift=!s.on_shift;s.activity=s.on_shift?activity:'Unavailable';s.updated_at=new Date().toISOString();localSave(this.local);
    },
    async setActivity(activity){if(this.mode==='supabase'){const {error}=await this.client.rpc('set_my_activity',{p_activity:activity});if(error)throw error}else{let s=this.local.status.find(x=>x.user_id===this.profile.id);if(s){s.activity=activity;s.updated_at=new Date().toISOString();localSave(this.local)}}},
    async applyShift(shiftId){if(this.mode==='supabase'){const {error}=await this.client.rpc('apply_for_shift',{p_shift_id:shiftId});if(error)throw error}else{const i=this.local.shift_members.findIndex(x=>x.shift_id===shiftId&&x.user_id===this.profile.id);if(i>=0)this.local.shift_members.splice(i,1);else this.local.shift_members.push({shift_id:shiftId,user_id:this.profile.id,status:'applied'});localSave(this.local)}},
    async createShift(payload){if(this.mode==='supabase'){const {error}=await this.client.from('shifts').insert({...payload,created_by:this.profile.id});if(error)throw error}else{this.local.shifts.push({id:'sh_'+Date.now(),...payload});localSave(this.local)}},
    async setShiftMemberStatus(shiftId,userId,status){if(this.mode==='supabase'){const {error}=await this.client.from('shift_members').update({status}).eq('shift_id',shiftId).eq('user_id',userId);if(error)throw error}else{const m=this.local.shift_members.find(x=>x.shift_id===shiftId&&x.user_id===userId);if(m)m.status=status;localSave(this.local)}},
    async createTraining(payload){if(this.mode==='supabase'){const {error}=await this.client.from('trainings').insert({...payload,created_by:this.profile.id});if(error)throw error}else{this.local.trainings.push({id:'tr_'+Date.now(),...payload});localSave(this.local)}},
    async createEvent(payload){if(this.mode==='supabase'){const {error}=await this.client.from('events').insert({...payload,created_by:this.profile.id});if(error)throw error}else{this.local.events||=[];this.local.events.push({id:'ev_'+Date.now(),...payload});localSave(this.local)}},
    async setTrainingResult(trainingId,userId,status){if(this.mode==='supabase'){const {error}=await this.client.rpc('set_training_result',{p_training_id:trainingId,p_user_id:userId,p_status:status});if(error)throw error}else{let a=this.local.training_attendance.find(x=>x.training_id===trainingId&&x.user_id===userId);if(!a){a={training_id:trainingId,user_id:userId,status};this.local.training_attendance.push(a)}else a.status=status;if(status==='passed'&&!this.local.competencies.some(c=>c.training_id===trainingId&&c.user_id===userId)){const tr=this.local.trainings.find(t=>t.id===trainingId);this.local.competencies.push({id:'cp_'+Date.now(),user_id:userId,title:tr?.title||'Training',department:tr?.department,training_id:trainingId,signed_by:this.profile.id});const p=this.local.profiles.find(x=>x.id===userId);if(p){p.certificate_count=(p.certificate_count||0)+1;p.service_points=(p.service_points||0)+10}}localSave(this.local)}},
    async signPassport(userId,item){if(this.mode==='supabase'){const {error}=await this.client.rpc('sign_passport',{p_user_id:userId,p_item:item});if(error)throw error}else{this.local.passport_signoffs||=[];const i=this.local.passport_signoffs.findIndex(x=>x.user_id===userId&&x.item===item);if(i<0)this.local.passport_signoffs.push({user_id:userId,item,signed_by:this.profile.id});localSave(this.local)}},
    async manageStaff(userId,values){if(this.mode==='supabase'){const {error}=await this.client.rpc('manage_staff_record',{p_user_id:userId,p_rank:values.rank,p_maple_role:values.maple_role,p_unit:values.unit,p_merits:Number(values.merits||0),p_is_head:!!values.is_head});if(error)throw error}else{const p=this.local.profiles.find(x=>x.id===userId);if(p)Object.assign(p,values,{merits:Number(values.merits||0)});localSave(this.local)}},
    async setRecognition(weekId,monthId){if(this.mode==='supabase'){const {error}=await this.client.rpc('set_recognition',{p_staff_week:weekId||null,p_staff_month:monthId||null});if(error)throw error}else{this.local.recognition={id:'global',staff_week:weekId||null,staff_month:monthId||null};localSave(this.local)}},
    async setCoverage(targets){if(this.mode==='supabase'){const {error}=await this.client.rpc('set_coverage_targets',{p_targets:targets});if(error)throw error}else{this.local.settings.coverage_targets=targets;localSave(this.local)}},
    async toggleEvent(eventId){if(this.mode==='supabase'){const {error}=await this.client.rpc('toggle_event_rsvp',{p_event_id:eventId});if(error)throw error}else{this.local.event_rsvps||=[];const i=this.local.event_rsvps.findIndex(x=>x.event_id===eventId&&x.user_id===this.profile.id);if(i>=0)this.local.event_rsvps.splice(i,1);else this.local.event_rsvps.push({event_id:eventId,user_id:this.profile.id,role:this.profile.maple_role||'Staff'});localSave(this.local)}},
    async joinTraining(trainingId){if(this.mode==='supabase'){const {error}=await this.client.rpc('toggle_training_booking',{p_training_id:trainingId});if(error)throw error}else{const i=this.local.training_attendance.findIndex(x=>x.training_id===trainingId&&x.user_id===this.profile.id);if(i>=0)this.local.training_attendance.splice(i,1);else this.local.training_attendance.push({training_id:trainingId,user_id:this.profile.id,status:'booked'});localSave(this.local)}},
    async updateProfile(values){
      if(this.mode==='supabase'){
        const payload={p_display_name:values.display_name??this.profile.display_name,p_dob:values.dob??this.profile.dob,p_roblox_username:values.roblox_username??this.profile.roblox_username,p_avatar_key:values.avatar_key??this.profile.avatar_key,p_frame_key:values.frame_key??this.profile.frame_key,p_flare:values.flare??this.profile.flare,p_banner_key:values.banner_key??this.profile.banner_key??'blossom-courtyard',p_bio:values.bio??this.profile.bio??'',p_status_message:values.status_message??this.profile.status_message??''};
        let {error}=await this.client.rpc('update_my_profile_v14',payload);
        if(error){const legacy={p_display_name:payload.p_display_name,p_dob:payload.p_dob,p_roblox_username:payload.p_roblox_username,p_avatar_key:payload.p_avatar_key,p_frame_key:payload.p_frame_key,p_flare:payload.p_flare};({error}=await this.client.rpc('update_my_profile',legacy));}
        if(error)throw error;await this.refreshProfile()
      } else {Object.assign(this.profile,values);localSave(this.local)}
    },
    async setCherryGameId(gameId){if(this.profile.role!=='admin')throw new Error('Only administrators can set the Cherry Blossom server');if(this.mode==='supabase'){const {error}=await this.client.rpc('set_cherry_server',{p_game_id:String(gameId||'')});if(error)throw error}else{this.local.settings.cherry_game_id=String(gameId||'');localSave(this.local)}},
    async setTheme(theme){if(this.profile.role!=='admin')throw new Error('Only administrators can change the global theme');if(this.mode==='supabase'){const {error}=await this.client.rpc('set_global_theme',{p_theme:theme});if(error)throw error}else{this.local.settings.theme=theme;localSave(this.local)}},
    async reviewApplication(id,decision,notes=''){if(this.mode==='supabase'){const {error}=await this.client.rpc('review_application',{p_application_id:id,p_decision:decision,p_notes:notes});if(error)throw error}else{const a=this.local.applications.find(x=>x.id===id);if(!a)return;a.status=decision;const p=this.local.profiles.find(x=>x.id===a.user_id);if(p){p.account_status=decision==='approved'?'active':'declined';if(decision==='approved'){p.role='staff';p.rank='Staff Member';p.department=a.department;p.maple_role='Nurse';p.unit='General Ward';p.application_score=a.score}}localSave(this.local)}},
    async createPatient(payload){if(this.mode==='supabase'){const {error}=await this.client.from('rp_patients').insert(payload);if(error)throw error}else{this.local.patients.unshift({id:'p_'+Date.now(),...payload,created_at:new Date().toISOString()});localSave(this.local)}},
    async createRequest(payload){if(this.mode==='supabase'){const {error}=await this.client.from('hospital_requests').insert(payload);if(error)throw error}else{this.local.requests.unshift({id:'r_'+Date.now(),...payload,created_at:new Date().toISOString()});localSave(this.local)}},
    async createEms(payload){if(this.mode==='supabase'){const {error}=await this.client.from('ems_calls').insert(payload);if(error)throw error}else{this.local.ems.unshift({id:'e_'+Date.now(),...payload,created_at:new Date().toISOString()});localSave(this.local)}},
    async setCode(id,active){if(this.mode==='supabase'){const {error}=await this.client.from('emergency_codes').update({active,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error}else{const c=this.local.codes.find(x=>x.id===id);if(c)c.active=active;localSave(this.local)}},
    async robloxPresence(profiles){const c=config();if(!c.robloxWorkerUrl)return {};const linked=profiles.filter(p=>p.roblox_username);if(!linked.length)return {};const ids={};for(const p of linked){try{let uid=p.roblox_user_id;if(!uid){const r=await fetch(c.robloxWorkerUrl.replace(/\/$/,'')+`/resolve?username=${encodeURIComponent(p.roblox_username)}`);if(r.ok){const j=await r.json();uid=j.id||null}}if(uid)ids[p.id]=String(uid)}catch{}}
      const vals=Object.values(ids);if(!vals.length)return {};try{const r=await fetch(c.robloxWorkerUrl.replace(/\/$/,'')+`/presence?ids=${encodeURIComponent(vals.join(','))}`);if(!r.ok)return {};const j=await r.json(),arr=j.userPresences||[];const byId=Object.fromEntries(arr.map(x=>[String(x.userId),x]));return Object.fromEntries(Object.entries(ids).map(([pid,uid])=>[pid,byId[uid]||null]))}catch{return {}}
    },
    subscribe(cb){if(this.mode!=='supabase')return;this.unsubscribe();this.channel=this.client.channel('berry-live');for(const table of ['app_settings','profiles','staff_status','shifts','shift_members','trainings','training_attendance','events','event_rsvps','passport_signoffs','competencies','recognition','announcements','rp_patients','hospital_requests','ems_calls','emergency_codes','applications'])this.channel.on('postgres_changes',{event:'*',schema:'public',table},()=>cb(table));this.channel.subscribe()},
    unsubscribe(){if(this.channel&&this.client){this.client.removeChannel(this.channel);this.channel=null}}
  };
  window.BBData=Data;
})();
