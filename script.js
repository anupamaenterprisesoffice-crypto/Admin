// Firebase Initialization
const firebaseConfig = {
  apiKey: "AIzaSyApLpqXTnuPsT5rdDG04jLMlW-a0ERkbpM",
  authDomain: "stockgameultra.firebaseapp.com",
  databaseURL: "https://stockgameultra-default-rtdb.firebaseio.com",
  projectId: "stockgameultra",
  storageBucket: "stockgameultra.firebasestorage.app",
  messagingSenderId: "1066418592088",
  appId: "1:1066418592088:web:621bdc590399d5e7952d2d",
  measurementId: "G-F82W7SS2SV"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ---------------- Users ----------------
function loadUsers(){
  db.ref('users').on('value', snap=>{
    const users = snap.val();
    const container = document.getElementById('usersList');
    container.innerHTML='';
    for(let uid in users){
      const u = users[uid];
      const div = document.createElement('div');
      div.className='card';
      div.innerHTML=`<strong>${u.username}</strong> - Balance: ${u.balance || 0}<br/>
      <button class="edit" onclick="editUser('${uid}')">Edit Balance</button>
      <button class="vip" onclick="toggleVIP('${uid}')">${u.vip?'Remove VIP':'Make VIP'}</button>
      <button class="ban" onclick="toggleBan('${uid}')">${u.banned?'Unban':'Ban'}</button>
      <button class="delete" onclick="deleteUser('${uid}')">Delete</button>`;
      container.appendChild(div);
    }
  });
}

function editUser(uid){ const newBal=prompt("Enter new balance:"); if(newBal!==null) db.ref('users/'+uid+'/balance').set(Number(newBal)); }
function toggleVIP(uid){ db.ref('users/'+uid+'/vip').once('value').then(snap=>db.ref('users/'+uid+'/vip').set(!snap.val())); }
function toggleBan(uid){ db.ref('users/'+uid+'/banned').once('value').then(snap=>db.ref('users/'+uid+'/banned').set(!snap.val())); }
function deleteUser(uid){ if(confirm("Delete this user?")) db.ref('users/'+uid).remove(); }
function globalBalanceReset(){ if(confirm("Reset all user balances to 0?")){ db.ref('users').once('value').then(snap=>{ const u=snap.val(); for(let id in u) db.ref('users/'+id+'/balance').set(0); }); }}

// ---------------- Stocks ----------------
function loadStocks(){ db.ref('stocks').on('value', snap=>{ const stocks = snap.val(); const container=document.getElementById('stocksList'); container.innerHTML=''; for(let id in stocks){ const s=stocks[id]; const div=document.createElement('div'); div.className='card'; div.innerHTML=`<strong>${s.name}</strong> - Price: ${s.price}<br/>
<button class="edit" onclick="editStock('${id}')">Edit</button>
<button class="delete" onclick="deleteStock('${id}')">Delete</button>`; container.appendChild(div); } }); }
function addStock(){ const name=document.getElementById('stockName').value; const price=Number(document.getElementById('stockPrice').value); if(name && !isNaN(price)){ db.ref('stocks').push({name,price}); document.getElementById('stockName').value=''; document.getElementById('stockPrice').value=''; } }
function editStock(id){ const newPrice=prompt("Enter new price:"); if(newPrice!==null && !isNaN(newPrice)) db.ref('stocks/'+id+'/price').set(Number(newPrice)); }
function deleteStock(id){ if(confirm("Delete this stock?")) db.ref('stocks/'+id).remove(); }
function pauseTrading(){ db.ref('system/tradingPaused').set(true); alert("Trading paused."); }
function resumeTrading(){ db.ref('system/tradingPaused').set(false); alert("Trading resumed."); }
function simulateMarketEvent(){ const desc=prompt("Enter market event description:"); if(desc) db.ref('marketEvents').push({desc,timestamp:Date.now()}); alert("Event simulated."); }

// ---------------- Announcements ----------------
function postAnnouncement(){ const text=document.getElementById('announcementText').value; if(text){ const key=db.ref('announcements').push().key; db.ref('announcements/'+key).set({text,timestamp:Date.now()}); document.getElementById('announcementText').value=''; } }
function loadAnnouncements(){ db.ref('announcements').on('value',snap=>{ const container=document.getElementById('announcementsList'); container.innerHTML=''; const anns=snap.val(); for(let id in anns){ const div=document.createElement('div'); div.className='card'; div.innerHTML=`${anns[id].text}<br/><small>${new Date(anns[id].timestamp).toLocaleString()}</small>`; container.appendChild(div); } }); }

// ---------------- Analytics ----------------
function viewStats(){ db.ref('users').once('value').then(snap=>{ const users=snap.val(); let total=0; for(let id in users) total+=Number(users[id].balance ||0); document.getElementById('stats').innerHTML=`Total Users: ${Object.keys(users).length}<br/>Total Balance: ${total}`; }); }

// ---------------- Database ----------------
function backupDatabase(){ db.ref().once('value').then(snap=>{ const data=JSON.stringify(snap.val()); const blob=new Blob([data],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='backup.json'; a.click(); }); }
function restoreDatabase(){ alert("Restore via import file."); }
function exportData(){ backupDatabase(); }
function importData(){ const file=document.getElementById('importFile').files[0]; if(file){ const reader=new FileReader(); reader.onload=function(e){ const data=JSON.parse(e.target.result); db.ref().set(data); }; reader.readAsText(file); } }

// ---------------- Logs ----------------
function loadLogs(){ db.ref('adminLogs').once('value').then(snap=>{ const logs=snap.val(); const container=document.getElementById('logsList'); container.innerHTML=''; for(let id in logs){ const div=document.createElement('div'); div.className='card'; div.innerHTML=`${logs[id].action} - ${new Date(logs[id].timestamp).toLocaleString()}`; container.appendChild(div); } }); }

// Load everything automatically
loadUsers(); loadStocks(); loadAnnouncements(); loadLogs();
