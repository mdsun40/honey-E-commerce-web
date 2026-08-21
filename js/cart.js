/* ============================================================
   CART — add/remove/update items, full-screen cart page
   ============================================================ */
function addToCart(id, qty=1, size='Standard'){
  const existing = CART.find(c=>c.id===id && c.size===size);
  if(existing) existing.qty += qty;
  else CART.push({id, qty, size});
  saveCartWishlist(); updateCartCount();
}
function buyNow(id){ addToCart(id); openCartFull(); }
function updateCartCount(){
  const count = CART.reduce((s,c)=>s+c.qty,0);
  document.getElementById('cartCount').textContent = count;
}
function changeQty(idx, delta){
  CART[idx].qty += delta;
  if(CART[idx].qty <= 0) CART.splice(idx,1);
  saveCartWishlist(); renderCart(); updateCartCount();
}
function removeFromCart(idx){ CART.splice(idx,1); saveCartWishlist(); renderCart(); updateCartCount(); }

function renderCart(){
  const wrap = document.getElementById('cartItemsWrap');
  const countEl = document.getElementById('cartFullCount');
  if(CART.length===0){
    wrap.innerHTML = `<div class="cart-empty">Your cart is empty.<br>Start adding something delicious 🍯</div>`;
    document.getElementById('cartSummaryWrap').innerHTML = '';
    document.getElementById('cartSummaryWrap2').innerHTML = '';
    if(countEl) countEl.textContent = '(0 items)';
    return;
  }
  let subtotal = 0;
  let totalQty = 0;
  wrap.innerHTML = CART.map((c, idx) => {
    const p = PRODUCTS.find(p=>p.id===c.id);
    if(!p) return '';
    const unitPrice = effectivePrice(p);
    const lineTotal = unitPrice * c.qty;
    subtotal += lineTotal;
    totalQty += c.qty;
    return `
      <div class="cart-item">
        <div class="thumb">${productMediaHTML(p)}</div>
        <div class="info">
          <h5>${p.name}</h5>
          <div class="meta">${c.size} · $${unitPrice.toFixed(2)} each</div>
          <div class="qty-control">
            <button onclick="changeQty(${idx},-1)">−</button>
            <span>${c.qty}</span>
            <button onclick="changeQty(${idx},1)">+</button>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:600;">$${lineTotal.toFixed(2)}</div>
          <button class="remove-btn" onclick="removeFromCart(${idx})">Remove</button>
        </div>
      </div>
    `;
  }).join('');
  if(countEl) countEl.textContent = `(${totalQty} item${totalQty!==1?'s':''})`;
  const shipping = subtotal > 0 ? 3.5 : 0;
  const summaryHTML = `
    <div class="cart-summary">
      <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
      <div class="summary-row"><span>Delivery</span><span>$${shipping.toFixed(2)}</span></div>
      <div class="summary-row total"><span>Total</span><span>$${(subtotal+shipping).toFixed(2)}</span></div>
    </div>
  `;
  document.getElementById('cartSummaryWrap').innerHTML = summaryHTML + `<button class="btn-3d full-w" onclick="showCartStep('checkout')">Proceed to Checkout</button>`;
  document.getElementById('cartSummaryWrap2').innerHTML = summaryHTML;
}

/* ============================================================
   FULL-SCREEN CART / ORDER PAGE — navigation
   ============================================================ */
function openCartFull(){
  renderCart();
  showCartStep('items');
  document.getElementById('cartFull').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeCartFull(){
  document.getElementById('cartFull').classList.remove('open');
  document.body.style.overflow='';
}
function showCartStep(step){
  document.getElementById('cartStepItems').style.display = step==='items' ? 'grid' : 'none';
  document.getElementById('cartStepCheckout').style.display = step==='checkout' ? 'grid' : 'none';
  document.getElementById('cartStepSuccess').style.display = step==='success' ? 'block' : 'none';
  document.getElementById('cartFull').scrollTop = 0;
  if(step==='checkout') renderCart();
}
function openDevFull(){
  document.getElementById('devFull').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeDevFull(){
  document.getElementById('devFull').classList.remove('open');
  document.body.style.overflow='';
}
