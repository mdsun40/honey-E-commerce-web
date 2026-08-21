/* ============================================================
   DATA — constants, default catalog, shared state, helpers
   ============================================================ */
const BD_DISTRICTS = ["Bagerhat","Bandarban","Barguna","Barisal","Bhola","Bogura","Brahmanbaria","Chandpur","Chapainawabganj","Chattogram","Chuadanga","Cox's Bazar","Cumilla","Dhaka","Dinajpur","Faridpur","Feni","Gaibandha","Gazipur","Gopalganj","Habiganj","Jamalpur","Jashore","Jhalokati","Jhenaidah","Joypurhat","Khagrachari","Khulna","Kishoreganj","Kurigram","Kushtia","Lakshmipur","Lalmonirhat","Madaripur","Magura","Manikganj","Meherpur","Moulvibazar","Munshiganj","Mymensingh","Naogaon","Narail","Narayanganj","Narsingdi","Natore","Netrokona","Nilphamari","Noakhali","Pabna","Panchagarh","Patuakhali","Pirojpur","Rajbari","Rajshahi","Rangamati","Rangpur","Satkhira","Shariatpur","Sherpur","Sirajganj","Sunamganj","Sylhet","Tangail","Thakurgaon"];

const ICONS = {
  honey: `<svg viewBox="0 0 100 100"><rect x="20" y="30" width="60" height="55" rx="10" fill="#e8ac41"/><rect x="15" y="18" width="70" height="14" rx="6" fill="#8a6a3a"/><ellipse cx="50" cy="45" rx="28" ry="6" fill="#f4d38e" opacity="0.6"/><rect x="20" y="30" width="60" height="55" rx="10" fill="none" stroke="#b6791f" stroke-width="2"/></svg>`,
  nuts: `<svg viewBox="0 0 100 100"><circle cx="35" cy="55" r="17" fill="#a9773f"/><circle cx="60" cy="42" r="14" fill="#c08c50"/><circle cx="65" cy="68" r="13" fill="#8a6033"/><circle cx="42" cy="30" r="10" fill="#c9a06a"/></svg>`,
  oil: `<svg viewBox="0 0 100 100"><path d="M40 15h20v15l10 10v45a5 5 0 01-5 5H35a5 5 0 01-5-5V40l10-10z" fill="#c9d16b"/><rect x="38" y="12" width="24" height="10" rx="3" fill="#3a2a1c"/><path d="M40 15h20v15l10 10v45a5 5 0 01-5 5H35a5 5 0 01-5-5V40l10-10z" fill="none" stroke="#9aa84a" stroke-width="2"/></svg>`,
  pantry: `<svg viewBox="0 0 100 100"><rect x="25" y="25" width="50" height="60" rx="6" fill="#e3d3ab"/><rect x="30" y="15" width="40" height="14" rx="4" fill="#6b5642"/><rect x="34" y="42" width="32" height="20" rx="3" fill="#8a6a3a" opacity="0.4"/></svg>`
};

const DEFAULT_PRODUCTS = [
  {id:1, name:"Wildflower Honey", cat:"Honey", price:15, discountPercent:0, icon:"honey", image:null, badge:"Bestseller"},
  {id:2, name:"Sundarbans Raw Honey", cat:"Honey", price:26, discountPercent:15, icon:"honey", image:null, badge:"Limited"},
  {id:3, name:"Mustard Flower Honey", cat:"Honey", price:18, discountPercent:0, icon:"honey", image:null, badge:null},
  {id:4, name:"Mixed Organic Nuts", cat:"Nuts", price:18, discountPercent:0, icon:"nuts", image:null, badge:"New"},
  {id:5, name:"Roasted Cashew Nuts", cat:"Nuts", price:24, discountPercent:0, icon:"nuts", image:null, badge:null},
  {id:6, name:"Premium Almonds", cat:"Nuts", price:23, discountPercent:13, icon:"nuts", image:null, badge:"Sale"},
  {id:7, name:"Cold-Pressed Coconut Oil", cat:"Oils", price:25, discountPercent:0, icon:"oil", image:null, badge:"New"},
  {id:8, name:"Artisan Olive Oil", cat:"Oils", price:18, discountPercent:0, icon:"oil", image:null, badge:null},
  {id:9, name:"Black Seed Oil", cat:"Oils", price:16, discountPercent:0, icon:"oil", image:null, badge:null},
  {id:10, name:"Organic Rice Bran Oil", cat:"Pantry", price:14, discountPercent:0, icon:"pantry", image:null, badge:null},
  {id:11, name:"Sun-Dried Dates", cat:"Pantry", price:12, discountPercent:0, icon:"pantry", image:null, badge:"Bestseller"},
  {id:12, name:"Organic Turmeric Powder", cat:"Pantry", price:9, discountPercent:11, icon:"pantry", image:null, badge:"Sale"},
];

const DEFAULT_CATEGORIES = [
  {name:"Honey", label:"Golden Honey", icon:"honey", image:null, color1:"#1c3529", color2:"#12241d"},
  {name:"Nuts", label:"Crunchy Nuts", icon:"nuts", image:null, color1:"#3a2a1c", color2:"#22160e"},
  {name:"Oils", label:"Pure Oils", icon:"oil", image:null, color1:"#2d5138", color2:"#1c3529"},
  {name:"Pantry", label:"Pantry Staples", icon:"pantry", image:null, color1:"#4a3524", color2:"#2c1f14"},
];

let PRODUCTS = [];
let CATEGORIES = [];
let ORDERS = [];
let CART = JSON.parse(localStorage.getItem('no_cart') || '[]');
let WISHLIST = JSON.parse(localStorage.getItem('no_wishlist') || '[]');
let activeFilter = 'All';
let adminOrderFilter = 'All';

function effectivePrice(p){
  if(p.discountPercent && p.discountPercent > 0){
    return +(p.price * (1 - p.discountPercent/100)).toFixed(2);
  }
  return p.price;
}
function categoryIconFor(catName){
  const c = CATEGORIES.find(c=>c.name===catName);
  return c ? c.icon : 'pantry';
}
function productMediaHTML(p, sizeClass){
  if(p.image) return `<img src="${p.image}" alt="${p.name}">`;
  return ICONS[p.icon] || ICONS.pantry;
}

function saveCartWishlist(){
  localStorage.setItem('no_cart', JSON.stringify(CART));
  localStorage.setItem('no_wishlist', JSON.stringify(WISHLIST));
}

/* One-time seed: if the database is empty, populate it with default catalog */
db.ref('products').once('value').then(snap => {
  if(!snap.exists()){
    const seed = {};
    DEFAULT_PRODUCTS.forEach(p => seed[p.id] = p);
    db.ref('products').set(seed);
  }
});
db.ref('categories').once('value').then(snap => {
  if(!snap.exists()){
    const seed = {};
    DEFAULT_CATEGORIES.forEach(c => seed[c.name] = c);
    db.ref('categories').set(seed);
  }
});

/* Realtime listeners — every device (customer or admin) stays in sync automatically */
db.ref('products').on('value', snap => {
  const val = snap.val() || {};
  PRODUCTS = Object.keys(val).map(k => val[k]);
  renderProducts();
  if(isAdmin) renderAdminProducts();
});
db.ref('categories').on('value', snap => {
  const val = snap.val() || {};
  CATEGORIES = Object.keys(val).map(k => val[k]);
  renderCategories(); renderFilterTabs(); renderProducts();
  if(isAdmin) renderAdminCategories();
});
db.ref('orders').on('value', snap => {
  const val = snap.val() || {};
  ORDERS = Object.keys(val).map(k => ({...val[k], _key:k})).sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
  if(isAdmin) renderAdminOrders();
});
