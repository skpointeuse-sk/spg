import {isAdmin,readJson,writeJson,listAll,del,body} from './_lib.js';
const ID=/^[a-z0-9]{3,20}$/;
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
const nom=String(b.nom||'').trim().slice(0,60),email=String(b.email||'').trim().slice(0,120),message=String(b.message||'').trim().slice(0,1500);
if(!ID.test(b.article||'')||!nom||!message||!/^\S+@\S+\.\S+$/.test(email))return res.status(400).json({error:'Champs invalides'});
const id=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
await writeJson(`comments/${b.article}/${id}.json`,{id,article:b.article,nom,email,message,date:new Date().toISOString(),approved:false});
return res.json({ok:true})}
if(!adm)return res.status(401).json({error:'Non autorisé'});
const a=(req.method==='PATCH'?body(req):q),p=`comments/${a.article}/${a.id}.json`;
if(!ID.test(a.article||'')||!/^[a-z0-9]+$/.test(a.id||''))return res.status(400).end();
if(req.method==='PATCH'){const c=await readJson(p);if(!c)return res.status(404).end();c.approved=true;await writeJson(p,c);return res.json({ok:true})}
if(req.method==='DELETE'){for(const x of await listAll(p))await del(x.url);return res.json({ok:true})}
res.status(405).end()}catch(e){console.error(e);res.status(500).json({error:'Erreur serveur'})}}
