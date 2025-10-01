// ISO Messenger - client-side offline demo (localStorage)
// Keys
const LS_USERS='iso_users', LS_SESSION='iso_session', LS_CHATS='iso_chats';

// Helpers
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k,def) => { const v = localStorage.getItem(k); return v? JSON.parse(v): def; };

// initialize demo data
function ensureDemo(){
  if(!load(LS_USERS,[]).length){
    const users = [{id:1,name:'Alex'},{id:2,name:'Maya'},{id:3,name:'Ravi'}];
    save(LS_USERS, users);
  }
  if(!load(LS_CHATS,[]).length){
    const now = Date.now();
    const chats = [
      {id:1, participants:[1,2], messages:[{from:1,text:'Hey Maya! 👋',time:now-60000},{from:2,text:'Hi Alex! How are you?',time:now-50000}]},
      {id:2, participants:[1,3], messages:[{from:3,text:'Yo Alex, want to game later?',time:now-200000}]}
    ];
    save(LS_CHATS, chats);
  }
}
ensureDemo();

// Session helpers
function currentUser(){ return load(LS_SESSION,null); }
function setSession(u){ save(LS_SESSION,u); }

// Public functions used by HTML
function isoRegisterOrLogin(name){
  let users = load(LS_USERS, []);
  let u = users.find(x=>x.name===name);
  if(!u){ u = {id: Date.now(), name}; users.push(u); save(LS_USERS, users); }
  setSession(u);
  location.href = 'chats.html';
}

// Page logic
// Login page has login buttons handled in-line in HTML

// Chats page
if(document.getElementById('contactsList') || document.getElementById('searchFriend')){
  const user = currentUser();
  if(!user){ location.href='login.html'; }
  const users = load(LS_USERS, []);
  const chats = load(LS_CHATS, []);
  function renderContacts(filter=''){
    const el = document.getElementById('contactsList');
    el.innerHTML = '';
    users.filter(u=>u.id!==user.id && u.name.toLowerCase().includes(filter.toLowerCase())).forEach(u=>{
      const div = document.createElement('div'); div.className='contact';
      div.innerHTML = `<div class="avatar">${u.name[0]||'🙂'}</div><div class="meta"><div class="name">${u.name}</div><div class="small muted">Tap to chat</div></div>`;
      div.addEventListener('click', ()=> openChatWith(u.id));
      el.appendChild(div);
    });
  }
  renderContacts();
  document.getElementById('searchFriend').addEventListener('input', (e)=> renderContacts(e.target.value));
  document.getElementById('logoutBtn').addEventListener('click', ()=> { localStorage.removeItem(LS_SESSION); location.href='login.html'; });
  document.getElementById('openProfile').addEventListener('click', ()=> location.href='profile.html');
}

// Chat page
if(document.getElementById('chatWindow') || document.getElementById('messageInput')){
  const user = currentUser();
  if(!user) location.href='login.html';
  const chats = load(LS_CHATS, []);
  const users = load(LS_USERS, []);
  // determine chat id from query ?id= or hash #id or URL param 'with'
  const url = new URL(location.href);
  let chatId = url.searchParams.get('id') || (location.hash.replace('#','')|| null);
  // If opened with ?with=USERID, find or create chat
  const withId = url.searchParams.get('with');
  if(withId){
    let c = chats.find(x=> x.participants.includes(parseInt(withId)) && x.participants.includes(user.id));
    if(!c){
      c = { id: Date.now(), participants:[user.id, parseInt(withId)], messages:[] };
      chats.push(c); save(LS_CHATS, chats);
    }
    chatId = c.id;
    history.replaceState(null, '', 'chat.html#' + chatId);
  }
  function findChat(){
    return chats.find(x=> String(x.id)===String(chatId));
  }
  function renderChat(){
    const win = document.getElementById('chatWindow');
    const c = findChat();
    if(!c){ win.innerHTML = '<div class="center padded"><h3>No chat found</h3></div>'; return; }
    const otherId = c.participants.find(pid => pid !== user.id);
    const other = users.find(u=>u.id===otherId) || {name:'Unknown'};
    document.getElementById('chatTitle').textContent = other.name;
    win.innerHTML = '';
    c.messages.forEach(m=>{
      const el = document.createElement('div'); el.className = 'msg ' + (m.from===user.id? 'me':'you');
      el.textContent = m.text;
      win.appendChild(el);
    });
    win.scrollTop = win.scrollHeight;
  }
  renderChat();
  document.getElementById('sendBtn').addEventListener('click', sendMsg);
  document.getElementById('messageInput').addEventListener('keydown', (e)=> { if(e.key==='Enter') sendMsg(); });
  document.getElementById('backBtn')?.addEventListener('click', ()=> location.href='chats.html');
  document.getElementById('profileBtn')?.addEventListener('click', ()=> location.href='profile.html');
  function sendMsg(){
    const text = document.getElementById('messageInput').value.trim();
    if(!text) return;
    const c = findChat();
    if(!c) return alert('No chat opened');
    c.messages.push({from: user.id, text, time: Date.now()});
    save(LS_CHATS, chats);
    document.getElementById('messageInput').value = '';
    renderChat();
  }
}

// Profile page
if(document.getElementById('saveProfile') || document.getElementById('nameInput')){
  const user = currentUser();
  if(!user) location.href='login.html';
  const users = load(LS_USERS, []);
  document.getElementById('nameInput').value = user.name || '';
  document.getElementById('statusInput').value = user.status || '';
  document.getElementById('avatar').textContent = (user.name||'G')[0];
  document.getElementById('saveProfile').addEventListener('click', ()=>{
    const name = document.getElementById('nameInput').value.trim();
    const status = document.getElementById('statusInput').value.trim();
    if(!name){ alert('Name cannot be empty'); return; }
    const u = users.find(x=>x.id===user.id);
    if(u){ u.name = name; u.status = status; save(LS_USERS, users); setSession(u); alert('Saved!'); location.href='chats.html'; }
  });
  document.getElementById('deleteData').addEventListener('click', ()=>{
    if(confirm('Clear all local ISO demo data? This will remove chats & contacts.')){ localStorage.removeItem(LS_CHATS); localStorage.removeItem(LS_USERS); localStorage.removeItem(LS_SESSION); alert('Cleared — reloading'); location.href='login.html'; }
  });
  document.getElementById('backHome').addEventListener('click', ()=> location.href='chats.html');
}

// Utility to open/create chat with user id
function openChatWith(userId){
  const chats = load(LS_CHATS, []);
  const sess = currentUser();
  let c = chats.find(x=> x.participants.includes(parseInt(userId)) && x.participants.includes(sess.id));
  if(!c){ c = { id: Date.now(), participants:[sess.id, parseInt(userId)], messages:[] }; chats.push(c); save(LS_CHATS, chats); }
  location.href = 'chat.html?id=' + c.id;
}
