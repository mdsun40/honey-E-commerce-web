/* ============================================================
   CHECKOUT & ORDERS — delivery form, WhatsApp notification
   ============================================================ */
const OWNER_WHATSAPP = "8801700000000"; // <-- replace with your real WhatsApp business number

function buildOrderMessage(order){
  const lines = order.items.map(i => `• ${i.name} ×${i.qty} — $${(i.price*i.qty).toFixed(2)}`).join('\n');
  return `🌿 *New Order — Naturals Organic*\n\n` +
    `*Order ID:* ${order.id}\n` +
    `*Date:* ${order.date}\n\n` +
    `*Customer:* ${order.name}\n` +
    `*Phone:* ${order.phone}\n` +
    `*Address:* ${order.address}, ${order.upazila}, ${order.district}\n\n` +
    `*Items:*\n${lines}\n\n` +
    `*Total:* $${order.total} (COD)`;
}

let lastOrderForWA = null;

function submitOrder(e){
  e.preventDefault();
  const subtotal = CART.reduce((s,c)=>{ const p = PRODUCTS.find(p=>p.id===c.id); return s + (p ? effectivePrice(p)*c.qty : 0); },0);
  const order = {
    id: 'NO' + Date.now().toString().slice(-8),
    date: new Date().toLocaleDateString(),
    createdAt: Date.now(),
    name: document.getElementById('ckName').value,
    phone: document.getElementById('ckPhone').value,
    district: document.getElementById('ckDistrict').value,
    upazila: document.getElementById('ckUpazila').value,
    address: document.getElementById('ckAddress').value,
    items: CART.map(c=>{ const p=PRODUCTS.find(p=>p.id===c.id); return {name:p?p.name:'—', qty:c.qty, price:p?effectivePrice(p):0}; }),
    total: (subtotal+3.5).toFixed(2),
    status: 'Pending'
  };
  db.ref('orders').push(order);
  CART = [];
  saveCartWishlist(); updateCartCount();
  document.getElementById('confirmOrderId').textContent = 'Order ID: ' + order.id;
  lastOrderForWA = order;
  showCartStep('success');
  document.getElementById('checkoutForm').reset();

  // Auto-notify owner via WhatsApp so the order reaches you regardless of the customer's device
  const msg = encodeURIComponent(buildOrderMessage(order));
  window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${msg}`, '_blank');
}

function resendOrderWhatsApp(){
  if(!lastOrderForWA) return;
  const msg = encodeURIComponent(buildOrderMessage(lastOrderForWA));
  window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${msg}`, '_blank');
}
