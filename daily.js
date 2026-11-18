/* KZMD128 Daily — additive module. No existing Roadmap / English / Study data is migrated or deleted. */
(() => {
 'use strict';
 const el=document.querySelector('#daily');if(!el)return;
 const $d=s=>el.querySelector(s);
 const ehtml=s=>esc(s);
 const DMIN='0001-01-01';
 const SCHEMES=['daily','roadmap','weekly','once'],MODES=['checkbox','quantity','percentage','checklist'];
 const SCHEDULE={daily:'Hằng ngày',roadmap:'Theo Day',weekly:'Theo tuần',once:'Một lần'};
 const PROGRESS={checkbox:'Checkbox',quantity:'Số lượng',percentage:'Phần trăm',checklist:'Checklist'};
 const dateKey=()=>today();
 const safeDate=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!isNaN(Date.parse(x+'T12:00:00'))?x:null;
 const dateLong=x=>x?new Date(x+'T12:00:00').toLocaleDateString('vi-VN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'';
 const dtShort=x=>x?new Date(x+'T12:00:00').toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}):'';
 const utcNum=s=>{const [y,m,d]=s.split('-').map(Number);return Date.UTC(y,m-1,d)/86400000};
 const diff=(a,b)=>Math.round(utcNum(a)-utcNum(b));
 const addDate=(s,days)=>{const [y,m,d]=s.split('-').map(Number);return new Date(Date.UTC(y,m-1,d+days)).toISOString().slice(0,10)};
 const weekDay=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12).getDay()};
 const validNum=(x,def=0)=>Number.isFinite(Number(x))?Number(x):def;
 const id=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`d${Date.now()}_${Math.random().toString(36).slice(2)}`;
 const clamp=(n,min,max)=>Math.min(max,Math.max(min,validNum(n)));
 const i=n=>`<svg class="i"><use href="#i-${n}"/></svg>`;
 const root=()=>{if(!D.daily||typeof D.daily!=='object'||Array.isArray(D.daily))D.daily={};const x=D.daily;
  if(!Array.isArray(x.goals))x.goals=[];
  if(!x.records||typeof x.records!=='object'||Array.isArray(x.records))x.records={};
  if(!x.journals||typeof x.journals!=='object'||Array.isArray(x.journals))x.journals={};
  if(!x.cfg||typeof x.cfg!=='object')x.cfg={};x.version=1;return x};
 const orderedGoals=()=>root().goals.filter(g=>g&&g.id&&Array.isArray(g.versions)&&g.versions.length);
 const getGoal=gid=>orderedGoals().find(g=>g.id===gid);
 const versionAt=(g,date)=>{if(!g||!g.versions)return null;const V=g.versions.filter(v=>v&&v.from<=date).sort((a,b)=>b.from.localeCompare(a.from));return V[0]||null};
 const dayTask=(g,date)=>{if(!g)return null;if(g.deletedAt&&date>=g.deletedAt||g.archivedAt&&date>=g.archivedAt)return null;
  const v=versionAt(g,date);if(!v||!safeDate(v.start)||date<v.start)return null;
  if(v.schedule==='roadmap'){const n=diff(date,v.start)+1;if(n<1||n>Math.max(1,Number(v.days)||1))return null;return {g,v,date,n}}
  if(v.schedule==='weekly'&&!(Array.isArray(v.weekdays)?v.weekdays:[]).includes(weekDay(date)))return null;
  if(v.schedule==='once'&&date!==v.start)return null;
  return {g,v,date,n:null};};
 const tasksOn=date=>orderedGoals().map(g=>dayTask(g,date)).filter(Boolean);
 const recKey=(id,date)=>`${id}|${date}`;
 const getRec=t=>root().records[recKey(t.g.id,t.date)]||null;
 const ensure=t=>{const R=root().records,k=recKey(t.g.id,t.date);if(!R[k])R[k]={goalId:t.g.id,date:t.date,dayNumber:t.n,
  progressType:t.v.progress,quantityTarget:t.v.target,unit:t.v.unit,items:(t.v.items||[]).map(x=>({...x})),
  value:0,checked:false,checks:{},notes:'',completedAt:null,completedOn:null,updatedAt:null};return R[k]};
 const itemsFor=(t,r)=>Array.isArray(r?.items)?r.items:(Array.isArray(t.v.items)?t.v.items:[]);
 const typeFor=(t,r)=>MODES.includes(r?.progressType)?r.progressType:t.v.progress;
 function progress(t){const r=getRec(t),mode=typeFor(t,r);if(!r)return 0;
  if(mode==='checkbox')return r.checked?100:0;
  if(mode==='quantity')return Math.round(clamp((validNum(r.value)/Math.max(.0000001,validNum(r.quantityTarget,t.v.target)))*100,0,100)*10)/10;
  if(mode==='percentage')return clamp(r.value,0,100);
  if(mode==='checklist'){const items=itemsFor(t,r);return items.length?Math.round(items.filter(x=>r.checks&&r.checks[x.id]).length/items.length*1000)/10:0}
  return 0;}
 const completed=t=>progress(t)>=100;
 const expandedChecklists=new Set();
 const completedLate=t=>{const r=getRec(t);return completed(t)&&r&&r.completedOn&&r.completedOn>t.date};
 const completedOnTime=t=>{const r=getRec(t);return completed(t)&&r&&r.completedOn===t.date};
 function saveDaily(){return save();}
 function mutate(t,kind,value){const r=ensure(t),old=progress(t),mode=typeFor(t,r);
  if(kind==='checked'&&mode==='checkbox')r.checked=!!value;
  else if(kind==='quantity'&&mode==='quantity')r.value=Math.max(0,validNum(value));
  else if(kind==='percentage'&&mode==='percentage')r.value=clamp(value,0,100);
  else if(kind==='sub'&&mode==='checklist'&&itemsFor(t,r).some(x=>x.id===value.id))r.checks[value.id]=!!value.checked;
  else if(kind==='notes')r.notes=String(value||'').slice(0,5000);
  const now=new Date();r.updatedAt=now.toISOString();const p=progress(t);
  if(old<100&&p>=100){r.completedAt=now.toISOString();r.completedOn=dateKey()}
  else if(p<100){r.completedAt=null;r.completedOn=null}
  saveDaily();return r;}
 const daySummary=d=>{const all=tasksOn(d),done=all.filter(completed).length,avg=all.length?Math.round(all.reduce((s,t)=>s+progress(t),0)/all.length):0;
  const onTime=all.filter(completedOnTime).length;
  let state='none';if(all.length&&d<=dateKey()){if(done===all.length)state='complete';else if(d<dateKey())state='missed';else if(avg>0)state='progress';else state='todo'}
  return {all,done,avg,onTime,state,late:all.some(completedLate)};};
 function allPending(){const now=dateKey(),L=[];
  for(const g of orderedGoals()){
   const first=g.versions.reduce((s,v)=>v&&safeDate(v.start)&&v.start<s?v.start:s,now);
   if(first>=now)continue;
   for(let d=first;d<now;d=addDate(d,1)){
    const t=dayTask(g,d);if(t&&!completed(t))L.push(t);
   }
  }
  return L.sort((a,b)=>a.date.localeCompare(b.date)||a.g.id.localeCompare(b.g.id));}
 function dayMetrics(pending){const now=dateKey(),m=now.slice(0,7),start=m+'-01',end=addDate(addDate(start,32).slice(0,7)+'-01',-1);
  let completedDays=0,missed=0,totalEligible=0,totalOntime=0;
  for(let d=start;d<=now&&d<=end;d=addDate(d,1)){
   const s=daySummary(d);if(!s.all.length)continue;
   totalEligible+=s.all.length;totalOntime+=s.onTime;
   if(s.done===s.all.length)completedDays++;if(d<now&&s.onTime<s.all.length)missed++;
  }
  let streak=0,started=false,earliest=now;
  orderedGoals().forEach(g=>g.versions.forEach(v=>{if(safeDate(v.start)&&v.start<earliest)earliest=v.start}));
  for(let d=now;d>=earliest;d=addDate(d,-1)){
   const s=daySummary(d);if(!s.all.length)continue;
   if(d===now&&s.onTime<s.all.length)continue; // ongoing today does not break yesterday's streak
   started=true;
   if(s.onTime!==s.all.length)break;
   streak++;
  }
  return {completedDays,missed,streak,onTimeRate:totalEligible?Math.round(100*totalOntime/totalEligible):0,pending:pending.length};}
 function taskHTML(t,opts={}){const r=getRec(t),p=progress(t),mode=typeFor(t,r),done=p>=100;
  const detail=t.n?` · Day ${t.n}`:'';
  const dateInfo=opts.past?dtShort(t.date):(t.v.schedule==='roadmap'?`Theo lộ trình ${t.v.days} Day`:SCHEDULE[t.v.schedule]);
  let control='';
  if(mode==='checkbox')control=`<button type="button" class="d-big-check ${done?'isdone':''}" data-dact="check" data-id="${t.g.id}" data-date="${t.date}" aria-label="${done?'Bỏ hoàn thành':'Đánh dấu hoàn thành'}" aria-pressed="${done}">${done?i('check'):''}</button>`;
  if(mode==='quantity'){
   const qty=validNum(r?.value),target=validNum(r?.quantityTarget,t.v.target),unit=ehtml(r?.unit||t.v.unit||'');
   control=`<div class="d-task-details"><span class="d-task-badge">${qty}/${target} ${unit} · ${p}%</span><div class="d-mini-track"><i style="width:${p}%"></i></div><div class="d-value-actions"><button type="button" class="d-step" aria-label="Giảm" data-dact="minus" data-id="${t.g.id}" data-date="${t.date}">−</button><input class="d-number" type="number" inputmode="decimal" min="0" step="any" value="${qty}" aria-label="Số lượng hoàn thành" data-dqty="${t.g.id}" data-date="${t.date}"><button type="button" class="d-step" aria-label="Tăng" data-dact="plus" data-id="${t.g.id}" data-date="${t.date}">+</button><span class="d-unit">/ ${target} ${unit}</span></div></div>`;}
  if(mode==='percentage')control=`<div class="d-task-details"><span class="d-task-badge">${p}% hoàn thành</span><div class="d-mini-track"><i style="width:${p}%"></i></div><div class="d-value-actions"><input class="d-percent-range" type="range" min="0" max="100" step="1" value="${p}" aria-label="Điều chỉnh phần trăm" data-dpct="${t.g.id}" data-date="${t.date}"><input class="d-number" type="number" min="0" max="100" step="1" value="${p}" aria-label="Phần trăm chính xác" data-dpercent="${t.g.id}" data-date="${t.date}"><span class="d-unit">%</span></div></div>`;
  if(mode==='checklist'){
   const items=itemsFor(t,r),checks=r?.checks||{},count=items.filter(x=>checks[x.id]).length;
   control=`<div class="d-task-details"><span class="d-task-badge">${count}/${items.length} việc · ${p}%</span><div class="d-mini-track"><i style="width:${p}%"></i></div>${items.length?`<details ${opts.expanded||expandedChecklists.has(recKey(t.g.id,t.date))?'open':''}><summary class="d-inline-note" data-dsummary="${t.g.id}" data-date="${t.date}">${opts.expanded?'Nhiệm vụ con':'Xem nhiệm vụ con'} (${items.length})</summary><div class="d-checklist">${items.map(x=>`<label class="d-checkrow ${checks[x.id]?'checked':''}"><input type="checkbox" data-dsub="${t.g.id}" data-date="${t.date}" data-sub="${ehtml(x.id)}" ${checks[x.id]?'checked':''}><span>${ehtml(x.name)}</span></label>`).join('')}</div></details>`:'<p class="d-inline-note">Chưa có nhiệm vụ con. Chỉnh sửa mục tiêu để thêm.</p>'}</div>`;}
  const status=done?(completedLate(t)?'<span class="d-status late">Completed Late</span>':'<span class="d-status done">Completed</span>'):(opts.past?'<span class="d-status missed">Overdue</span>':'');
  return `<article class="d-task ${done?'done':''}"><div class="d-task-content"><div class="d-task-head"><div><div class="d-task-name">${ehtml(t.v.name||'Mục tiêu')}${t.n?' <span style="color:var(--d-muted);font-weight:500">— Day '+t.n+'</span>':''}</div><div class="d-task-caption">${dateInfo} ${status?' · '+status:''}</div></div></div>${t.v.description?`<div class="d-inline-note">${ehtml(t.v.description)}</div>`:''}${control}</div><div class="d-task-actions">${mode==='checkbox'?'':done?`<span class="d-status done">${i('check')}</span>`:''}<button class="d-icon-btn" type="button" data-dact="entry" data-id="${t.g.id}" data-date="${t.date}" title="Ghi chú / Chi tiết" aria-label="Chi tiết">${i('para')}</button><button class="d-icon-btn" type="button" data-dact="edit" data-id="${t.g.id}" title="Sửa mục tiêu" aria-label="Chỉnh sửa">${i('edit')}</button></div></article>`;}
 function renderHero(){const summary=daySummary(dateKey()),p=summary.avg;
  $d('#dHero').innerHTML=`<div class="d-brandline"><img src="icons/icon-192-v4.png" alt=""/> KZMD128 <em>Progress, Every Day.</em></div><div class="d-hero-top"><div><div class="d-eyebrow">${ehtml(dateLong(dateKey()))}</div><h1 class="d-heading">Today<span style="color:var(--d-accent)">.</span></h1><p>${summary.all.length?`Đã hoàn thành <b>${summary.done}/${summary.all.length}</b> mục tiêu hôm nay.`:'Một ngày mới để bắt đầu hành trình của bạn.'}</p></div><div class="d-hero-actions"><button type="button" class="d-secondary-btn" data-dact="backup" title="Sao lưu / Khôi phục" aria-label="Sao lưu / Khôi phục">${i('save')}</button><button type="button" class="d-primary-btn" data-dact="create">${i('plus')} Thêm mục tiêu</button></div></div><div class="d-hero-bottom"><div><div class="d-eyebrow">Trung bình tiến độ các mục tiêu</div><div style="font-size:13px;color:var(--d-muted);margin-top:7px">${summary.all.length?'Tiến độ được tính riêng cho từng mục tiêu.':'Chưa có mục tiêu nào được lên lịch.'}</div><div class="d-progress-line"><i style="width:${summary.all.length?p:0}%"></i></div></div><div class="d-ring" style="--a:${p}%"><b>${summary.all.length?p:0}%</b><small>PROGRESS</small></div></div>`;}
 function renderToday(){const tasks=tasksOn(dateKey());$d('#dTodayCount').textContent=`${tasks.filter(completed).length}/${tasks.length}`;
  $d('#dTodayList').innerHTML=tasks.length?tasks.map(t=>taskHTML(t)).join(''):`<div class="d-empty"><span class="d-empty-symbol">✦</span>Hôm nay chưa có nhiệm vụ nào.<div style="margin-top:13px"><button type="button" class="d-secondary-btn" data-dact="create">${i('plus')} Tạo mục tiêu đầu tiên</button></div></div>`;
  const finished=orderedGoals().map(g=>({g,v:versionAt(g,dateKey())})).filter(({g,v})=>v&&v.schedule==='roadmap'&&v.days>0&&dateKey()>addDate(v.start,v.days-1)&&!g.archivedAt);
  $d('#dEndedList').innerHTML=finished.length?`<div class="d-ended"><div class="d-eyebrow">Lộ trình đã kết thúc</div>${finished.map(({g,v})=>{let done=0;for(let n=0;n<v.days;n++){const t=dayTask(g,addDate(v.start,n));if(t&&completed(t))done++}return `<div class="d-ended-row"><div><b>${ehtml(v.name)}</b><small>${dtShort(v.start)} – ${dtShort(addDate(v.start,v.days-1))}</small></div><div><strong>${done}/${v.days} Day</strong><small>${v.days-done} chưa hoàn thành</small></div></div>`}).join('')}</div>`:'';}
 let pendingExpanded=true,pendingMax=5;
 function renderPending(pending){$d('#dPendingCount').textContent=pending.length;$d('#dPendingToggle').setAttribute('aria-expanded',pendingExpanded);
  $d('#dPendingBody').hidden=!pendingExpanded;if(!pendingExpanded)return;
  if(!pending.length){$d('#dPendingBody').innerHTML='<p class="d-empty" style="padding:14px">Không có mục tiêu tồn đọng.</p>';return;}
  const map=new Map();pending.forEach(t=>{if(!map.has(t.g.id))map.set(t.g.id,[]);map.get(t.g.id).push(t)});
  $d('#dPendingBody').innerHTML=`<div class="d-pending-list">${[...map.entries()].map(([gid,items])=>`<div class="d-pgroup"><header><span>${ehtml(items[0].v.name)}</span><span class="d-bubble">${items.length}</span></header>${items.slice(0,pendingMax).map(t=>`<div class="d-p-row"><div><b>${t.n?'Day '+t.n:'Nhiệm vụ'} · ${dtShort(t.date)}</b><small>${progress(t)}% hoàn thành · Overdue</small></div><button class="d-secondary-btn" data-dact="entry" data-id="${gid}" data-date="${t.date}">Làm bù</button></div>`).join('')}${items.length>pendingMax?`<button class="d-more" data-dact="showmore">Xem thêm ${items.length-pendingMax} ngày</button>`:''}</div>`).join('')}</div>`;}
 const monthKey=d=>d.slice(0,7);
 function renderCalendar(pending){const state=root().cfg,month=/^\d{4}-\d{2}$/.test(state.month)?state.month:monthKey(dateKey()),select=safeDate(state.selected)||dateKey();
  const [y,m]=month.split('-').map(Number),head=new Date(y,m-1,1,12).toLocaleDateString('vi-VN',{month:'long',year:'numeric'});
  const first=(new Date(y,m-1,1).getDay()+6)%7,num=new Date(y,m,0).getDate();
  $d('#dMonth').textContent=head;
  let html='';for(let z=0;z<first;z++)html+='<span class="d-calday blank"></span>';
  for(let j=1;j<=num;j++){const d=`${month}-${String(j).padStart(2,'0')}`,s=daySummary(d),hasJournal=!!Object.values(root().journals[d]||{}).some((v,i)=>['did','learned','notes'].includes(Object.keys(root().journals[d]||{})[i])&&String(v||'').trim());
   html+=`<button type="button" data-dact="pickdate" data-date="${d}" data-state="${s.state}" class="d-calday${dateKey()===d?' today':''}${select===d?' selected':''}" aria-label="${dtShort(d)}: ${s.state}">${j}${hasJournal?'<i title="Có nhật ký"></i>':''}${s.late?'<em title="Có nhiệm vụ hoàn thành muộn">↗</em>':''}</button>`;}
  $d('#dCalGrid').innerHTML=html;
  const metric=dayMetrics(pending);$d('#dMetrics').innerHTML=`<div><strong>${metric.completedDays}</strong><small>Ngày hoàn thành tháng này</small></div><div><strong>${metric.missed}</strong><small>Ngày bỏ lỡ tháng này</small></div><div><strong>${metric.streak}</strong><small>Chuỗi đúng hạn</small></div><div><strong>${metric.onTimeRate}%</strong><small>Mục tiêu đúng hạn tháng này</small></div><div><strong>${metric.pending}</strong><small>Việc tồn đọng</small></div><div><button class="d-secondary-btn" data-dact="manage" style="font-size:11px">Quản lý mục tiêu</button></div>`;
  renderSelected(select);}
 function renderSelected(date){const s=daySummary(date),sel=$d('#dSelected');
  if(date===dateKey()){sel.innerHTML=`<small>Đang xem Today · ${dtShort(date)}. Chọn ngày trên lịch để xem lịch sử và nhật ký.</small>`;return;}
  sel.innerHTML=`<strong>${ehtml(dateLong(date))} · ${s.done}/${s.all.length} mục tiêu</strong>${s.all.length?s.all.map(t=>`<div class="d-selected-row"><span>${ehtml(t.v.name)}${t.n?' — Day '+t.n:''}<br><small>${progress(t)}% · ${completed(t)?(completedLate(t)?'Completed Late':'Completed'):(date<dateKey()?'Missed':'In Progress')}</small></span><button type="button" class="d-secondary-btn" data-dact="entry" data-id="${t.g.id}" data-date="${date}">Chi tiết</button></div>`).join(''):'<small>Ngày này không có mục tiêu được lên lịch.</small>'}`;}
 let journalDate=null,saveTimer=null;
 function renderJournal(){const d=safeDate(root().cfg.selected)||dateKey();if(journalDate===d)return;journalDate=d;
  const j=root().journals[d]||{};$d('#dJournalDate').textContent=dtShort(d);
  $d('#dJournalFields').innerHTML=`<label>What I Did <span>Những việc đã thực hiện</span><textarea data-djournal="did" placeholder="Hôm nay mình đã làm được gì?">${ehtml(j.did||'')}</textarea></label><label>What I Learned <span>Điều mới học được</span><textarea data-djournal="learned" placeholder="Điều đáng ghi nhớ hôm nay…">${ehtml(j.learned||'')}</textarea></label><label>Personal Notes <span>Ghi chú và suy ngẫm</span><textarea data-djournal="notes" placeholder="Để lại một vài dòng cho bản thân…">${ehtml(j.notes||'')}</textarea></label>`;
  $d('#dJournalSaved').textContent=j.updatedAt?'Đã lưu trước đó':'Chưa viết nhật ký';$d('#dJournalSaved').classList.remove('failed');}
 function saveJournal(){if(!journalDate)return;
  const obj=root().journals[journalDate]||{};
  $d('#dJournalFields').querySelectorAll('[data-djournal]').forEach(e=>obj[e.dataset.djournal]=e.value);
  obj.updatedAt=new Date().toISOString();root().journals[journalDate]=obj;
  const ok=saveDaily();$d('#dJournalSaved').textContent=ok?'Đã lưu trên thiết bị':'Lưu thất bại — kiểm tra bộ nhớ';$d('#dJournalSaved').classList.toggle('failed',!ok);
  // update journal markers without recreating the textareas or interrupting typing
  const btn=$d(`#dCalGrid [data-date="${journalDate}"]`);
  if(btn){const any=['did','learned','notes'].some(k=>String(obj[k]||'').trim());let mark=btn.querySelector('i');if(any&&!mark){mark=document.createElement('i');mark.title='Có nhật ký';btn.appendChild(mark)}else if(!any&&mark)mark.remove()}}
 let lastDay=dateKey();
 function renderAll(){root();renderHero();renderToday();const pending=allPending();renderPending(pending);renderCalendar(pending);renderJournal();}
 function refresh(){journalDate=null;lastDay=dateKey();root().cfg.selected=safeDate(root().cfg.selected)||dateKey();root().cfg.month=monthKey(root().cfg.selected);renderAll();}
 function updateGoalForm(form){const schedule=form.querySelector('[name=schedule]').value,progress=form.querySelector('[name=progress]').value;
  form.querySelectorAll('[data-only]').forEach(s=>s.hidden=!s.dataset.only.split(' ').includes(schedule)&&!s.dataset.only.split(' ').includes(progress));
  form.querySelectorAll('[data-week]').forEach(b=>b.classList.toggle('on',(form.dataset.week||'').split(',').map(Number).includes(+b.dataset.week)));}
 function formVersion(g){return g?versionAt(g,dateKey())||g.versions.at(-1):{name:'',description:'',schedule:'daily',progress:'checkbox',start:dateKey(),days:100,weekdays:[1,3,5],target:5,unit:'',items:[]}}
 function showShade(html){closeShade();const shade=document.createElement('div');shade.className='d-modalshade';shade.innerHTML=`<div class="d-modal" role="dialog" aria-modal="true" aria-label="Daily">${html}</div>`;document.body.appendChild(shade);shade.addEventListener('click',e=>{if(e.target===shade)closeShade()});return shade;}
 function closeShade(){const old=document.querySelector('.d-modalshade');if(old)old.remove();}
 function openGoal(gid){const g=gid?getGoal(gid):null,v=formVersion(g),items=Array.isArray(v.items)?v.items:[];
  const sh=showShade(`<div class="d-modal-head"><div><div class="d-eyebrow">KZMD128 / Daily</div><h2>${g?'Chỉnh sửa mục tiêu':'Thêm mục tiêu'}</h2></div><button class="d-icon-btn" data-dact="close" aria-label="Đóng">${i('x')}</button></div><form class="d-form" id="dGoalForm"><label>Tên mục tiêu<input name="name" maxlength="100" autocomplete="off" required placeholder="Ví dụ: IELTS" value="${ehtml(v.name||'')}"></label><label>Mô tả (không bắt buộc)<textarea name="description" rows="2" maxlength="500" placeholder="Điều bạn muốn ghi nhớ…">${ehtml(v.description||'')}</textarea></label><div class="d-formrow"><label>Kiểu lịch trình<select name="schedule"><option value="daily">Hằng ngày</option><option value="roadmap">Day Roadmap</option><option value="weekly">Theo tuần</option><option value="once">Một lần</option></select></label><label>Đo tiến độ<select name="progress"><option value="checkbox">Checkbox ✓</option><option value="quantity">Số lượng</option><option value="percentage">Phần trăm</option><option value="checklist">Checklist</option></select></label></div><div class="d-formrow"><label>Ngày bắt đầu<input type="date" name="start" required value="${ehtml(v.start||dateKey())}"></label><label data-only="roadmap">Tổng số Day<input type="number" min="1" max="20000" step="1" name="days" value="${v.days||100}"></label></div><div data-only="weekly"><label>Ngày trong tuần</label><div class="d-weekpick">${[['CN',0],['T2',1],['T3',2],['T4',3],['T5',4],['T6',5],['T7',6]].map(([text,n])=>`<button type="button" data-week="${n}">${text}</button>`).join('')}</div></div><div class="d-formrow" data-only="quantity"><label>Chỉ tiêu / ngày<input name="target" type="number" step="any" min="0.000001" value="${v.target||5}"></label><label>Đơn vị<input name="unit" maxlength="30" placeholder="câu, trang, phút…" value="${ehtml(v.unit||'')}"></label></div><div data-only="checklist"><label>Nhiệm vụ con (mỗi dòng một việc)<textarea name="items" rows="4" placeholder="Một việc trên mỗi dòng">${ehtml(items.map(x=>x.name).join('\n'))}</textarea></label><p class="d-formhint">Chỉ tạo nhiệm vụ con khi bạn chọn Checklist. Không tự tạo từ tên mục tiêu.</p></div><p class="d-formhint">Lịch trình và kiểu tiến độ là hai tùy chọn độc lập. Checkbox là mặc định.</p>${g?'<p class="d-formhint" style="color:var(--d-warn)">Thay đổi cấu hình áp dụng từ hôm nay. Các bản ghi và lịch sử trước hôm nay vẫn được giữ nguyên.</p>':''}<div class="d-form-footer"><button type="button" class="d-secondary-btn" data-dact="close">Hủy</button><button type="submit" class="d-primary-btn">${g?'Lưu thay đổi':'Tạo mục tiêu'}</button></div></form>`);
  const form=sh.querySelector('#dGoalForm');form.elements.schedule.value=v.schedule||'daily';form.elements.progress.value=v.progress||'checkbox';form.dataset.week=(v.weekdays||[]).join(',');updateGoalForm(form);
  form.addEventListener('change',e=>{if(e.target.matches('[name=schedule],[name=progress]'))updateGoalForm(form)});
  form.addEventListener('click',e=>{const b=e.target.closest('[data-week]');if(!b)return;const days=new Set((form.dataset.week||'').split(',').filter(x=>x!=='').map(Number));const n=+b.dataset.week;if(days.has(n))days.delete(n);else days.add(n);form.dataset.week=[...days].join(',');updateGoalForm(form)});
  form.addEventListener('submit',e=>{e.preventDefault();const raw=new FormData(form),name=String(raw.get('name')||'').trim(),description=String(raw.get('description')||'').trim(),start=safeDate(raw.get('start'));
   const schedule=raw.get('schedule'),progressMode=raw.get('progress'),days=Number(raw.get('days')),target=Number(raw.get('target')),weekdays=(form.dataset.week||'').split(',').filter(x=>x!=='').map(Number);
   if(!name||!start){toast('Tên mục tiêu hoặc ngày bắt đầu không hợp lệ.');return}
   if(schedule==='roadmap'&&(!Number.isInteger(days)||days<=0||days>20000)){toast('Tổng số Day phải từ 1 đến 20.000.');return}
   if(schedule==='weekly'&&!weekdays.length){toast('Chọn ít nhất một ngày trong tuần.');return}
   if(progressMode==='quantity'&&(!Number.isFinite(target)||target<=0)){toast('Chỉ tiêu phải lớn hơn 0.');return}
   let newItems=[];if(progressMode==='checklist'){
    const src=String(raw.get('items')||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,100);
    const oldItems=Array.isArray(v.items)?v.items:[],used=new Set();newItems=src.map(name=>{const matched=oldItems.find(x=>x.name===name&&!used.has(x.id));if(matched){used.add(matched.id);return {...matched}}return {id:id(),name}});
   }
   const nv={from:g?dateKey():DMIN,name,description,start,schedule,progress:progressMode,days:schedule==='roadmap'?days:null,weekdays:schedule==='weekly'?weekdays:[],target:progressMode==='quantity'?target:null,unit:progressMode==='quantity'?String(raw.get('unit')||'').trim():'',items:progressMode==='checklist'?newItems:[]};
   if(g){g.versions=g.versions.filter(x=>x.from!==dateKey());g.versions.push(nv);g.versions.sort((a,b)=>a.from.localeCompare(b.from));}
   else root().goals.push({id:id(),createdAt:new Date().toISOString(),versions:[nv],archivedAt:null});
   if(!saveDaily())return;closeShade();renderAll();toast(g?'Đã cập nhật mục tiêu':'Đã tạo mục tiêu');});
  setTimeout(()=>form.elements.name.focus(),60);}
 function openManage(){const all=orderedGoals();showShade(`<div class="d-modal-head"><div><div class="d-eyebrow">Daily / Library</div><h2>Quản lý mục tiêu</h2></div><button class="d-icon-btn" data-dact="close" aria-label="Đóng">${i('x')}</button></div><div>${all.length?all.map(g=>{const v=g.versions.at(-1);return `<div class="d-manage-row"><div><b>${ehtml(v.name)}</b><small>${SCHEDULE[v.schedule]} · ${PROGRESS[v.progress]}${g.archivedAt?' · Đã lưu trữ':''}</small></div><div class="d-manage-actions"><button type="button" data-dact="edit" data-id="${g.id}">Sửa</button><button type="button" data-dact="archive" data-id="${g.id}">${g.archivedAt?'Khôi phục':'Lưu trữ'}</button><button type="button" class="d-tiny d-danger" data-dact="delete" data-id="${g.id}">Xóa</button></div></div>`}).join(''):'<p class="d-empty">Chưa có mục tiêu nào.</p>'}</div><div class="d-form-footer"><button class="d-secondary-btn" data-dact="close">Đóng</button><button class="d-primary-btn" data-dact="create">${i('plus')} Thêm mục tiêu</button></div>`);}
 let entryTarget=null;
 function openEntry(gid,date){const t=dayTask(getGoal(gid),date);if(!t){toast('Ngày này không nằm trong lịch của mục tiêu.');return}entryTarget={gid,date};const rec=getRec(t);
  showShade(`<div class="d-modal-head"><div><div class="d-eyebrow">${dtShort(date)}${t.n?' / Day '+t.n:''}</div><h2>${ehtml(t.v.name)}</h2></div><button class="d-icon-btn" data-dact="close">${i('x')}</button></div><div>${taskHTML(t,{past:date<dateKey(),expanded:true})}</div><div class="d-form" style="margin-top:17px"><label>Ghi chú riêng cho lần thực hiện này<textarea rows="3" data-dnote="${gid}" data-date="${date}" placeholder="Ghi chú cho ngày được giao…">${ehtml(rec?.notes||'')}</textarea></label>${rec?.completedAt?`<p class="d-formhint">Hoàn thành thực tế: ${ehtml(new Date(rec.completedAt).toLocaleString('vi-VN'))} · ${completedLate(t)?'Completed Late':'Completed'}</p>`:''}<div class="d-form-footer"><button class="d-secondary-btn" data-dact="close">Đóng</button></div></div>`);}
 function refreshAfterMutation(gid,date){renderAll();if(entryTarget&&document.querySelector('.d-modalshade')&&entryTarget.gid===gid&&entryTarget.date===date){const active=document.activeElement;if(active?.matches('[data-dnote]'))return;openEntry(gid,date)}}
 function action(ev){const b=ev.target.closest('[data-dact]');if(!b)return;const k=b.dataset.dact,gid=b.dataset.id,d=b.dataset.date;
  if(k==='close'){closeShade();entryTarget=null;return}
  if(k==='create'){entryTarget=null;openGoal();return}
  if(k==='manage'){entryTarget=null;openManage();return}
  if(k==='backup'){document.querySelector('#bk')?.click();return}
  if(k==='edit'){entryTarget=null;openGoal(gid);return}
  if(k==='entry'){openEntry(gid,d);return}
  if(k==='showmore'){pendingMax+=10;renderPending(allPending());return}
  if(k==='togglepending'){pendingExpanded=!pendingExpanded;renderPending(allPending());return}
  if(k==='pickdate'){root().cfg.selected=d;root().cfg.month=monthKey(d);journalDate=null;saveDaily();renderCalendar(allPending());renderJournal();return}
  if(k==='prevmonth'||k==='nextmonth'){let [y,m]=root().cfg.month.split('-').map(Number);const x=new Date(y,m-1+(k==='prevmonth'?-1:1),1);root().cfg.month=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0');saveDaily();renderCalendar(allPending());return}
  if(k==='gotoday'){root().cfg.selected=dateKey();root().cfg.month=monthKey(dateKey());journalDate=null;saveDaily();renderCalendar(allPending());renderJournal();return}
  if(k==='archive'){const g=getGoal(gid);if(!g)return;if(g.archivedAt)g.archivedAt=null;else if(confirm('Lưu trữ mục tiêu? Lịch sử được giữ, những ngày tương lai ngừng tạo nhiệm vụ.'))g.archivedAt=dateKey();else return;saveDaily();renderAll();openManage();return}
  if(k==='delete'){const g=getGoal(gid);if(!g)return;const name=g.versions.at(-1)?.name||'';if(!confirm(`Xóa vĩnh viễn "${name}" và tất cả tiến độ của mục tiêu này? Hãy sao lưu JSON trước nếu muốn giữ dữ liệu.`))return;
   root().goals=root().goals.filter(x=>x.id!==gid);Object.keys(root().records).filter(key=>key.startsWith(gid+'|')).forEach(key=>delete root().records[key]);saveDaily();renderAll();openManage();return}
  const t=gid&&d?dayTask(getGoal(gid),d):null;if(!t)return;
  const r=getRec(t),mode=typeFor(t,r);
  if(k==='check')mutate(t,'checked',!r?.checked);
  else if(k==='plus'||k==='minus'){const cur=validNum(r?.value);mutate(t,'quantity',cur+(k==='plus'?1:-1));}
  else return;
  refreshAfterMutation(gid,d);}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-dsummary]');if(b){const key=recKey(b.dataset.dsummary,b.dataset.date);const det=b.closest('details');if(det?.open)expandedChecklists.delete(key);else expandedChecklists.add(key)}});
 document.addEventListener('click',action);
 document.addEventListener('change',e=>{const target=e.target;
  if(target.matches('[data-dqty],[data-dpercent],[data-dpct],[data-dsub],[data-dnote]')){
   const gid=target.dataset.dqty||target.dataset.dpercent||target.dataset.dpct||target.dataset.dsub||target.dataset.dnote,dt=target.dataset.date,t=dayTask(getGoal(gid),dt);if(!t)return;
   if(target.hasAttribute('data-dqty'))mutate(t,'quantity',target.value);
   else if(target.hasAttribute('data-dpercent')||target.hasAttribute('data-dpct'))mutate(t,'percentage',target.value);
   else if(target.hasAttribute('data-dsub'))mutate(t,'sub',{id:target.dataset.sub,checked:target.checked});
   else if(target.hasAttribute('data-dnote'))mutate(t,'notes',target.value);
   refreshAfterMutation(gid,dt);
  }});
 document.addEventListener('input',e=>{if(e.target.matches('[data-dpct]')){const card=e.target.closest('.d-task');if(card){const num=card.querySelector('[data-dpercent]');if(num)num.value=e.target.value;const badge=card.querySelector('.d-task-badge');if(badge)badge.textContent=e.target.value+'% hoàn thành';const bar=card.querySelector('.d-mini-track i');if(bar)bar.style.width=e.target.value+'%';}}});
 el.addEventListener('input',e=>{if(e.target.matches('[data-djournal]')){$d('#dJournalSaved').textContent='Đang lưu…';clearTimeout(saveTimer);saveTimer=setTimeout(saveJournal,350)}});
 el.addEventListener('focusout',e=>{if(e.target.matches('[data-djournal]')){clearTimeout(saveTimer);saveJournal()}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.d-modalshade')){closeShade();entryTarget=null}});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')syncDay()});
 window.addEventListener('focus',syncDay);
 function syncDay(){const now=dateKey();if(now!==lastDay){const previousDay=lastDay;clearTimeout(saveTimer);if(journalDate)saveJournal();lastDay=now;const old=root().cfg.selected;
   if(!old||old===previousDay)root().cfg.selected=now;
   root().cfg.month=monthKey(root().cfg.selected||now);root().cfg.lastSeenDay=now;journalDate=null;saveDaily();renderAll();}
 }
 setInterval(syncDay,12000);
 root();const prevSeen=safeDate(root().cfg.lastSeenDay),currentSelected=safeDate(root().cfg.selected);if(!currentSelected||currentSelected===prevSeen)root().cfg.selected=dateKey();root().cfg.lastSeenDay=dateKey();if(!/^\d{4}-\d{2}$/.test(root().cfg.month||'')||(currentSelected===prevSeen&&prevSeen!==dateKey()))root().cfg.month=monthKey(root().cfg.selected);
 renderAll();
 window.KZDaily={open:()=>{syncDay();renderAll()},refresh,syncDay,
  // pure-ish data helpers exposed for tests and manual inspection
  inspect:{dayTask,tasksOn,progress,daySummary,allPending,addDate,diff,mutate,root,dayMetrics,completedOnTime}};
})();
