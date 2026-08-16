export const $=(sel,root=document)=>root.querySelector(sel);
export const $$=(sel,root=document)=>[...root.querySelectorAll(sel)];
export const rupiah=new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0});
export const money=v=>rupiah.format(Number(v||0));
export const num=v=>Number(String(v??0).replace(/[^0-9.-]/g,''))||0;
export const escapeHtml=(s='')=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export const debounce=(fn,delay=300)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),delay)}};
export const dateTime=(value)=>{const d=value?.toDate?value.toDate():value?new Date(value):new Date();return d.toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'})};
export const dateOnly=(value)=>{const d=value?.toDate?value.toDate():value?new Date(value):new Date();return d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})};
export const todayKey=()=>{const d=new Date();const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
export const startOfDay=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
export const startOfMonth=()=>{const d=new Date();d.setDate(1);d.setHours(0,0,0,0);return d};
export const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function toast(message,type='success',timeout=3200){
  const box=$('#toastContainer'); if(!box)return;
  const el=document.createElement('div');el.className=`toast ${type}`;
  const icon=type==='error'?'circle-xmark':type==='warning'?'triangle-exclamation':'circle-check';
  const i=document.createElement('i');i.className=`fa-solid fa-${icon}`;
  const span=document.createElement('div');span.textContent=message;
  el.append(i,span);box.append(el);setTimeout(()=>el.remove(),timeout);
}
export function loading(show=true,text='Memuat...'){const o=$('#loadingOverlay');if(!o)return;$('#loadingText').textContent=text;o.classList.toggle('hidden',!show)}
export function closeModal(){const root=$('#modalRoot');root.innerHTML=''}
export function openModal(content,{size=''}={}){const root=$('#modalRoot');root.innerHTML=`<div class="modal-backdrop"><div class="modal-card ${size}"><button class="modal-x" data-close-modal aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>${content}</div></div>`;$$('[data-close-modal]',root).forEach(b=>b.addEventListener('click',closeModal));root.querySelector('.modal-backdrop')?.addEventListener('click',e=>{if(e.target.classList.contains('modal-backdrop'))closeModal()});return root.querySelector('.modal-card')}
export function confirmDialog(title,message,okText='Ya, lanjutkan'){return new Promise(resolve=>{const t=$('#confirmTemplate');const root=$('#modalRoot');root.innerHTML='';const node=t.content.cloneNode(true);root.append(node);$('[data-confirm-title]',root).textContent=title;$('[data-confirm-message]',root).textContent=message;$('[data-confirm-ok]',root).textContent=okText;$$('[data-close-modal]',root).forEach(b=>b.addEventListener('click',()=>{closeModal();resolve(false)}));$('[data-confirm-ok]',root).addEventListener('click',()=>{closeModal();resolve(true)})})}
export function emptyState(title='Belum ada data',desc='Data akan tampil di sini.',icon='box-open'){return `<div class="empty"><i class="fa-solid fa-${icon}"></i><h4>${escapeHtml(title)}</h4><p>${escapeHtml(desc)}</p></div>`}
export function statusBadge(status){const s=String(status||'').toLowerCase();const cls=['completed','aktif','aman','open','success'].includes(s)?'success':['hampir habis','warning','pending'].includes(s)?'warning':['habis','cancelled','returned','nonaktif','inactive'].includes(s)?'danger':'info';return `<span class="badge ${cls}">${escapeHtml(status||'-')}</span>`}
export function downloadCsv(filename,rows){if(!rows.length)return toast('Tidak ada data untuk diekspor','warning');const keys=Object.keys(rows[0]);const enc=v=>`"${String(v??'').replaceAll('"','""')}"`;const csv='\ufeff'+[keys.map(enc).join(','),...rows.map(r=>keys.map(k=>enc(r[k])).join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=filename;a.click();URL.revokeObjectURL(a.href)}
export function setPageTitle(t){$('#pageTitle').textContent=t;document.title=`${t} — Kasir Pro`}
export function safeImage(url,alt='Produk'){if(!url)return `<i class="fa-solid fa-box"></i>`;return `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy" onerror="this.replaceWith(document.createTextNode('📦'))">`}
