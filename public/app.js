const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.__ENV__;
const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

const grid = document.getElementById('grid');
const shelf = document.getElementById('shelf');
const shelfCount = document.getElementById('shelfCount');
const compareCount = document.getElementById('compareCount');
const selected = new Set();
let activeKey = 'all';
let allItems = [];

async function fetchKits() {
  const select = [
    'id','name','price','category','upc',
    'image_url','primary_image_url','detail_image_url',
    'features','mesh','usb_midi','bluetooth_audio'
  ].join(',');
  const url = `${SUPABASE_URL}/rest/v1/products_features?select=${encodeURIComponent(select)}&order=price.asc`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error(`Supabase error ${res.status}: ${err.message||'check RLS/view name'}`);
  }
  return res.json();
}

function pillList(item){
  const pills = [];
  if (item.mesh) pills.push('Mesh');
  if (item.usb_midi) pills.push('USB/MIDI');
  if (item.bluetooth_audio) pills.push('Bluetooth');
  return pills;
}

function imageFor(item){
  return item.image_url || item.primary_image_url || item.detail_image_url ||
         'https://dummyimage.com/1280x720/0a1624/8fb3d9&text=Alesis';
}

function render(){
  const items = allItems.filter(x=>{
    if(activeKey==='all') return true;
    if(activeKey==='On Demo') {
      // If you later add traits.demo, this will auto-pick; for now we keep all.
      return (x.traits?.demo===true) || /demo/i.test(x.name||'');
    }
    return (x.category===activeKey);
  });

  grid.innerHTML = items.map(k=>{
    const pills = pillList(k);
    const feats = Array.isArray(k.features) ? k.features : [];
    return `
      <article class="card">
        <div class="card__img">
          <img src="${imageFor(k)}" alt="${k.name}">
          <div class="price">د ${Number(k.price||0).toLocaleString('en-US',{minimumFractionDigits:0})}</div>
        </div>
        <div class="card__body">
          <div class="name">${k.name||''}</div>
          <div class="upc">UPC: ${k.upc || '-'}</div>
          <div class="pills">${pills.map(p=>`<span>${p}</span>`).join('')}</div>
          ${feats.length ? `<div class="features">${feats.map(f=>`<span>${f}</span>`).join('')}</div>` : ``}
          <label class="compare">
            <input type="checkbox" data-id="${k.id}">
            Add to compare
          </label>
        </div>
      </article>
    `;
  }).join('');

  // compare handlers
  grid.querySelectorAll('input[type="checkbox"][data-id]').forEach(cb=>{
    cb.addEventListener('change', (e)=>{
      const id = e.target.getAttribute('data-id');
      if(e.target.checked) selected.add(id); else selected.delete(id);
      const n = selected.size;
      compareCount.textContent = n;
      shelfCount.textContent = n;
      shelf.classList.toggle('hidden', n<2);
    });
  });
}

async function init(){
  try {
    allItems = await fetchKits();
    render();
  } catch (e) {
    grid.innerHTML = `<div style="padding:14px;color:#ffb4b4;border:1px dashed #733">Failed to load: ${e.message}</div>`;
  }
}

// tabs
document.querySelectorAll('[data-key]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.chip').forEach(b=>b.classList.remove('chip--active'));
    btn.classList.add('chip--active');
    activeKey = btn.getAttribute('data-key');
    render();
  });
});

// header buttons
document.getElementById('findBtn').addEventListener('click', ()=> {
  window.scrollTo({ top: document.getElementById('grid').offsetTop - 60, behavior:'smooth' });
});
document.getElementById('compareBtn').addEventListener('click', ()=>{
  if(selected.size<2) return;
  alert('Compare view coming next');
});
document.getElementById('openCompare').addEventListener('click', ()=>{
  if(selected.size<2) return;
  alert('Compare view coming next');
});

init();
