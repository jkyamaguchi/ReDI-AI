// Cart + catalog controller (refactored)

(function () {
  const STORAGE_KEY = "cart:v1";

  // Catalog (extend as needed)
  const CATALOG = {
    wines: [
      { id: "wine-1", name: "Cabernet Reserva", price: 29.9 },
      { id: "wine-2", name: "Pinot Noir Estate", price: 34.0 },
      { id: "wine-3", name: "Chardonnay Classic", price: 22.5 },
      { id: "wine-4", name: "Sauvignon Blanc", price: 18.75 },
      { id: "wine-5", name: "Rosé Provence", price: 19.9 },
      { id: "wine-6", name: "Malbec Premium", price: 27.4 },
    ],
    fish: [
      { id: "fish-1", name: "Salmon Fillet", price: 12.5 },
      { id: "fish-2", name: "Tuna Steak", price: 15.0 },
      { id: "fish-3", name: "Cod Loin", price: 10.25 },
      { id: "fish-4", name: "Shrimp Pack", price: 8.75 },
      { id: "fish-5", name: "Sea Bass", price: 18.4 },
      { id: "fish-6", name: "Scallops", price: 22.3 },
    ],
    meat: [
      { id: "meat-1", name: "Ribeye Steak", price: 14.5 },
      { id: "meat-2", name: "Chicken Breast", price: 6.9 },
      { id: "meat-3", name: "Pork Chops", price: 7.8 },
      { id: "meat-4", name: "Lamb Chops", price: 16.2 },
      { id: "meat-5", name: "Ground Beef", price: 5.4 },
      { id: "meat-6", name: "Turkey Slices", price: 4.6 },
    ],
    fruits: [
      { id: "fruit-1", name: "Apples (6-pack)", price: 3.6 },
      { id: "fruit-2", name: "Bananas (1kg)", price: 2.4 },
      { id: "fruit-3", name: "Oranges (6-pack)", price: 3.9 },
      { id: "fruit-4", name: "Grapes (500g)", price: 3.2 },
      { id: "fruit-5", name: "Strawberries (250g)", price: 4.1 },
      { id: "fruit-6", name: "Mango (each)", price: 2.2 },
    ],
    gold: [
      { id: "gold-1", name: "Gold Bar 1oz", price: 2350.0 },
      { id: "gold-2", name: "Gold Bar 10g", price: 760.0 },
      { id: "gold-3", name: "Gold Coin 1oz", price: 2375.0 },
      { id: "gold-4", name: "Gold Coin 1/2oz", price: 1205.0 },
      { id: "gold-5", name: "Gold Pendant", price: 450.0 },
      { id: "gold-6", name: "Gold Ring", price: 520.0 },
    ],
    sweets: [
      { id: "sweet-1", name: "Chocolate Truffles", price: 6.5 },
      { id: "sweet-2", name: "Vanilla Cupcakes", price: 4.2 },
      { id: "sweet-3", name: "Caramel Toffee", price: 3.75 },
      { id: "sweet-4", name: "Macarons Assortment", price: 9.9 },
      { id: "sweet-5", name: "Gummy Bears", price: 2.8 },
      { id: "sweet-6", name: "Dark Chocolate Bar", price: 3.5 },
    ],
    // add other categories later (meat, fruits, sweets, gold)
  };

  // --- Cart persistence ---
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
    renderCartModal(); // keep modal synced
  }

  function findProduct(category, id) {
    const list = CATALOG[category] || [];
    return list.find((p) => p.id === id);
  }

  // --- Public cart ops ---
  function addToCart(category, id) {
    const product = findProduct(category, id);
    if (!product) return;
    const cart = loadCart();
    // Match both id and category to avoid merging same ids from different categories
    const item = cart.find((i) => i.id === id && i.category === category);
    if (item) {
      item.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        category: category,
        qty: 1,
      });
    }
    saveCart(cart);
  }

  function removeFromCart(id) {
    const cart = loadCart().filter((i) => i.id !== id);
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
  }

  function updateCartCount() {
    const el = document.getElementById("cartCount");
    if (!el) return;
    const total = loadCart().reduce((s, i) => s + i.qty, 0);
    el.textContent = total;
  }

  // --- Modal rendering & controls ---
  function renderCartModal() {
    const wrap = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");
    const barEl = document.getElementById("cartBar");
    if (!wrap || !totalEl) return;
    const cart = loadCart();
    if (!cart.length) {
      wrap.innerHTML =
        '<div style="text-align:center;color:#666;padding:16px;">Cart is empty.</div>';
      totalEl.textContent = "";
      if (barEl) barEl.textContent = "Categories: none";
      return;
    }
    // Group by category for clearer multi-category cart
    const byCategory = cart.reduce((acc, item) => {
      const cat = item.category || "other";
      (acc[cat] = acc[cat] || []).push(item);
      return acc;
    }, {});
    let total = 0;
    let html = "";
    Object.keys(byCategory)
      .sort()
      .forEach((cat) => {
        html += `<div style="margin:8px 0 4px;font-weight:bold;font-size:12px;color:#243447;text-transform:uppercase;">${cat}</div>`;
        byCategory[cat].forEach((item) => {
          total += item.price * item.qty;
          html += `
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;padding:6px 0;font-size:13px;" data-id="${
          item.id
        }">
          <div style="flex:1 1 auto;">
            ${item.name}<br><small>$${item.price.toFixed(2)} each</small>
          </div>
          <div style="display:flex;align-items:center;gap:4px;">
            <button class="qty-btn" data-act="dec" data-id="${
              item.id
            }" style="background:#0078d4;color:#fff;border:0;padding:2px 6px;border-radius:4px;cursor:pointer;">−</button>
            <span style="min-width:20px;text-align:center;font-weight:bold;">${
              item.qty
            }</span>
            <button class="qty-btn" data-act="inc" data-id="${
              item.id
            }" style="background:#0078d4;color:#fff;border:0;padding:2px 6px;border-radius:4px;cursor:pointer;">+</button>
            <button class="remove-btn" data-act="remove" data-id="${
              item.id
            }" style="background:#e0e0e0;border:0;padding:2px 6px;border-radius:4px;cursor:pointer;">x</button>
          </div>
        </div>`;
        });
      });
    // Add category summary header so users know multiple categories are present
    const summary = Object.keys(byCategory)
      .sort()
      .map((c) => `${c}(${byCategory[c].reduce((s, i) => s + i.qty, 0)})`)
      .join(" • ");

    // Non-sticky summary bar placed at the top of the modal content
    wrap.innerHTML =
      `<div style="background:#f7f9fa;padding:6px 10px;margin:0 0 8px 0;border-bottom:1px solid #ddd;font-size:12px;color:#243447;">Categories: ${summary}</div>` +
      html;
    totalEl.textContent = "Total: $" + total.toFixed(2);
  }

  function openCart() {
    const overlay = document.getElementById("cartOverlay");
    if (!overlay) return;
    renderCartModal();
    overlay.style.display = "flex";
  }

  function closeCart() {
    const overlay = document.getElementById("cartOverlay");
    if (overlay) overlay.style.display = "none";
  }

  // Optional: dynamic renderer (unused by static wine.html but available)
  function renderCategory(category, targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const items = CATALOG[category] || [];
    target.innerHTML = items
      .map(
        (p) => `
      <div class="card">
        <h3>${p.name}</h3>
        <div class="price">$${p.price.toFixed(2)}</div>
        <button data-category="${category}" data-id="${
          p.id
        }">Add to Cart</button>
      </div>
    `
      )
      .join("");
  }

  // Event delegation: add buttons + cart modal controls
  document.addEventListener("click", (e) => {
    // Add to cart button
    const addBtn = e.target.closest("button[data-id][data-category]");
    if (addBtn) {
      addToCart(
        addBtn.getAttribute("data-category"),
        addBtn.getAttribute("data-id")
      );
      addBtn.textContent = "Added ✓";
      setTimeout(() => {
        addBtn.textContent = "Add to Cart";
      }, 900);
      return;
    }

    const act = e.target.getAttribute("data-act");
    const id = e.target.getAttribute("data-id");
    if (act === "inc") {
      const cart = loadCart();
      const item = cart.find((i) => i.id === id);
      if (item) {
        item.qty += 1;
        saveCart(cart);
      }
      return;
    }
    if (act === "dec") {
      const cart = loadCart();
      const item = cart.find((i) => i.id === id);
      if (item) {
        item.qty -= 1;
        if (item.qty <= 0) cart.splice(cart.indexOf(item), 1);
        saveCart(cart);
      }
      return;
    }
    if (act === "remove") {
      removeFromCart(id);
      return;
    }

    // Open cart
    if (e.target.id === "openCartBtn") {
      openCart();
      return;
    }
    // Close cart
    if (e.target.id === "closeCart") {
      closeCart();
      return;
    }
    if (e.target.id === "clearCart") {
      clearCart();
      return;
    }
    // Click outside overlay
    if (
      e.target.id === "cartOverlay" &&
      e.target === document.getElementById("cartOverlay")
    ) {
      closeCart();
      return;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });

  // Init
  document.addEventListener("DOMContentLoaded", () => {
    if (window.cartAPI) {
      window.cartAPI.updateCartCount();
    } else {
      updateCartCount();
    }
  });

  window.cartAPI = {
    add: addToCart,
    remove: removeFromCart,
    clear: clearCart,
    get: loadCart,
    updateCartCount,
    renderCartModal,
    openCart,
    closeCart,
  };
})();
