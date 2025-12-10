/**
 * Cart & Catalog Controller
 * Manages shopping cart operations, catalog rendering, and user interactions
 */

(function () {
  // CONSTANTS
  const STORAGE_KEY = "cart:v1";
  const ADD_TO_CART_FEEDBACK_DURATION = 900; // ms

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
      { id: "gold-1", name: "Infinity Necklace", price: 2350.0 },
      { id: "gold-2", name: "Hoop Earrings", price: 760.0 },
      { id: "gold-3", name: "Bracelet", price: 2375.0 },
      { id: "gold-4", name: "Coin Pendant", price: 1205.0 },
      { id: "gold-5", name: "Rainbow Ring", price: 450.0 },
      { id: "gold-6", name: "Pocket watch", price: 520.0 },
    ],
    sweets: [
      { id: "sweet-1", name: "Chocolate Truffles", price: 6.5 },
      { id: "sweet-2", name: "Vanilla Cupcakes", price: 4.2 },
      { id: "sweet-3", name: "Caramel Toffee", price: 3.75 },
      { id: "sweet-4", name: "Macarons Assortment", price: 9.9 },
      { id: "sweet-5", name: "Gummy Bears", price: 2.8 },
      { id: "sweet-6", name: "Dark Chocolate Bar", price: 3.5 },
    ],
  };

  // STORAGE OPERATIONS
  /**
   * Load cart from localStorage
   * @returns {Array} Cart items array
   */
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  /**
   * Save cart to localStorage and sync UI
   * @param {Array} cart - Cart items array
   */
  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
    renderCartModal();
  }

  // CATALOG OPERATIONS
  /**
   * Find product by category and ID
   * @param {string} category - Product category
   * @param {string} id - Product ID
   * @returns {Object|undefined} Product object or undefined
   */
  function findProduct(category, id) {
    const items = CATALOG[category];
    return items ? items.find((p) => p.id === id) : undefined;
  }

  // CART OPERATIONS
  /**
   * Add product to cart or increment quantity if already exists
   * @param {string} category - Product category
   * @param {string} id - Product ID
   */
  function addToCart(category, id) {
    const product = findProduct(category, id);
    if (!product) return;

    const cart = loadCart();
    const existingItem = cart.find(
      (item) => item.id === id && item.category === category
    );

    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        category,
        qty: 1,
      });
    }

    saveCart(cart);
  }

  /**
   * Remove item from cart by ID
   * @param {string} id - Product ID to remove
   */
  function removeFromCart(id) {
    saveCart(loadCart().filter((item) => item.id !== id));
  }

  /**
   * Clear all items from cart
   */
  function clearCart() {
    saveCart([]);
  }

  // UI UPDATE OPERATIONS
  /**
   * Update cart count badge in header
   */
  function updateCartCount() {
    const badge = document.getElementById("cartCount");
    if (!badge) return;

    const totalItems = loadCart().reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = totalItems;
  }

  // DOM CREATION HELPERS
  /**
   * Create a cart item DOM element
   * @param {Object} item - Cart item object
   * @returns {HTMLElement} List item element
   */
  function createCartItem(item) {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.dataset.id = item.id;

    // Item info section
    const info = document.createElement("div");
    info.className = "cart-item__info";

    const nameSpan = document.createElement("span");
    nameSpan.className = "cart-item__name";
    nameSpan.textContent = item.name;

    const priceSpan = document.createElement("span");
    priceSpan.className = "cart-item__unit-price";
    priceSpan.textContent = `$${item.price.toFixed(2)} each`;

    info.appendChild(nameSpan);
    info.appendChild(priceSpan);
    li.appendChild(info);

    // Quantity controls section
    const controls = document.createElement("div");
    controls.className = "cart-item__controls";

    // Helper function to create control button
    const createButton = (className, action, label, text) => {
      const btn = document.createElement("button");
      btn.className = className;
      btn.dataset.act = action;
      btn.dataset.id = item.id;
      btn.setAttribute("aria-label", label);
      btn.textContent = text;
      return btn;
    };

    controls.appendChild(
      createButton("qty-btn", "dec", "Decrease quantity", "−")
    );

    const qtyOutput = document.createElement("output");
    qtyOutput.className = "qty";
    qtyOutput.setAttribute("aria-live", "polite");
    qtyOutput.textContent = item.qty;
    controls.appendChild(qtyOutput);

    controls.appendChild(
      createButton("qty-btn", "inc", "Increase quantity", "+")
    );
    controls.appendChild(
      createButton("btn-remove", "remove", `Remove ${item.name}`, "Remove")
    );

    li.appendChild(controls);
    return li;
  }

  /**
   * Create a category group section for cart modal
   * @param {string} category - Category name
   * @param {Array} items - Items in this category
   * @returns {HTMLElement} Section element
   */
  function createCategoryGroup(category, items) {
    const section = document.createElement("section");
    section.className = "cart-group";
    section.setAttribute("aria-labelledby", `cat-${category}`);

    const h3 = document.createElement("h3");
    h3.className = "cart-group__title";
    h3.id = `cat-${category}`;
    h3.textContent = category;
    section.appendChild(h3);

    const ul = document.createElement("ul");
    ul.className = "cart-list";
    items.forEach((item) => ul.appendChild(createCartItem(item)));
    section.appendChild(ul);

    return section;
  }

  /**
   * Group cart items by category
   * @param {Array} cart - Cart items array
   * @returns {Object} Object with categories as keys and item arrays as values
   */
  function groupCartByCategory(cart) {
    return cart.reduce((grouped, item) => {
      const category = item.category || "other";
      (grouped[category] = grouped[category] || []).push(item);
      return grouped;
    }, {});
  }

  /**
   * Calculate total cart value
   * @param {Array} cart - Cart items array
   * @returns {number} Total price
   */
  function calculateCartTotal(cart) {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  /**
   * Create summary string of categories and quantities
   * @param {Object} byCategory - Grouped cart items
   * @returns {string} Summary string (e.g., "wines(3) • fish(2)")
   */
  function createCategorySummary(byCategory) {
    return Object.keys(byCategory)
      .sort()
      .map((cat) => {
        const qty = byCategory[cat].reduce((sum, item) => sum + item.qty, 0);
        return `${cat}(${qty})`;
      })
      .join(" • ");
  }

   // CART MODAL RENDERING
   /**
   * Render cart modal content with all items and total
   */
  function renderCartModal() {
    const wrap = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");
    const barEl = document.getElementById("cartBar");
    if (!wrap || !totalEl) return;

    const cart = loadCart();

    // Handle empty cart
    if (!cart.length) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "empty";
      emptyDiv.textContent = "Cart is empty.";
      wrap.replaceChildren(emptyDiv);
      totalEl.textContent = "";
      if (barEl) barEl.textContent = "Categories: none";
      return;
    }

    // Calculate cart data
    const byCategory = groupCartByCategory(cart);
    const total = calculateCartTotal(cart);
    const summary = createCategorySummary(byCategory);

    // Build DOM fragment
    const fragment = document.createDocumentFragment();

    // Add category summary
    if (barEl) {
      barEl.textContent = `Categories: ${summary}`;
    } else {
      const summaryDiv = document.createElement("div");
      summaryDiv.className = "cart-summary";
      summaryDiv.textContent = `Categories: ${summary}`;
      fragment.appendChild(summaryDiv);
    }

    // Add category groups (sorted alphabetically)
    Object.keys(byCategory)
      .sort()
      .forEach((category) => {
        fragment.appendChild(
          createCategoryGroup(category, byCategory[category])
        );
      });

    // Update DOM
    wrap.replaceChildren(fragment);
    totalEl.textContent = `Total: $${total.toFixed(2)}`;
  }

  /**
   * Open cart modal overlay
   */
  function openCart() {
    const overlay = document.getElementById("cartOverlay");
    if (!overlay) return;
    renderCartModal();
    overlay.style.display = "flex";
  }

  /**
   * Close cart modal overlay
   */
  function closeCart() {
    const overlay = document.getElementById("cartOverlay");
    if (overlay) overlay.style.display = "none";
  }

  // PRODUCT CATALOG RENDERING
  /**
   * Create a product card DOM element
   * @param {Object} product - Product object
   * @param {string} category - Product category
   * @returns {HTMLElement} Product card div
   */
  function createProductCard(product, category) {
    const card = document.createElement("div");
    card.className = "card";

    const h3 = document.createElement("h3");
    h3.textContent = product.name;
    card.appendChild(h3);

    const priceDiv = document.createElement("div");
    priceDiv.className = "price";
    priceDiv.textContent = `$${product.price.toFixed(2)}`;
    card.appendChild(priceDiv);

    const button = document.createElement("button");
    button.dataset.category = category;
    button.dataset.id = product.id;
    button.textContent = "Add to Cart";
    card.appendChild(button);

    return card;
  }

  /**
   * Render all products for a category into target element
   * @param {string} category - Category name
   * @param {string} targetId - Target DOM element ID
   */
  function renderCategory(category, targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const items = CATALOG[category] || [];

    const fragment = document.createDocumentFragment();
    items.forEach((product) => {
      fragment.appendChild(createProductCard(product, category));
    });

    target.replaceChildren(fragment);
  }

  // EVENT HANDLERS
  /**
   * Handle add to cart button click with feedback
   * @param {HTMLElement} button - Add to cart button element
   */
  function handleAddToCart(button) {
    const category = button.getAttribute("data-category");
    const id = button.getAttribute("data-id");

    addToCart(category, id);

    button.textContent = "Added ✓";
    setTimeout(() => {
      button.textContent = "Add to Cart";
    }, ADD_TO_CART_FEEDBACK_DURATION);
  }

  /**
   * Handle quantity increment/decrement
   * @param {string} action - "inc" or "dec"
   * @param {string} id - Product ID
   */
  function handleQuantityChange(action, id) {
    const cart = loadCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (action === "inc") {
      item.qty += 1;
    } else if (action === "dec") {
      item.qty -= 1;
      if (item.qty <= 0) {
        cart.splice(cart.indexOf(item), 1);
      }
    }

    saveCart(cart);
  }

  // Event delegation for all click interactions
  document.addEventListener("click", (e) => {
    const target = e.target;

    // Add to cart button
    const addBtn = target.closest("button[data-id][data-category]");
    if (addBtn) {
      handleAddToCart(addBtn);
      return;
    }

    // Quantity and remove controls
    const action = target.getAttribute("data-act");
    const id = target.getAttribute("data-id");

    if (action === "inc" || action === "dec") {
      handleQuantityChange(action, id);
      return;
    }

    if (action === "remove") {
      removeFromCart(id);
      return;
    }

    // Navigation and modal controls
    switch (target.id) {
      case "openCartBtn":
        if (!window.location.pathname.endsWith("cart.html")) {
          window.location.href = "cart.html";
        }
        return;

      case "closeCart":
        closeCart();
        return;

      case "clearCart":
        clearCart();
        return;

      case "checkoutBtn":
        closeCart();
        window.location.href = "checkout.html";
        return;

      case "cartOverlay":
        if (target === document.getElementById("cartOverlay")) {
          closeCart();
        }
        return;
    }
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });

  // INITIALIZATION
  document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
  });

  // PUBLIC API
  /**
   * Public API for cart operations and segmentation integration
   * @namespace cartAPI
   */
  window.cartAPI = {
    // Core cart operations
    add: addToCart,
    remove: removeFromCart,
    clear: clearCart,
    get: loadCart,

    // UI operations
    updateCartCount,
    renderCartModal,
    openCart,
    closeCart,

    // Segmentation integration

    /**
     * Convert cart to segmentation format for ML model
     * Returns minimal format: [{category, price, qty}, ...]
     * @returns {Array} Segmentation-ready cart data
     */
    /**
     * Return cart line items in the minimal format required by the
     * Python classify_cart() sample: [{category, price, qty}, ...]
     * Extra fields (id, name) are excluded.
     */
    toSegmentationSample: function () {
      return loadCart().map((i) => ({
        category: i.category,
        price: i.price,
        qty: i.qty,
      }));
    },

    /**
     * Convert segmentation sample to JSON string
     * @param {number} space - JSON indentation spaces
     * @returns {string} JSON string
     */
    toSegmentationJSON: function (space = 2) {
      return JSON.stringify(this.toSegmentationSample(), null, space);
    },

    /**
     * Copy segmentation sample to clipboard
     * @returns {Promise<boolean>} Success status
     */
    copySegmentationSample: async function () {
      try {
        const json = this.toSegmentationJSON();
        await navigator.clipboard.writeText(json);
        console.log("Segmentation sample copied to clipboard");
        return true;
      } catch (e) {
        console.warn("Clipboard copy failed:", e);
        return false;
      }
    },

    /**
     * Download segmentation sample as JSON file
     */
    downloadSegmentationSample: function () {
      const json = this.toSegmentationJSON();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "cart_sample.json";
      link.click();

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 0);
    },

    /**
     * Get spending summary grouped by category
     * @returns {Array<{category: string, totalSpend: number}>} Spend summary
     */
    categorySpendSummary: function () {
      const summary = {};

      loadCart().forEach((item) => {
        const category = item.category || "other";
        summary[category] = (summary[category] || 0) + item.price * item.qty;
      });

      return Object.entries(summary).map(([category, totalSpend]) => ({
        category,
        totalSpend,
      }));
    },
  };
})();
