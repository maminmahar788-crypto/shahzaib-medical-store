
const KEY="shahzaib_store_v1";
const $=s=>document.querySelector(s);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const today=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
const nowT=()=>new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
const money=n=>"Rs "+(+n||0).toLocaleString(undefined,{maximumFractionDigits:2});
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let db={meds:[],sales:[],base:[],set:{name:"Shahzaib Medical Store",addr:"Main Bazaar, Your City",phone:"0300-0000000",foot:"Thank you! Get well soon."},bill:1000};
try{const r=localStorage.getItem(KEY);if(r)db=Object.assign(db,JSON.parse(r))}catch(e){}
if(!db.meds.length&&!db.sales.length&&!localStorage.getItem(KEY+"_seed")){
 db.meds=[["Paracetamol 500mg","Tablet",20,25,200],["Amoxicillin 250mg","Capsule",90,120,80],["Cough Syrup 100ml","Syrup",110,150,40],["ORS Sachet","Sachet",12,20,150],["Panadol Extra","Tablet",35,45,5]].map(a=>({id:uid(),name:a[0],cat:a[1],batch:"B-"+Math.floor(Math.random()*900+100),exp:"2027-12-31",cost:a[2],price:a[3],qty:a[4]}));
 try{localStorage.setItem(KEY+"_seed","1")}catch(e){}}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}};
const pages={dash:["📊","Dashboard"],sale:["🧾","New Sale / Bill"],sales:["📅","Daily Sales"],meds:["💊","Medicines Stock"],base:["📒","Daily Base Record"],rep:["📈","Reports"],set:["⚙️","Settings & Excel"]};
let page="dash",cart=[],baseDate=today(),saleDate=today();
function nav(){$("#nav").innerHTML=Object.entries(pages).map(([k,v])=>`<button class="${k==page?"on":""}" onclick="go('${k}')"><span>${v[0]}</span>${v[1]}</button>`).join("")+'<button onclick="toggleTheme()"><span>🌓</span>Dark / Light mode</button><button onclick="logout()"><span>🚪</span>Logout</button>';
 $("#sn").textContent=$("#tn").textContent=db.set.name}
function go(p){page=p;document.querySelector("aside").classList.remove("open");nav();R[p]();scrollTo(0,0)}
const sum=a=>a.reduce((s,x)=>s+(+x||0),0);
function modal(html){$("#mb").innerHTML=html;$("#modal").classList.add("on")}
function close_(){$("#modal").classList.remove("on")}
$("#modal").onclick=e=>{if(e.target.id=="modal")close_()};
function form(title,fields,vals,cb){
 modal(`<h3 style="margin:0 0 6px">${title}</h3>`+fields.map(f=>`<label>${f.l}</label>`+(f.o?`<select id="f_${f.k}">${f.o.map(o=>`<option ${o==vals[f.k]?"selected":""}>${o}</option>`).join("")}</select>`:`<input id="f_${f.k}" type="${f.t||"text"}" value="${esc(vals[f.k]??"")}" ${f.t=="number"?'step="any" min="0"':""}>`)).join("")+`<div class="row" style="margin-top:16px"><button class="btn g" onclick="close_()">Cancel</button><button class="btn" id="fs">Save</button></div>`);
 $("#fs").onclick=()=>{const o={};for(const f of fields){let v=$("#f_"+f.k).value.trim();if(f.t=="number")v=+v||0;if(f.req&&!v&&v!==0){toast(f.l+" is required");return}o[f.k]=v}cb(o);close_()}}
const R={
dash(){
 const t=today(),ts=db.sales.filter(s=>s.date==t),tb=db.base.filter(b=>b.date==t);
 const sales=sum(ts.map(s=>s.total)),profit=sum(ts.map(s=>s.total-sum(s.items.map(i=>i.cost*i.qty))));
 const low=db.meds.filter(m=>m.qty<=10),soon=new Date(Date.now()+60*864e5).toISOString().slice(0,10),exp=db.meds.filter(m=>m.exp&&m.exp<=soon);
 const exps=sum(tb.filter(b=>b.type=="Expense").map(b=>b.amount));
 $("#main").innerHTML=`<h1>Welcome, ${esc(db.set.name)}<span style="font-size:13px;color:var(--mu)">${new Date().toDateString()}</span></h1>
 <div class="grid"><div class="stat"><small>Today Sales</small><b>${money(sales)}</b></div><div class="stat"><small>Bills Today</small><b>${ts.length}</b></div><div class="stat"><small>Today Profit</small><b>${money(profit)}</b></div><div class="stat"><small>Today Expense</small><b>${money(exps)}</b></div><div class="stat"><small>Total Medicines</small><b>${db.meds.length}</b></div><div class="stat"><small>Stock Value</small><b>${money(sum(db.meds.map(m=>m.cost*m.qty)))}</b></div></div>
 <div class="row" style="align-items:start"><div class="card"><b>⚠ Low Stock (≤10)</b><div class="tw"><table><tr><th>Medicine</th><th>Qty</th></tr>${low.map(m=>`<tr><td>${esc(m.name)}</td><td><span class="tag b">${m.qty}</span></td></tr>`).join("")||"<tr><td>All good ✔</td></tr>"}</table></div></div>
 <div class="card"><b>⏰ Expiring in 60 days / Expired</b><div class="tw"><table><tr><th>Medicine</th><th>Expiry</th></tr>${exp.map(m=>`<tr><td>${esc(m.name)}</td><td><span class="tag w">${m.exp}</span></td></tr>`).join("")||"<tr><td>None ✔</td></tr>"}</table></div></div></div>
 <div class="row"><button class="btn" onclick="go('sale')">🧾 New Bill</button><button class="btn g" onclick="go('meds')">💊 Add Medicine</button><button class="btn g" onclick="go('base')">📒 Daily Base</button></div>`},
sale(){
 $("#main").innerHTML=`<h1>New Sale / Bill</h1><div class="row" style="align-items:start"><div class="card"><label>Search medicine</label><input id="q" placeholder="Type medicine name..." oninput="sug()"><div class="sug" id="sug"></div></div>
 <div class="card" style="flex:2;min-width:300px"><div class="tw"><table><thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr></thead><tbody id="cb"></tbody></table></div>
 <div class="row"><div><label>Customer name</label><input id="cu" placeholder="Walk-in customer"></div><div><label>Discount (Rs)</label><input id="ds" type="number" min="0" value="0" oninput="ct()"></div></div>
 <h2 id="gt" style="text-align:right"></h2><div class="row"><button class="btn g" onclick="cart=[];R.sale()">Clear</button><button class="btn" onclick="finish()">💾 Save &amp; Print Bill</button></div></div></div>`;sug();ct()},
sales(){
 const l=db.sales.filter(s=>s.date==saleDate).sort((a,b)=>b.bill>a.bill?1:-1);
 $("#main").innerHTML=`<h1>Daily Sales Record</h1><div class="card row"><div><label>Date</label><input type="date" value="${saleDate}" onchange="saleDate=this.value;R.sales()"></div><div><label>Total sale</label><b style="font-size:22px">${money(sum(l.map(s=>s.total)))}</b></div><div><label>Bills</label><b style="font-size:22px">${l.length}</b></div></div>
 <div class="card tw"><table><tr><th>Bill</th><th>Time</th><th>Customer</th><th>Items</th><th>Discount</th><th>Total</th><th>Actions</th></tr>${l.map(s=>`<tr><td>${s.bill}</td><td>${s.time}</td><td>${esc(s.cust)}</td><td>${s.items.length}</td><td>${money(s.disc)}</td><td><b>${money(s.total)}</b></td><td><button class="btn s g" onclick="rcpt('${s.id}')">🖨 Print</button> <button class="btn s o" onclick="editSale('${s.id}')">✏ Edit</button> <button class="btn s r" onclick="delSale('${s.id}')">🗑</button></td></tr>`).join("")||'<tr><td colspan="7">No sales on this date</td></tr>'}</table></div>`},
meds(){
 $("#main").innerHTML=`<h1>Medicines Stock <button class="btn" onclick="medForm()">+ Add Medicine</button></h1><div class="card"><input id="ms" placeholder="🔍 Search medicine..." oninput="medList()"></div><div class="card tw" id="ml"></div>`;medList()},
base(){
 const l=db.base.filter(b=>b.date==baseDate),op=sum(l.filter(b=>b.type=="Opening Cash").map(b=>b.amount)),dp=sum(l.filter(b=>b.type=="Deposit").map(b=>b.amount)),ex=sum(l.filter(b=>b.type=="Expense").map(b=>b.amount)),sl=sum(db.sales.filter(s=>s.date==baseDate).map(s=>s.total));
 $("#main").innerHTML=`<h1>Daily Base Record <button class="btn" onclick="baseForm()">+ Add Entry</button></h1><div class="card"><label>Date</label><input type="date" value="${baseDate}" onchange="baseDate=this.value;R.base()"></div>
 <div class="grid"><div class="stat"><small>Opening Cash</small><b>${money(op)}</b></div><div class="stat"><small>Sales</small><b>${money(sl)}</b></div><div class="stat"><small>Deposit / Other In</small><b>${money(dp)}</b></div><div class="stat"><small>Expenses</small><b>${money(ex)}</b></div><div class="stat"><small>Closing Cash</small><b>${money(op+sl+dp-ex)}</b></div></div>
 <div class="card tw"><table><tr><th>Type</th><th>Amount</th><th>Note</th><th>Actions</th></tr>${l.map(b=>`<tr><td>${b.type}</td><td>${money(b.amount)}</td><td>${esc(b.note)}</td><td><button class="btn s o" onclick="baseForm('${b.id}')">✏ Edit</button> <button class="btn s r" onclick="delBase('${b.id}')">🗑</button></td></tr>`).join("")||'<tr><td colspan="4">No entries for this date</td></tr>'}</table></div>`},
set(){
 $("#main").innerHTML=`<h1>Settings &amp; Excel Database</h1><div class="card"><b>Store details (printed on bill)</b><label>Store name</label><input id="s1" value="${esc(db.set.name)}"><label>Address</label><input id="s2" value="${esc(db.set.addr)}"><label>Phone</label><input id="s3" value="${esc(db.set.phone)}"><label>Bill footer message</label><input id="s4" value="${esc(db.set.foot)}"><br><br><button class="btn" onclick="saveSet()">Save Settings</button></div>
 <div class="card"><b>🔐 Login / Account</b><p style="color:var(--mu)">Change username, password and recovery word. Logged in as <b id="who2">${esc(auth.user)}</b>.</p><div class="row"><button class="btn" onclick="acctForm()">Change Login Details</button><button class="btn g" onclick="logout()">🚪 Logout</button></div></div>
 <div class="card"><b>📗 MS Excel Database</b><p style="color:var(--mu)">Export complete record (Medicines, Sales, Daily Base) in one Excel file as backup, or import an Excel file saved from this app.</p><div class="row"><button class="btn" onclick="xlsOut()">⬇ Export to Excel</button><div><input type="file" id="xf" accept=".xlsx,.xls" onchange="xlsIn(this)"></div></div></div>
 <div class="card"><b>Danger zone</b><p style="color:var(--mu)">Delete all data of this device.</p><button class="btn r" onclick="ask('Delete ALL records?').then(y=>{if(y){db.meds=[];db.sales=[];db.base=[];save();go('dash')}})">Delete All Data</button></div>`}};
function saveSet(){db.set={name:$("#s1").value||"Shahzaib Medical Store",addr:$("#s2").value,phone:$("#s3").value,foot:$("#s4").value};save();nav();toast("Saved")}
/* Medicines */
function medList(){const q=($("#ms")?.value||"").toLowerCase(),soon=new Date(Date.now()+60*864e5).toISOString().slice(0,10);
 $("#ml").innerHTML=`<table><tr><th>Name</th><th>Category</th><th>Batch</th><th>Expiry</th><th>Cost</th><th>Price</th><th>Stock</th><th>Actions</th></tr>${db.meds.filter(m=>m.name.toLowerCase().includes(q)).map(m=>`<tr><td><b>${esc(m.name)}</b></td><td>${esc(m.cat)}</td><td>${esc(m.batch)}</td><td>${m.exp&&m.exp<=soon?`<span class="tag w">${m.exp}</span>`:m.exp}</td><td>${money(m.cost)}</td><td>${money(m.price)}</td><td><span class="tag ${m.qty<=10?"b":""}">${m.qty}</span></td><td><button class="btn s o" onclick="medForm('${m.id}')">✏ Edit</button> <button class="btn s r" onclick="delMed('${m.id}')">🗑</button></td></tr>`).join("")||'<tr><td colspan="8">No medicines</td></tr>'}</table>`}
function medForm(id){const m=db.meds.find(x=>x.id==id)||{};
 form(id?"Edit Medicine":"Add Medicine",[{k:"name",l:"Medicine name",req:1},{k:"cat",l:"Category",o:["Tablet","Capsule","Syrup","Injection","Drops","Ointment","Sachet","Surgical","Other"]},{k:"batch",l:"Batch no"},{k:"exp",l:"Expiry date",t:"date"},{k:"cost",l:"Purchase price",t:"number"},{k:"price",l:"Sale price",t:"number",req:1},{k:"qty",l:"Stock quantity",t:"number"}],m,o=>{if(id)Object.assign(m,o);else db.meds.push({id:uid(),...o});save();medList()})}
async function delMed(id){if(await ask("Delete this medicine?")){db.meds=db.meds.filter(m=>m.id!=id);save();medList();toast("Medicine deleted")}}
/* Billing */
function sug(){const q=($("#q")?.value||"").toLowerCase();$("#sug").innerHTML=db.meds.filter(m=>m.qty>0&&m.name.toLowerCase().includes(q)).slice(0,30).map(m=>`<div onclick="addC('${m.id}')"><span>${esc(m.name)}</span><span>${money(m.price)} · <small>${m.qty} left</small></span></div>`).join("")||"<div>No match</div>"}
function addC(id){const m=db.meds.find(x=>x.id==id),c=cart.find(x=>x.id==id);if(c){if(c.qty<m.qty)c.qty++}else cart.push({id,name:m.name,price:m.price,cost:m.cost,qty:1});ct()}
function ct(){const cb=$("#cb");if(!cb)return;cb.innerHTML=cart.map((c,i)=>`<tr><td>${esc(c.name)}</td><td>${money(c.price)}</td><td><input type="number" min="1" value="${c.qty}" style="width:70px" onchange="setQ(${i},this.value)"></td><td>${money(c.price*c.qty)}</td><td><button class="btn s r" onclick="cart.splice(${i},1);ct()">✕</button></td></tr>`).join("")||'<tr><td colspan="5">Cart is empty – search and tap a medicine</td></tr>';
 $("#gt").textContent="Total: "+money(Math.max(0,sum(cart.map(c=>c.price*c.qty))-(+$("#ds").value||0)))}
function setQ(i,v){const m=db.meds.find(x=>x.id==cart[i].id);cart[i].qty=Math.max(1,Math.min(+v||1,m.qty));ct()}
function finish(){if(!cart.length)return toast("Cart is empty");const d=+$("#ds").value||0,sub=sum(cart.map(c=>c.price*c.qty));
 const s={id:uid(),bill:"SZ-"+(++db.bill),date:today(),time:nowT(),cust:$("#cu").value.trim()||"Walk-in",items:cart.map(c=>({...c})),disc:d,total:Math.max(0,sub-d)};
 cart.forEach(c=>{const m=db.meds.find(x=>x.id==c.id);if(m)m.qty-=c.qty});db.sales.push(s);save();cart=[];rcpt(s.id);R.sale()}
function rcpt(id){const s=db.sales.find(x=>x.id==id),st=db.set,sub=sum(s.items.map(i=>i.price*i.qty));
 $("#printArea").innerHTML=`<div class="rc"><h2>${esc(st.name)}</h2><p>${esc(st.addr)}</p><p>Ph: ${esc(st.phone)}</p><hr><p style="text-align:left">Bill: <b>${s.bill}</b><br>Date: ${s.date} ${s.time}<br>Customer: ${esc(s.cust)}</p>
 <table><tr><th style="text-align:left">Item</th><th>Qty</th><th>Rate</th><th style="text-align:right">Amt</th></tr>${s.items.map(i=>`<tr><td>${esc(i.name)}</td><td>${i.qty}</td><td>${i.price}</td><td style="text-align:right">${i.price*i.qty}</td></tr>`).join("")}</table>
 <div class="t" style="font-weight:400;font-size:13px"><span>Subtotal</span><span>${sub}</span></div><div class="t" style="font-weight:400;font-size:13px"><span>Discount</span><span>${s.disc}</span></div><div class="t"><span>NET TOTAL</span><span>Rs ${s.total}</span></div><hr><p>${esc(st.foot)}</p></div>`;
 modal('<div style="background:#fff;border-radius:10px;padding:12px;color:#000">'+$("#printArea").innerHTML+'</div><div class="row" style="margin-top:14px"><button class="btn g" onclick="close_()">Close</button><button class="btn" onclick="doPrint()">🖨 Print Bill</button></div>')}
function editSale(id){const s=db.sales.find(x=>x.id==id);
 form("Edit Bill "+s.bill,[{k:"cust",l:"Customer"},{k:"date",l:"Date",t:"date"},{k:"disc",l:"Discount",t:"number"}],s,o=>{Object.assign(s,o);s.total=Math.max(0,sum(s.items.map(i=>i.price*i.qty))-s.disc);save();saleDate=s.date;R.sales()})}
async function delSale(id){if(!await ask("Delete this bill? Stock will be restored."))return;const s=db.sales.find(x=>x.id==id);s.items.forEach(i=>{const m=db.meds.find(x=>x.id==i.id);if(m)m.qty+=i.qty});db.sales=db.sales.filter(x=>x.id!=id);save();R.sales();toast("Bill deleted")}
/* Daily base */
function baseForm(id){const b=db.base.find(x=>x.id==id)||{date:baseDate,type:"Opening Cash"};
 form(id?"Edit Entry":"Add Entry",[{k:"date",l:"Date",t:"date"},{k:"type",l:"Type",o:["Opening Cash","Expense","Deposit","Other"]},{k:"amount",l:"Amount",t:"number",req:1},{k:"note",l:"Note"}],b,o=>{if(id)Object.assign(b,o);else db.base.push({id:uid(),...o});baseDate=o.date;save();R.base()})}
async function delBase(id){if(await ask("Delete entry?")){db.base=db.base.filter(b=>b.id!=id);save();R.base();toast("Entry deleted")}}
/* Excel */
function xlsOut(){const wb=XLSX.utils.book_new(),A=(n,a)=>XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(a),n);
 A("Medicines",db.meds);A("Sales",db.sales.map(s=>({...s,items:JSON.stringify(s.items),Summary:s.items.map(i=>i.name+" x"+i.qty).join(", ")})));A("DailyBase",db.base);A("Settings",[db.set]);
 XLSX.writeFile(wb,"Shahzaib_Medical_Store_"+today()+".xlsx")}
function xlsIn(inp){const f=inp.files[0];if(!f)return;const r=new FileReader();r.onload=async e=>{try{const wb=XLSX.read(e.target.result,{type:"array"}),g=n=>wb.Sheets[n]?XLSX.utils.sheet_to_json(wb.Sheets[n]):[];
 if(!await ask("Replace current data with this Excel file?"))return;
 db.meds=g("Medicines").map(m=>({...m,id:m.id||uid()}));db.sales=g("Sales").map(s=>{delete s.Summary;s.items=JSON.parse(s.items||"[]");return s});db.base=g("DailyBase").map(b=>({...b,id:b.id||uid()}));const st=g("Settings")[0];if(st)db.set=st;save();nav();go("dash")}catch(x){toast("Invalid Excel file")}};r.readAsArrayBuffer(f)}

function ask(msg){return new Promise(res=>{modal('<div class="dlg"><div style="font-size:38px">⚠️</div><p>'+esc(msg)+'</p><div class="row"><button class="btn g" id="dn">No</button><button class="btn r" id="dy">Yes, Confirm</button></div></div>');$("#dn").onclick=()=>{close_();res(false)};$("#dy").onclick=()=>{close_();res(true)}})}
function toast(m){const t=document.createElement("div");t.className="toast";t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2600)}
function doPrint(){try{print()}catch(e){toast("Print is not available here. Use the downloaded app.")}}
function toggleTheme(){const d=document.documentElement,dark=d.dataset.theme?d.dataset.theme=="dark":matchMedia("(prefers-color-scheme:dark)").matches;d.dataset.theme=dark?"light":"dark";try{localStorage.setItem(KEY+"_theme",d.dataset.theme)}catch(e){}}
try{const t=localStorage.getItem(KEY+"_theme");if(t)document.documentElement.dataset.theme=t}catch(e){}
R.rep=function(){const D={},g=d=>D[d]??={sale:0,profit:0,bills:0,exp:0};
 db.sales.forEach(s=>{const d=g(s.date);d.sale+=s.total;d.bills++;d.profit+=s.total-sum(s.items.map(i=>i.cost*i.qty))});
 db.base.filter(b=>b.type=="Expense").forEach(b=>g(b.date).exp+=b.amount);
 const ks=Object.keys(D).sort().reverse().slice(0,31),mx=Math.max(1,...ks.map(k=>D[k].sale)),T=f=>sum(ks.map(k=>D[k][f]));
 $("#main").innerHTML=`<h1>Reports (last 31 days)</h1><div class="grid"><div class="stat"><small>Total Sale</small><b>${money(T("sale"))}</b></div><div class="stat"><small>Total Profit</small><b>${money(T("profit"))}</b></div><div class="stat"><small>Expenses</small><b>${money(T("exp"))}</b></div><div class="stat"><small>Net Profit</small><b>${money(T("profit")-T("exp"))}</b></div></div>
 <div class="card tw"><table><tr><th>Date</th><th>Bills</th><th>Sale</th><th>Profit</th><th>Expense</th><th style="width:160px"></th></tr>${ks.map(k=>`<tr><td>${k}</td><td>${D[k].bills}</td><td>${money(D[k].sale)}</td><td>${money(D[k].profit)}</td><td>${money(D[k].exp)}</td><td><div class="bar" style="width:${D[k].sale/mx*100}%"></div></td></tr>`).join("")||'<tr><td colspan="6">No data yet</td></tr>'}</table></div><button class="btn g" onclick="print()">🖨 Print Report</button>`};

const AK=KEY+"_auth",SK=KEY+"_sess",LKK=KEY+"_lock";
const gs=(s,k)=>{try{return s.getItem(k)}catch(e){return null}};
let auth=null,LK={n:0,until:0};
try{auth=JSON.parse(localStorage.getItem(AK));LK=JSON.parse(localStorage.getItem(LKK))||LK}catch(e){}
const saveAuth=()=>{try{localStorage.setItem(AK,JSON.stringify(auth))}catch(e){}};
const setLK=()=>{try{localStorage.setItem(LKK,JSON.stringify(LK))}catch(e){}};
async function hs(s){const t="szms::"+s;try{const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}catch(e){let h=5381;for(const c of t)h=((h<<5)+h+c.charCodeAt(0))>>>0;return "f"+h}}
function showPw(){const p=$("#lp");p.type=p.type=="password"?"text":"password"}
async function doLogin(){const e=$("#lerr");
 if(Date.now()<LK.until){e.textContent="Too many attempts. Try again in "+Math.ceil((LK.until-Date.now())/1000)+" sec";return}
 const u=$("#lu").value.trim().toLowerCase(),p=$("#lp").value.trim();
 if(!u||!p){e.textContent="Please enter username and password";return}
 if(u==auth.user.toLowerCase()&&await hs(p)==auth.hash){LK={n:0,until:0};setLK();try{($("#lr").checked?localStorage:sessionStorage).setItem(SK,"1")}catch(x){}$("#lp").value="";e.textContent="";unlock();if(auth.def)setTimeout(()=>toast("Please change the default password in Settings"),600)}
 else{LK.n++;if(LK.n>=5){LK={n:0,until:Date.now()+30000};e.textContent="Too many wrong attempts. Locked for 30 seconds."}else e.textContent="Wrong username or password ("+(5-LK.n)+" tries left)";setLK()}}
function unlock(){document.body.classList.remove("locked");$("#who").textContent=auth.user;nav();go("dash")}
async function logout(){if(!await ask("Logout from the app?"))return;try{sessionStorage.removeItem(SK);localStorage.removeItem(SK)}catch(e){}close_();$("#lu").value="";$("#lhint").style.display=auth.def?"block":"none";document.body.classList.add("locked")}
function acctForm(){form("Change Login Details",[{k:"cur",l:"Current password",t:"password",req:1},{k:"user",l:"New username",req:1},{k:"np",l:"New password (leave blank to keep, min 6)",t:"password"},{k:"rec",l:"Recovery word (used if you forget password)",req:1}],{user:auth.user},async o=>{
 if(await hs(o.cur)!=auth.hash){toast("Current password is wrong");return}
 if(o.np&&o.np.length<6){toast("Password must be at least 6 characters");return}
 auth.user=o.user;if(o.np)auth.hash=await hs(o.np);auth.rec=await hs(o.rec.toLowerCase());auth.def=false;saveAuth();$("#who").textContent=auth.user;const w=$("#who2");if(w)w.textContent=auth.user;toast("Login details updated")})}
function forgot(){if(!auth.rec){toast(auth.def?"Default login is admin / admin@23":"No recovery word was set");return}
 form("Reset Password",[{k:"rec",l:"Recovery word",t:"password",req:1},{k:"np",l:"New password (min 6)",t:"password",req:1}],{},async o=>{if(await hs(o.rec.toLowerCase())!=auth.rec){toast("Recovery word is wrong");return}if(o.np.length<6){toast("Minimum 6 characters");return}auth.hash=await hs(o.np);auth.def=false;saveAuth();toast("Password reset. Please login.")})}
async function boot(){if(!auth||!auth.hash){auth={user:"admin",hash:await hs("admin@23"),rec:"",def:true};saveAuth()}
 $("#ln").textContent=db.set.name;$("#lhint").style.display=auth.def?"block":"none";
 $("#login").addEventListener("keydown",e=>{if(e.key=="Enter")doLogin()});
 if(gs(sessionStorage,SK)=="1"||gs(localStorage,SK)=="1")unlock()}
boot();
