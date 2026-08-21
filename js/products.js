/* ============================================================
   PRODUCTS & CATEGORIES — rendering, filtering, search, wishlist
   ============================================================ */
function populateDistricts(){
  const sel = document.getElementById('ckDistrict');
  sel.innerHTML = '<option value="">Select District</option>' + BD_DISTRICTS.map(d=>`<option value="${d}">${d}</option>`).join('');
}

/* ============================================================
   RENDER: CATEGORIES
   ============================================================ */
function renderCategories(){
  const grid = document.getElementById('catGrid');
  grid.innerHTML = CATEGORIES.map(c => `
    <div class="cat-card" onclick="filterAndScroll('${c.name}')" style="background:${c.image ? `url('${c.image}') center/cover` : `linear-gradient(160deg, ${c.color1}, ${c.color2})`}">
      <div class="overlay"></div>
      <div style="position:relative;z-index:2;">
        <div class="tag">Shop Collection</div>
        <h3>${c.label}</h3>
      </div>
    </div>
  `).join('');
}

/* ============================================================
   RENDER: FILTER TABS
   ============================================================ */
function renderFilterTabs(){
  const tabs = document.getElementById('filterTabs');
  const cats = ['All', ...CATEGORIES.map(c=>c.name)];
  tabs.innerHTML = cats.map(c => `<button class="filter-tab ${c===activeFilter?'active':''}" onclick="setFilter('${c}')">${c}</button>`).join('');
}
function setFilter(cat){ activeFilter = cat; renderFilterTabs(); renderProducts(); }
function filterAndScroll(cat){ setFilter(cat); document.getElementById('shop').scrollIntoView({behavior:'smooth'}); }

/* ============================================================
   RENDER: PRODUCTS
   ============================================================ */
function renderProducts(){
  const grid = document.getElementById('productGrid');
  let list = activeFilter==='All' ? [...PRODUCTS] : PRODUCTS.filter(p=>p.cat===activeFilter);
  const sortVal = document.getElementById('sortSelect').value;
  if(sortVal==='low-high') list.sort((a,b)=>effectivePrice(a)-effectivePrice(b));
  if(sortVal==='high-low') list.sort((a,b)=>effectivePrice(b)-effectivePrice(a));

  if(list.length===0){
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--bark-soft);">No products in this category yet.</div>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const hasDisc = p.discountPercent && p.discountPercent > 0;
    const fPrice = effectivePrice(p);
    return `
    <div class="product-card">
      ${hasDisc ? `<div class="badge" style="background:#c0463a;">${p.discountPercent}% OFF</div>` : (p.badge ? `<div class="badge">${p.badge}</div>` : '')}
      <button class="wish-btn ${WISHLIST.includes(p.id)?'active':''}" onclick="toggleWish(${p.id})" aria-label="Wishlist">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${WISHLIST.includes(p.id)?'#b6791f':'none'}" stroke="#b6791f" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/></svg>
      </button>
      <div class="product-media">${productMediaHTML(p)}</div>
      <div class="product-info">
        <div class="pcat">${p.cat}</div>
        <h4>${p.name}</h4>
        <div class="price-row">
          <div class="price">${hasDisc ? `<span class="old">$${p.price.toFixed(2)}</span>`:''}$${fPrice.toFixed(2)}</div>
        </div>
        <div class="product-actions">
          <button class="btn-sm add" onclick="addToCart(${p.id})">Add to Cart</button>
          <button class="btn-sm buy" onclick="buyNow(${p.id})">Buy Now</button>
        </div>
      </div>
    </div>
  `;}).join('');
}

function toggleWish(id){
  if(WISHLIST.includes(id)) WISHLIST = WISHLIST.filter(w=>w!==id);
  else WISHLIST.push(id);
  saveCartWishlist(); renderProducts();
}


function openSearch(){
  const bar = document.getElementById('searchBar');
  bar.classList.add('open');
  document.getElementById('searchResults').innerHTML = '<div class="search-hint">Type to search across all products</div>';
  setTimeout(()=>document.getElementById('searchInput').focus(), 200);
}
function closeSearch(){
  document.getElementById('searchBar').classList.remove('open');
  document.getElementById('searchInput').value = '';
}
function liveSearch(){
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const wrap = document.getElementById('searchResults');
  if(q.length===0){
    wrap.innerHTML = '<div class="search-hint">Type to search across all products</div>';
    return;
  }
  const matches = PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
  if(matches.length===0){
    wrap.innerHTML = `<div class="search-empty">No products found for "${q}"</div>`;
    return;
  }
  wrap.innerHTML = matches.map(p => `
    <div class="search-result-item" onclick="goToProduct('${p.cat}')">
      <div class="thumb">${productMediaHTML(p)}</div>
      <div class="info"><h5>${p.name}</h5><div class="meta">${p.cat}</div></div>
      <div class="price">$${effectivePrice(p).toFixed(2)}</div>
    </div>
  `).join('');
}
function goToProduct(cat){
  closeSearch();
  filterAndScroll(cat);
}
