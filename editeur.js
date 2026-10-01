(()=>{const $=s=>document.querySelector(s),E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),J=(u,o={})=>fetch(u,{credentials:'same-origin',headers:{'Content-Type':'application/json'},...o});
const rs=(f,w,q)=>new Promise(r=>{const i=new Image,u=URL.createObjectURL(f);i.onload=()=>{const k=Math.min(1,w/i.width),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);r(c.toDataURL('image/jpeg',q))};i.src=u});
const ed=$('#ed');let rg,cover='';
document.addEventListener('selectionchange',()=>{const s=getSelection();if(s.rangeCount&&ed.contains(s.anchorNode))rg=s.getRangeAt(0)});
const cmd=(c,v)=>{ed.focus();if(rg){const s=getSelection();s.removeAllRanges();s.addRange(rg)}document.execCommand('styleWithCSS',false,true);document.execCommand(c,false,v||null)};
document.querySelectorAll('.tb button[data-c]').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=()=>cmd(b.dataset.c,b.dataset.v)});
$('#ff').onchange=e=>{if(e.target.value)cmd('fontName',e.target.value);e.target.value=''};$('#fs').onchange=e=>{if(e.target.value)cmd('fontSize',e.target.value);e.target.value=''};
$('#im').onclick=()=>$('#if').click();$('#if').onchange=async e=>{const f=e.target.files[0];if(f)cmd('insertImage',await rs(f,900,.75));e.target.value=''};
$('#cv').onchange=async e=>{const f=e.target.files[0];if(!f)return;cover=await rs(f,800,.75);$('#cp').src=cover;$('#cp').hidden=false};
async function load(){const[a,c]=await Promise.all([J('/api/articles').then(r=>r.json()),J('/api/comments?all=1').then(r=>r.json())]);
$('#al').innerHTML=(a.articles||[]).map(x=>`<p><a href="/article?id=${x.id}">${E(x.titre)}</a> <button class="b bv" data-del="${x.id}" style="border:0;cursor:pointer;padding:5px 14px;margin-left:8px">Supprimer</button></p>`).join('')||'<p>Aucun article ajouté pour le moment.</p>';
const cs=(c.comments||[]).sort((x,y)=>x.approved-y.approved);
$('#cl').innerHTML=cs.map(x=>`<div class="cm"><b>${E(x.nom)}</b><small>${E(x.email)} · ${x.approved?'✅ publié':'⏳ à valider'}</small><p>${E(x.message)}</p>${x.approved?'':`<button class="b bg" data-ok="${x.article}/${x.id}" style="border:0;cursor:pointer;padding:6px 16px">Valider</button> `}<button class="b bv" data-rm="${x.article}/${x.id}" style="border:0;cursor:pointer;padding:6px 16px">Supprimer</button></div>`).join('')||'<p>Aucun commentaire.</p>';
document.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{if(confirm('Supprimer cet article ?')){await J('/api/articles?id='+b.dataset.del,{method:'DELETE'});load()}});
document.querySelectorAll('[data-ok]').forEach(b=>b.onclick=async()=>{const[article,id]=b.dataset.ok.split('/');await J('/api/comments',{method:'PATCH',body:JSON.stringify({article,id})});load()});
document.querySelectorAll('[data-rm]').forEach(b=>b.onclick=async()=>{const[a,i]=b.dataset.rm.split('/');await J(`/api/comments?article=${a}&id=${i}`,{method:'DELETE'});load()})}
const show=()=>{$('#lg').hidden=true;$('#ad').hidden=false;load()};
J('/api/login').then(r=>r.json()).then(r=>r.admin&&show()).catch(()=>{});
$('#lf').onsubmit=async e=>{e.preventDefault();const r=await J('/api/login',{method:'POST',body:JSON.stringify({password:$('#pw').value})});r.ok?show():$('#le').textContent='Mot de passe incorrect'};
$('#lo').onclick=async()=>{await J('/api/login',{method:'DELETE'});location.reload()};
$('#pb').onclick=async()=>{const t=$('#tt').value.trim(),h=ed.innerHTML.trim();$('#pe').textContent='';if(!t||!ed.textContent.trim()&&!ed.querySelector('img')){$('#pe').textContent='Titre et contenu requis.';return}
$('#pb').disabled=true;const ex=$('#ex').value.trim()||ed.textContent.trim().slice(0,200)+'…';
const r=await J('/api/articles',{method:'POST',body:JSON.stringify({titre:t,extrait:ex,cover,contenu:h})});$('#pb').disabled=false;
if(r.ok){const d=await r.json();location.href='/article?id='+d.id}else $('#pe').textContent=r.status===413?'Images trop lourdes : réduisez-en.':'Erreur à la publication.'}})();
