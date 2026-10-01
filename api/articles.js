import {isAdmin,readJson,writeJson,listAll,del,body} from './_lib.js';
const ID=/^[a-z0-9]{3,20}$/;
export const config={api:{bodyParser:{sizeLimit:'4mb'}}};
export default async function handler(req,res){try{
const id=req.query.id;
if(req.method==='GET'){
if(id){if(!ID.test(id))return res.status(400).end();const a=await readJson(`articles/${id}.json`);return a?res.json(a):res.status(404).end()}
const bl=await listAll('articles/');
const arr=(await Promise.all(bl.map(b=>readJson(b.pathname)))).filter(Boolean).map(({id,titre,extrait,cover,date,auteur})=>({id,titre,extrait,cover,date,auteur})).sort((a,b)=>b.date.localeCompare(a.date));
res.setHeader('Cache-Control','no-store');return res.json({articles:arr})}
if(!isAdmin(req))return res.status(401).json({error:'Non autorisé'});
if(req.method==='POST'){const{titre,extrait,cover,contenu}=body(req);
if(!titre||!contenu)return res.status(400).json({error:'Titre et contenu requis'});
const n=Date.now().toString(36);
await writeJson(`articles/${n}.json`,{id:n,titre:String(titre).slice(0,200),extrait:String(extrait||'').slice(0,300),cover:cover||'/assets/favicon.png',contenu:String(contenu),date:new Date().toISOString(),auteur:'Sandrine Pazec Gouget'});
return res.json({id:n})}
if(req.method==='DELETE'){if(!ID.test(id))return res.status(400).end();
for(const b of await listAll(`articles/${id}.json`))await del(b.url);
for(const b of await listAll(`comments/${id}/`))await del(b.url);
return res.json({ok:true})}
res.status(405).end()}catch(e){console.error(e);res.status(500).json({error:'Erreur serveur'})}}
