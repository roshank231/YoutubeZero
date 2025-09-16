let state={category:"all",sub:null,randomVars:true,selectedTemplateId:null,lastUrlHistory:[],sortByRecent:true,generatedVars:{}};

// DOM refs
const D=id=>document.getElementById(id);
const tabEls=document.querySelectorAll('.tab');
const subcatsEl=D('subcats');
const templateListEl=D('templateList');
const variableArea=D('variableArea');
const previewEl=D('preview');
const btnSearch=D('btnSearch');
const btnCopy=D('btnCopy');
const historyEl=D('history');
const descBox=D('descBox');
const randomVarsToggle=D('randomVarsToggle');
const sortToggle=D('sortToggle');
const templateSearch = D('templateSearch');

// Utilities
function randInt(min,max){min=Math.ceil(min);max=Math.floor(max);return Math.floor(Math.random()*(max-min+1))+min}
function pad(n,len){return String(n).padStart(len,'0')}
function randDate(start,end){return new Date(start.getTime()+Math.random()*(end.getTime()-start.getTime()))}
function formatDate(d,fmt){const yyyy=d.getFullYear();const mm=pad(d.getMonth()+1,2);const dd=pad(d.getDate(),2);if(fmt==='YYYYMMDD')return `${yyyy}${mm}${dd}`;if(fmt==='YYYY MM DD')return `${yyyy} ${mm} ${dd}`;if(fmt==='YYYY MM')return `${yyyy} ${mm}`;if(fmt==='MONTH DD, YYYY'){const months=['January','February','March','April','May','June','July','August','September','October','November','December'];return `${months[d.getMonth()]} ${dd}, ${yyyy}`}return d.toISOString().slice(0,10)}

// Renderers
function renderAll(){renderSubcats();renderTemplates();renderVars();updatePreview();renderHistory();updateBtnText()}
function renderSubcats(){subcatsEl.innerHTML='';const list=[...new Set(TEMPLATES.filter(t=>state.category==='all'||t.category===state.category).map(t=>t.sub))].sort();const allChip=document.createElement('div');allChip.className='chip'+(state.sub===null?' active':'');allChip.textContent='All';allChip.addEventListener('click',()=>{state.sub=null;descBox.textContent='Showing all subcategories.';state.selectedTemplateId=null;renderAll()});subcatsEl.appendChild(allChip);list.forEach(s=>{const el=document.createElement('div');el.className='chip'+(state.sub===s?' active':'');el.textContent=SUBCAT_DETAILS[s]?.name||s;el.addEventListener('click',()=>{state.sub=state.sub===s?null:s;descBox.textContent=state.sub?SUBCAT_DETAILS[state.sub]?.description||'No description available.':'Select a subcategory to see a description.';state.selectedTemplateId=null;renderAll()});subcatsEl.appendChild(el)})}

function renderTemplates() {
  templateListEl.innerHTML = '';
  const searchTerm = templateSearch.value.toLowerCase();
  const filtered = TEMPLATES.filter(t => {
    const categoryMatch = (state.category === 'all' || t.category === state.category);
    const subCategoryMatch = (!state.sub || t.sub === state.sub);
    const searchMatch = t.label.toLowerCase().includes(searchTerm);
    return categoryMatch && subCategoryMatch && searchMatch;
  });

  if (filtered.length === 0) {
    templateListEl.innerHTML = '<div class="small" style="padding:8px;">No templates match the current filter.</div>';
    return;
  }
  
  filtered.forEach(t => {
    const item = document.createElement('div');
    item.className = 'template-item';
    item.innerHTML = `<div><div class="template-name">${t.label}</div><div class="small">Category: ${t.category}, Sub: ${SUBCAT_DETAILS[t.sub]?.name || t.sub}</div></div>`;
    const btn = document.createElement('button');
    btn.className = 'chip' + (state.selectedTemplateId === t.id ? ' active' : '');
    btn.textContent = state.selectedTemplateId === t.id ? 'Selected' : 'Pick';
    btn.addEventListener('click', () => {
      state.selectedTemplateId = state.selectedTemplateId === t.id ? null : t.id;
      if (!state.selectedTemplateId) state.generatedVars = {};
      else state.generatedVars = {};
      renderAll();
    });
    item.appendChild(btn);
    templateListEl.appendChild(item);
  });
}

function renderVars(){variableArea.innerHTML='';const t=TEMPLATES.find(x=>x.id===state.selectedTemplateId);if(!t){variableArea.innerHTML='<div class="small">Select a template from the list to see its options here.</div>';return}if(t.vars.length===0){variableArea.innerHTML=`<div class="small">Template <strong>${t.label}</strong> has no variables.</div>`;return}
  // Ensure there is a generatedVars object for the template
  if(!state.generatedVars || state.generatedVars._templateId !== t.id){ state.generatedVars = {_templateId:t.id}; t.vars.forEach(v=>{ state.generatedVars[v.name] = generateVarValue(v); }); }

  if(randomVarsToggle.checked){ // show readonly generated values + regenerate button
    const info=document.createElement('div'); info.className='small'; info.textContent='Randomized values are ON. Click "Regenerate variables" to get a fresh combination.'; variableArea.appendChild(info);
    const list=document.createElement('div'); list.style.marginTop='8px'; t.vars.forEach(v=>{ const row=document.createElement('div'); row.style.display='flex'; row.style.justifyContent='space-between'; row.style.alignItems='center'; row.style.padding='6px 0'; const name=document.createElement('div'); name.className='small'; name.textContent=v.name; const val=document.createElement('div'); val.className='small'; val.style.fontFamily='monospace'; val.textContent=state.generatedVars[v.name]; row.appendChild(name); row.appendChild(val); list.appendChild(row); }); variableArea.appendChild(list);
    const regen=document.createElement('button'); regen.className='btn ghost'; regen.textContent='Regenerate variables'; regen.style.marginTop='auto'; regen.addEventListener('click',()=>{ t.vars.forEach(v=>{ state.generatedVars[v.name]=generateVarValue(v); }); updatePreview(); renderVars(); }); variableArea.appendChild(regen);
  } else {
    // manual inputs (editable). Prefill with last generated value if present
    const frag=document.createDocumentFragment(); t.vars.forEach(v=>{ const wrapper=document.createElement('div'); wrapper.style.marginBottom='8px'; const lbl=document.createElement('label'); lbl.textContent=v.name; wrapper.appendChild(lbl); let inp; if(v.type==='date' || v.type==='year'){ inp=document.createElement('input'); inp.type='text'; inp.placeholder=v.format||'YYYYMMDD'; } else if(v.type==='digits'){ inp=document.createElement('input'); inp.type='number'; inp.placeholder = pad(randInt(v.range?.[0]||0, v.range?.[1]||9999), v.len||4); } else { inp=document.createElement('input'); inp.type='text'; }
      inp.id = 'var_'+v.name; inp.value = state.generatedVars[v.name] || '';
      inp.addEventListener('input', ()=>{ updatePreview(); });
      wrapper.appendChild(inp);
      const hint=document.createElement('div'); hint.className='small'; hint.textContent = 'You may edit this value before searching.'; wrapper.appendChild(hint);
      frag.appendChild(wrapper);
    }); variableArea.appendChild(frag);
  }
}

function renderHistory(){historyEl.innerHTML='';state.lastUrlHistory.forEach(h=>{const el=document.createElement('div');el.className='hist-chip';el.textContent=h.label.length>50? h.label.substring(0,47)+'...':h.label;el.title=`Open search for: ${h.label}`;el.addEventListener('click',()=>window.open(h.url,'_blank'));historyEl.appendChild(el)})}

function updateBtnText(){btnSearch.textContent = 'Find Random Videos'}

// Variable generation & search string building
function generateVarValue(v){ if(v.type==='date'){ const start=v.range? v.range[0] : new Date(2008,0,1); const end=v.range? v.range[1] : new Date(); return formatDate(randDate(start,end), v.format || 'YYYYMMDD'); } if(v.type==='year'){ const min=v.range? v.range[0] : 2006; const max=v.range? v.range[1] : (new Date()).getFullYear(); return ''+randInt(min,max); } if(v.type==='digits'){ const rmin=v.range? v.range[0] : 0; const rmax=v.range? v.range[1] : Math.pow(10,(v.len||4))-1; return pad(randInt(rmin,rmax), v.len || String(rmax).length); } return '' }

function buildSearchString(template, useManualOverrides){ let s = template.pattern; const overrides = {};
  if(!randomVarsToggle.checked){ // gather manual inputs
    template.vars.forEach(v=>{ const el = D('var_'+v.name); if(el && el.value) overrides[v.name] = el.value; });
  } else { // use generated values stored in state.generatedVars
    template.vars.forEach(v=>{ if(state.generatedVars && state.generatedVars[v.name]) overrides[v.name] = state.generatedVars[v.name]; else overrides[v.name] = generateVarValue(v); });
  }

  // heuristic replacements (cover common tokens)
  template.vars.forEach(v=>{ const val = overrides[v.name] || ('['+v.name+']'); if(s.includes('XXXX')) s = s.replace('XXXX', val); if(s.includes('X')) s = s.replace('X', val); if(s.includes('YYYYMMDD')) s = s.replace('YYYYMMDD', val); if(s.includes('YYYY MM DD')) s = s.replace('YYYY MM DD', val); if(s.includes('YYYY MM')) s = s.replace('YYYY MM', val); if(s.includes('YYYY')) s = s.replace('YYYY', val); if(s.includes('YMD')) s = s.replace('YMD', val); if(!s.includes(val)) s = (s + ' ' + val).trim(); });
  return '"' + s + '"';
}

function updatePreview(){ const t = TEMPLATES.find(x=>x.id===state.selectedTemplateId); if(!t){ state.pendingUrl=null; previewEl.textContent='(Select a template or click "Find Random Videos")'; return; } // ensure generatedVars exists for preview
  if(!state.generatedVars || state.generatedVars._templateId !== t.id){ state.generatedVars = {_templateId:t.id}; t.vars.forEach(v=>{ state.generatedVars[v.name] = generateVarValue(v); }); }
  const q = buildSearchString(t, !randomVarsToggle.checked);
  let url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
  if(sortToggle.checked) url += '&sp=CAI%253D';
  previewEl.textContent = `Query: ${q}
URL: ${url}`;
  state.pendingUrl = url;
}

function handleSearch(){ let template;
  if(state.selectedTemplateId) template = TEMPLATES.find(t=>t.id===state.selectedTemplateId);
  else{
    const filtered = TEMPLATES.filter(t=> (state.category==='all' || t.category===state.category) && (!state.sub || t.sub===state.sub) );
    if(filtered.length===0){ alert('No templates match your criteria!'); return; }
    template = filtered[randInt(0,filtered.length-1)]; state.selectedTemplateId = template.id;
  }
  // if randomVarsToggle is on, ensure generatedVars are present
  if(!state.generatedVars || state.generatedVars._templateId !== template.id){ state.generatedVars = {_templateId:template.id}; template.vars.forEach(v=>{ state.generatedVars[v.name]=generateVarValue(v); }); }
  const q = buildSearchString(template, !randomVarsToggle.checked);
  let url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
  if(sortToggle.checked) url += '&sp=CAI%253D';
  window.open(url,'_blank');
  state.lastUrlHistory.unshift({label:q,url}); if(state.lastUrlHistory.length>10) state.lastUrlHistory.pop(); renderHistory(); previewEl.textContent = `Query: ${q}
URL: ${url}`;
}

// Event wiring
tabEls.forEach(el=>el.addEventListener('click', ()=>{ tabEls.forEach(x=>x.classList.remove('active')); el.classList.add('active'); state.category = el.dataset.cat; state.selectedTemplateId = null; state.sub = null; descBox.textContent = 'Select a subcategory to see a description.'; // set sensible default for sort toggle
  sortToggle.checked = state.category !== 'old'; renderAll(); }));

randomVarsToggle.addEventListener('change', ()=>{ state.randomVars = randomVarsToggle.checked; // regenerate values when turning back on
  if(randomVarsToggle.checked && state.selectedTemplateId){ const t = TEMPLATES.find(x=>x.id===state.selectedTemplateId); state.generatedVars = {_templateId:t.id}; t.vars.forEach(v=> state.generatedVars[v.name]=generateVarValue(v)); }
  renderVars(); updatePreview(); });

sortToggle.addEventListener('change', ()=>{ state.sortByRecent = sortToggle.checked; updatePreview(); });

btnSearch.addEventListener('click', handleSearch);
btnCopy.addEventListener('click', ()=>{ if(state.pendingUrl) navigator.clipboard.writeText(state.pendingUrl).then(()=>{ alert('Search URL copied to clipboard!') }, ()=>{ alert('Failed to copy URL.') }); else alert('No generated URL in preview. Select a template or find a random video first.') });

templateSearch.addEventListener('input', renderTemplates);

// initial render
renderAll();