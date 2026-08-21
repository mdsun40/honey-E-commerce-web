/* ============================================================
   ADMIN DASHBOARD — full-screen panel: products, categories, orders
   ============================================================ */
function openAdminFull(){
  document.getElementById('adminFull').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeAdminFull(){
  document.getElementById('adminFull').classList.remove('open');
  document.body.style.overflow='';
}

function adminLogin(){
  const email = document.getElementById('adminEmail').value.trim();
  const pass = document.getElementById('adminPass').value;
  const errEl = document.getElementById('adminLoginError');
  errEl.textContent = '';
  if(!email || !pass){ errEl.textContent = 'Enter both email and password.'; return; }
  auth.signInWithEmailAndPassword(email, pass)
    .catch(err => { errEl.textContent = 'Login failed: ' + err.message; });
}
function adminLogout(){
  auth.signOut();
}
auth.onAuthStateChanged(user => {
  isAdmin = !!user;
  if(user){
    document.getElementById('adminLoginScreen').style.display='none';
    document.getElementById('adminShell').style.display='flex';
    showAdminView('overview');
    renderAdminProducts(); renderAdminOrders(); renderAdminCategories();
  } else {
    document.getElementById('adminLoginScreen').style.display='flex';
    document.getElementById('adminShell').style.display='none';
    const pf = document.getElementById('adminPass'); if(pf) pf.value='';
  }
});

/* ---------- Navigation between full-screen views ---------- */
function showAdminView(view){
  document.querySelectorAll('.admin-view').forEach(v=>v.classList.remove('active'));
  const target = document.getElementById('view-'+view);
  if(target) target.classList.add('active');
  document.querySelectorAll('.admin-nav-item[data-view]').forEach(n=>{
    n.classList.toggle('active', n.dataset.view===view);
  });
  if(view==='overview') renderAdminOverview();
  if(view==='products') renderAdminProducts();
  if(view==='orders') renderAdminOrders();
  if(view==='categories') renderAdminCategories();
}

/* ---------- Overview stats ---------- */
function renderAdminOverview(){
  const totalRevenue = ORDERS.reduce((s,o)=>s+parseFloat(o.total||0),0);
  const pending = ORDERS.filter(o=>o.status==='Pending').length;
  document.getElementById('adminStatGrid').innerHTML = `
    <div class="admin-stat-card"><div class="num">${PRODUCTS.length}</div><div class="lbl">Products</div></div>
    <div class="admin-stat-card"><div class="num">${CATEGORIES.length}</div><div class="lbl">Categories</div></div>
    <div class="admin-stat-card"><div class="num">${ORDERS.length}</div><div class="lbl">Total Orders</div></div>
    <div class="admin-stat-card"><div class="num">${pending}</div><div class="lbl">Pending Orders</div></div>
    <div class="admin-stat-card"><div class="num">$${totalRevenue.toFixed(2)}</div><div class="lbl">Total Revenue</div></div>
  `;
}

/* ---------- Image helpers: compress before storing as base64 ---------- */
function compressImageFile(file, maxWidth, callback){
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if(w > maxWidth){ h = Math.round(h * (maxWidth/w)); w = maxWidth; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', 0.78));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* ---------- PRODUCTS ---------- */
function renderAdminProducts(){
  document.getElementById('adminProductList').innerHTML = PRODUCTS.map(p => {
    const hasDisc = p.discountPercent && p.discountPercent > 0;
    const fPrice = effectivePrice(p);
    return `
    <div class="admin-card">
      <div class="admin-card-media">${productMediaHTML(p)}</div>
      <div class="admin-card-body">
        <div class="name">${p.name}</div>
        <div class="sub">${p.cat}</div>
        <div class="price-line">
          ${hasDisc ? `<span class="strike">$${p.price.toFixed(2)}</span>` : ''}$${fPrice.toFixed(2)}
          ${hasDisc ? `<span class="disc-badge">${p.discountPercent}% OFF</span>` : ''}
        </div>
      </div>
      <div class="admin-card-actions">
        <button class="btn-3d ghost sm" style="flex:1;" onclick="openProductForm(${p.id})">Edit</button>
        <button class="btn-3d danger sm" style="flex:1;" onclick="deleteProduct(${p.id})">Delete</button>
      </div>
    </div>
  `;}).join('') || '<p style="color:var(--bark-soft);">No products yet. Click "+ Add Product" to create one.</p>';
}

let currentProductImage = null;
function openProductForm(id){
  const form = document.getElementById('productForm');
  form.reset();
  currentProductImage = null;
  document.getElementById('productImagePreview').style.display='none';
  document.getElementById('productImagePlaceholder').style.display='flex';

  const catSelect = document.getElementById('pfCategory');
  catSelect.innerHTML = CATEGORIES.map(c=>`<option value="${c.name}">${c.label}</option>`).join('');

  if(id){
    const p = PRODUCTS.find(p=>p.id===id);
    document.getElementById('productFormTitle').textContent = 'Edit Product';
    document.getElementById('pfId').value = p.id;
    document.getElementById('pfName').value = p.name;
    catSelect.value = p.cat;
    document.getElementById('pfPrice').value = p.price;
    document.getElementById('pfDiscount').value = p.discountPercent || 0;
    document.getElementById('pfBadge').value = p.badge || '';
    if(p.image){
      currentProductImage = p.image;
      document.getElementById('productImagePreview').src = p.image;
      document.getElementById('productImagePreview').style.display='block';
      document.getElementById('productImagePlaceholder').style.display='none';
    }
  } else {
    document.getElementById('productFormTitle').textContent = 'Add Product';
    document.getElementById('pfId').value = '';
  }
  updateFinalPricePreview();
  showAdminView('product-form');
}
function handleProductImage(e){
  const file = e.target.files[0]; if(!file) return;
  compressImageFile(file, 700, dataUrl => {
    currentProductImage = dataUrl;
    document.getElementById('productImagePreview').src = dataUrl;
    document.getElementById('productImagePreview').style.display='block';
    document.getElementById('productImagePlaceholder').style.display='none';
  });
}
function updateFinalPricePreview(){
  const price = parseFloat(document.getElementById('pfPrice').value) || 0;
  const disc = parseFloat(document.getElementById('pfDiscount').value) || 0;
  const final = +(price * (1 - disc/100)).toFixed(2);
  document.getElementById('pfFinalPricePreview').innerHTML = disc > 0
    ? `Original <s>$${price.toFixed(2)}</s> → Customer pays <strong>$${final.toFixed(2)}</strong> (${disc}% off)`
    : `Customer will pay <strong>$${final.toFixed(2)}</strong>`;
}
function saveProductForm(e){
  e.preventDefault();
  const idVal = document.getElementById('pfId').value;
  const id = idVal ? Number(idVal) : Date.now();
  const cat = document.getElementById('pfCategory').value;
  const catObj = CATEGORIES.find(c=>c.name===cat);
  const product = {
    id,
    name: document.getElementById('pfName').value.trim(),
    cat,
    price: parseFloat(document.getElementById('pfPrice').value) || 0,
    discountPercent: parseFloat(document.getElementById('pfDiscount').value) || 0,
    icon: catObj ? catObj.icon : 'pantry',
    image: currentProductImage,
    badge: document.getElementById('pfBadge').value.trim() || null
  };
  db.ref('products/'+id).set(product).then(()=> showAdminView('products'));
}
function deleteProduct(id){
  if(!confirm('Delete this product? This cannot be undone.')) return;
  db.ref('products/'+id).remove();
}

/* ---------- CATEGORIES ---------- */
function renderAdminCategories(){
  document.getElementById('adminCategoryList').innerHTML = CATEGORIES.map(c => `
    <div class="admin-card">
      <div class="admin-card-media" style="${c.image ? `background:url('${c.image}') center/cover;` : `background:linear-gradient(135deg,${c.color1},${c.color2});`}"></div>
      <div class="admin-card-body">
        <div class="name">${c.label}</div>
        <div class="sub">Key: ${c.name}</div>
      </div>
      <div class="admin-card-actions">
        <button class="btn-3d ghost sm" style="flex:1;" onclick="openCategoryForm('${c.name}')">Edit</button>
        <button class="btn-3d danger sm" style="flex:1;" onclick="deleteCategory('${c.name}')">Delete</button>
      </div>
    </div>
  `).join('') || '<p style="color:var(--bark-soft);">No categories yet.</p>';
}
let currentCategoryImage = null;
function openCategoryForm(name){
  const form = document.getElementById('categoryForm');
  form.reset();
  currentCategoryImage = null;
  document.getElementById('categoryImagePreview').style.display='none';
  document.getElementById('categoryImagePlaceholder').style.display='flex';

  if(name){
    const c = CATEGORIES.find(c=>c.name===name);
    document.getElementById('categoryFormTitle').textContent = 'Edit Category';
    document.getElementById('cfOriginalName').value = c.name;
    document.getElementById('cfName').value = c.name;
    document.getElementById('cfLabel').value = c.label;
    if(c.image){
      currentCategoryImage = c.image;
      document.getElementById('categoryImagePreview').src = c.image;
      document.getElementById('categoryImagePreview').style.display='block';
      document.getElementById('categoryImagePlaceholder').style.display='none';
    }
  } else {
    document.getElementById('categoryFormTitle').textContent = 'Add Category';
    document.getElementById('cfOriginalName').value = '';
  }
  showAdminView('category-form');
}
function handleCategoryImage(e){
  const file = e.target.files[0]; if(!file) return;
  compressImageFile(file, 900, dataUrl => {
    currentCategoryImage = dataUrl;
    document.getElementById('categoryImagePreview').src = dataUrl;
    document.getElementById('categoryImagePreview').style.display='block';
    document.getElementById('categoryImagePlaceholder').style.display='none';
  });
}
function saveCategoryForm(e){
  e.preventDefault();
  const originalName = document.getElementById('cfOriginalName').value;
  const name = document.getElementById('cfName').value.trim().replace(/[.#$\[\]\/]/g, '');
  const label = document.getElementById('cfLabel').value.trim();
  const existing = CATEGORIES.find(c=>c.name===originalName);
  const category = {
    name, label,
    icon: existing ? existing.icon : 'pantry',
    image: currentCategoryImage,
    color1: existing ? existing.color1 : '#3a2a1c',
    color2: existing ? existing.color2 : '#22160e'
  };
  const writeOps = [];
  if(originalName && originalName !== name){
    writeOps.push(db.ref('categories/'+originalName).remove());
  }
  writeOps.push(db.ref('categories/'+name).set(category));
  Promise.all(writeOps).then(()=> showAdminView('categories'));
}
function deleteCategory(name){
  if(!confirm('Delete this category?')) return;
  db.ref('categories/'+name).remove();
}

/* ---------- ORDERS ---------- */
function renderAdminOrders(){
  const tabsEl = document.getElementById('orderFilterTabs');
  const statuses = ['All','Pending','Confirmed','Shipped','Delivered','Cancelled'];
  tabsEl.innerHTML = statuses.map(s => `<button class="order-filter-tab ${s===adminOrderFilter?'active':''}" onclick="setAdminOrderFilter('${s}')">${s}${s!=='All' ? ' ('+ORDERS.filter(o=>o.status===s).length+')' : ''}</button>`).join('');

  const wrap = document.getElementById('adminOrderList');
  const list = adminOrderFilter==='All' ? ORDERS : ORDERS.filter(o=>o.status===adminOrderFilter);
  if(list.length===0){ wrap.innerHTML = '<p style="color:var(--bark-soft);">No orders in this filter.</p>'; return; }
  wrap.innerHTML = list.map((o,idx) => `
    <div class="admin-order-card">
      <div class="admin-order-top" onclick="toggleOrderDetail(${idx})">
        <div>
          <div class="oid">${o.id} — ${o.name}</div>
          <div class="osub">${o.date} · $${o.total} · ${o.district}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="status-tag">${o.status}</span>
          <a href="tel:${o.phone}" onclick="event.stopPropagation()" class="icon-action">☎</a>
        </div>
      </div>
      <div class="admin-order-detail" id="orderDetail-${idx}">
        <strong>Items:</strong> ${o.items.map(i=>`${i.name} ×${i.qty}`).join(', ')}<br>
        <strong>Phone:</strong> ${o.phone}<br>
        <strong>Address:</strong> ${o.address}, ${o.upazila}, ${o.district}<br>
        <strong>Status:</strong>
        <select onchange="updateOrderStatus('${o._key}', this.value)" style="margin-left:6px;padding:6px 10px;border-radius:8px;border:1px solid var(--line);">
          ${['Pending','Confirmed','Shipped','Delivered','Cancelled'].map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
  `).join('');
}
function setAdminOrderFilter(status){
  adminOrderFilter = status;
  renderAdminOrders();
}
function toggleOrderDetail(idx){
  const el = document.getElementById('orderDetail-'+idx);
  el.classList.toggle('open');
}
function updateOrderStatus(key, status){
  db.ref('orders/'+key).update({status});
}
