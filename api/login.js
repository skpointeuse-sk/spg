import crypto from 'node:crypto';
import {makeToken,isAdmin,body} from './_lib.js';
const h=v=>crypto.createHash('sha256').update(String(v)).digest();
export default async function handler(req,res){
if(req.method==='GET')return res.json({admin:isAdmin(req)});
if(req.method==='DELETE'){res.setHeader('Set-Cookie','adm=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict');return res.json({ok:true})}
if(req.method!=='POST')return res.status(405).end();
const pw=process.env.ADMIN_PASSWORD||'';
if(!pw||!process.env.SESSION_SECRET||!crypto.timingSafeEqual(h(body(req).password||''),h(pw))){await new Promise(r=>setTimeout(r,800));return res.status(401).json({error:'Mot de passe incorrect'})}
res.setHeader('Set-Cookie',`adm=${makeToken()}; Path=/; Max-Age=43200; HttpOnly; Secure; SameSite=Strict`);res.json({ok:true})}
