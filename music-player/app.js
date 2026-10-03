const audio=document.getElementById('audio');
const content=document.getElementById('content');
const fileInput=document.getElementById('fileInput');
const importBtn=document.getElementById('importBtn');
const searchInput=document.getElementById('searchInput');
const playBtn=document.getElementById('playBtn');
const progress=document.getElementById('progress');
const volume=document.getElementById('volume');
const currentTime=document.getElementById('currentTime');
const duration=document.getElementById('duration');
const playerTitle=document.getElementById('playerTitle');
const playerArtist=document.getElementById('playerArtist');
const playerCover=document.getElementById('playerCover');
let tracks=JSON.parse(localStorage.getItem('music-tracks')||'[]');
let index=-1, shuffled=false, repeating=false, favorites=new Set(JSON.parse(localStorage.getItem('music-favorites')||'[]'));
const demo=[
 {title:'Midnight City',artist:'M83',album:'Hurry Up, We’re Dreaming',cover:'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80'},
 {title:'After Dark',artist:'Mr.Kitty',album:'Time',cover:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80'},
 {title:'Sunset Lover',artist:'Petit Biscuit',album:'Presence',cover:'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80'},
 {title:'Intro',artist:'The xx',album:'xx',cover:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80'}
];
function esc(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function save(){localStorage.setItem('music-tracks',JSON.stringify(tracks.map(t=>({...t,url:undefined}))));localStorage.setItem('music-favorites',JSON.stringify([...favorites]));}
function fmt(sec){if(!Number.isFinite(sec))return '0:00';return Math.floor(sec/60)+':'+String(Math.floor(sec%60)).padStart(2,'0');}
function cover(t){return t.cover||'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80';}
function render(view='listen',query=''){
 const q=query.toLowerCase(); let list=tracks.length?tracks:demo;
 if(view==='favorites')list=list.filter((_,i)=>favorites.has(i));
 if(view==='recent')list=list.slice().reverse();
 if(q)list=list.filter(t=>(t.title+' '+t.artist+' '+t.album).toLowerCase().includes(q));
 const cards=list.slice(0,8).map((t,i)=>`<div class="album" data-track="${tracks.indexOf(t)}"><div class="cover"><img src="${cover(t)}" alt=""></div><strong>${esc(t.title)}</strong><span>${esc(t.artist)}</span></div>`).join('');
 const songs=list.map((t)=>{const real=tracks.indexOf(t);return `<div class="song" data-track="${real}"><img class="song-cover" src="${cover(t)}"><div><div class="song-name">${esc(t.title)}</div><div class="song-artist">${esc(t.artist)} · ${esc(t.album||'Album')}</div></div><button class="song-heart" data-fav="${real}">${favorites.has(real)?'♥':'♡'}</button><span class="song-time">♪</span></div>`}).join('');
 if(!tracks.length){content.innerHTML=`<div class="hero"><div><div class="eyebrow">MUSIC PLAYER</div><h1>Âm nhạc, theo cách của bạn.</h1><p>Giao diện desktop tối giản, lấy cảm hứng từ các ứng dụng nghe nhạc hiện đại. Thêm MP3, WAV, M4A hoặc FLAC từ máy tính để bắt đầu.</p><button class="import-btn" id="heroImport">Thêm nhạc từ máy</button></div></div><div class="section-title"><h2>Khám phá</h2><span class="muted">Demo artwork</span></div><div class="album-grid">${cards}</div><div class="section-title"><h2>Bài hát</h2></div><div class="song-list">${demo.map((t,i)=>`<div class="song" data-demo="${i}"><img class="song-cover" src="${cover(t)}"><div><div class="song-name">${esc(t.title)}</div><div class="song-artist">${esc(t.artist)} · ${esc(t.album)}</div></div><span></span><span class="song-time">Demo</span></div>`).join('')}</div>`;document.getElementById('heroImport')?.addEventListener('click',()=>fileInput.click());}
 else {content.innerHTML=`<div class="section-title"><h2>${view==='favorites'?'Bài hát yêu thích':view==='recent'?'Phát gần đây':view==='browse'?'Duyệt nhạc':view==='library'?'Thư viện':'Nghe ngay'}</h2><span class="muted">${list.length} bài hát</span></div><div class="album-grid">${cards}</div><div class="section-title"><h2>Tất cả bài hát</h2></div><div class="list-heading"><span></span><span>Bài hát</span><span>Thời lượng</span></div><div class="song-list">${songs||'<div class="empty">Không có bài hát phù hợp.</div>'}</div>`;}
 content.querySelectorAll('[data-track]').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('[data-fav]'))return;const n=Number(el.dataset.track);if(n>=0)load(n,true);}));
 content.querySelectorAll('[data-demo]').forEach(el=>el.addEventListener('click',()=>alert('Demo artwork chỉ để xem giao diện. Hãy bấm “Thêm nhạc” để phát file của bạn.')));
 content.querySelectorAll('[data-fav]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const n=Number(b.dataset.fav);favorites.has(n)?favorites.delete(n):favorites.add(n);save();render(view,searchInput.value);}));
}
function load(n,autoplay=false){if(n<0||n>=tracks.length)return;index=n;const t=tracks[n];audio.src=t.url;playerTitle.textContent=t.title;playerArtist.textContent=t.artist||'Unknown Artist';playerCover.classList.remove('placeholder');playerCover.innerHTML=`<img src="${cover(t)}" alt="">`;if(autoplay)audio.play();updatePlay();}
function updatePlay(){playBtn.textContent=audio.paused?'▶':'Ⅱ';}
importBtn.onclick=()=>fileInput.click();
fileInput.onchange=e=>{[...e.target.files].forEach(file=>{tracks.push({title:file.name.replace(/\.[^/.]+$/,''),artist:'Tệp của bạn',album:'Local Music',cover:'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80',url:URL.createObjectURL(file)});});save();render();if(index<0&&tracks.length)load(tracks.length-e.target.files.length,false);fileInput.value='';};
playBtn.onclick=()=>{if(index<0){if(tracks.length)load(0,true);return;}audio.paused?audio.play():audio.pause();updatePlay();};
document.getElementById('prevBtn').onclick=()=>{if(!tracks.length)return;index=(index-1+tracks.length)%tracks.length;load(index,true)};
document.getElementById('nextBtn').onclick=()=>{if(!tracks.length)return;let n=shuffled?Math.floor(Math.random()*tracks.length):(index+1)%tracks.length;load(n,true)};
document.getElementById('shuffleBtn').onclick=()=>{shuffled=!shuffled;document.getElementById('shuffleBtn').style.color=shuffled?'#fff':''};
document.getElementById('repeatBtn').onclick=()=>{repeating=!repeating;audio.loop=repeating;document.getElementById('repeatBtn').style.color=repeating?'#fff':''};
document.getElementById('likeBtn').onclick=()=>{if(index<0)return;favorites.has(index)?favorites.delete(index):favorites.add(index);save();document.getElementById('likeBtn').textContent=favorites.has(index)?'♥':'♡';render();};
volume.oninput=()=>audio.volume=volume.value;audio.volume=.8;
progress.oninput=()=>{if(audio.duration)audio.currentTime=(progress.value/100)*audio.duration};
audio.ontimeupdate=()=>{progress.value=audio.duration?(audio.currentTime/audio.duration)*100:0;currentTime.textContent=fmt(audio.currentTime);duration.textContent=fmt(audio.duration)};audio.onloadedmetadata=()=>duration.textContent=fmt(audio.duration);audio.onplay=updatePlay;audio.onpause=updatePlay;audio.onended=()=>{if(!repeating)document.getElementById('nextBtn').click()};
searchInput.oninput=()=>render('listen',searchInput.value);
document.querySelectorAll('.nav-item').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));btn.classList.add('active');render(btn.dataset.view,searchInput.value)});
document.getElementById('createPlaylist').onclick=()=>{const name=prompt('Tên playlist mới:');if(name)alert(`Đã tạo playlist “${name}” (giao diện demo).`)};
render();