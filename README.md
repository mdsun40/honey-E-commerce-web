# Naturals Organic — Project Structure

Static single-page e-commerce site, no build tools required. Open `index.html`
directly in a browser or deploy the whole folder to GitHub Pages.

```
naturals-organic/
├── index.html              # Page structure/markup only
├── css/
│   └── style.css           # All styling
├── js/                      # Load order matters — each file uses globals
│   ├── firebase-config.js  #   1. Firebase init (db, auth)
│   ├── data.js              #   2. Constants, default catalog, shared state, helpers
│   ├── products.js          #   3. Category/product rendering, filters, search, wishlist
│   ├── cart.js               #   4. Cart logic + full-screen cart page
│   ├── checkout.js           #   5. Delivery form, order submit, WhatsApp notify
│   ├── modals.js             #   6. Generic modal open/close, search bar, dev page
│   ├── admin.js               #   7. Full-screen admin dashboard (products/orders/categories)
│   └── main.js                #   8. Runs init calls once everything above is loaded
└── assets/
    └── images/
        ├── hero-banner.jpg
        ├── story-honey.jpg
        └── developer-photo.jpg
```

## Notes
- No bundler/npm needed — scripts are plain `<script src="...">` tags in order.
- All product/category/order data lives in Firebase Realtime Database
  (see `js/firebase-config.js` for the project config).
- Cart/Wishlist are stored in the browser's `localStorage` (per device).
- To deploy: upload this entire folder to a GitHub repo and enable GitHub Pages.
