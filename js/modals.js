/* ============================================================
   MODALS — generic open/close + escape key handling
   ============================================================ */
function openModal(id){ document.getElementById(id).classList.add('open'); document.body.style.overflow='hidden'; }
function closeModal(id){ document.getElementById(id).classList.remove('open'); document.body.style.overflow=''; }

document.addEventListener('keydown', e => {
  if(e.key==='Escape'){ closeSearch(); }
});
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if(e.target===m){ closeModal(m.id); } });
});
document.addEventListener('keydown', e => { if(e.key==='Escape'){ document.querySelectorAll('.modal-overlay.open').forEach(m=>closeModal(m.id)); } });
