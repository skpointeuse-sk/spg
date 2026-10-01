import {isAdmin,readJson,writeJson,listAll,del,body} from './_lib.js';
const ID=/^[a-z0-9]{3,20}$/,CID=/^[a-z0-9]+$/;
export default async function handler(req,res){try{
const adm=isAdmin(req),q=req.query;
if(req.method==='GET'){
const all=adm&&q.all==='1';
if(!all&&!ID.test(q.article||''))return res.status(400).end();
const bl=await listAll(all?'comments/':`comments/${q.article}/`);
let c=(await Promise.all(bl.map(b=>readJson(b.pathname)))).filter(Boolean);
if(!all)c=c.filter(x=>x.approved);
if(!adm)c=c.map(({email,...r})=>r);
c.sort((a,b)=>a.date.localeCompare(b.date));res.setHeader('Cache-Control','no-store');return res.json({comments:c})}
if(req.method==='POST'){const b=body(req);
if(b._gotcha)return res.json({ok:true});
if(!ID.test(b.article||''))return res.status(400).json({error:'Champs invalides'});
const message=String(b.message||'').trim().slice(0,1500);
if(!message)return res.status(400).json({error:'Message vide'});
let parent='';
if(b.parent&&CID.test(b.parent)){const pc=await readJson(`comments/${b.article}/${b.parent}.json`);if(pc&&pc.approved)parent=pc.id}
const id=Date.now().toString(36)+Math.random().toString(36).slice(2,6),date=new Date().toISOString();
let c;
if(adm)c={id,article:b.article,nom:'Sandrine Pazec Gouget',email:'',message,date,approved:true,admin:true,parent};
else{const nom=String(b.nom||'').trim().slice(0,60),email=String(b.email||'').trim().slice(0,120);
if(!nom||!/^\S+@\S+\.\S+$/.test(email))return res.status(400).json({error:'Champs invalides'});
c={id,article:b.article,nom,email,message,date,approved:false,parent}}
await writeJson(`comments/${b.article}/${id}.json`,c);
return res.json({ok:true})}
if(!adm)return res.status(401).json({error:'Non autorisé'});
const a=req.method==='PATCH'?body(req):q;
if(!ID.test(a.article||''))return res.status(400).end();
if(req.method==='PATCH'){if(!CID.test(a.id||''))return res.status(400).end();const p=`comments/${a.article}/${a.id}.json`,c=await readJson(p);if(!c)return res.status(404).end();c.approved=true;await writeJson(p,c);return res.json({ok:true})}
if(req.method==='DELETE'){const bl=await listAll(`comments/${a.article}/`);
if(q.all==='1'){for(const x of bl)await del(x.url);return res.json({ok:true})}
if(!CID.test(a.id||''))return res.status(400).end();
const all=(await Promise.all(bl.map(async x=>({x,c:await readJson(x.pathname)})))).filter(o=>o.c);
const ids=new Set([a.id]);let ch=true;
while(ch){ch=false;for(const o of all)if(o.c.parent&&ids.has(o.c.parent)&&!ids.has(o.c.id)){ids.add(o.c.id);ch=true}}
for(const o of all)if(ids.has(o.c.id))await del(o.x.url);
return res.json({ok:true})}
res.status(405).end()}catch(e){console.error(e);res.status(500).json({error:'Erreur serveur'})}}
