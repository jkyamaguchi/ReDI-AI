/**
 * Checkout Controller
 * Loads checkout template and manages order confirmation
 */

(function () {
  // ============================================================================
  // CONSTANTS
  // ============================================================================

  const STORAGE_KEY = "cart:v1";
  const MOUNT_POINT_ID = "checkout-content";
  const TEMPLATE_PATH = "templates/checkout-content.html";

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Safe cart loader
   * @returns {Array} cart items
   */
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  /**
   * Persist an empty cart
   */
  function clearCartStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }

  /**
   * Format number as currency
   * @param {number} value
   * @returns {string}
   */
  function formatCurrency(value) {
    return `$${value.toFixed(2)}`;
  }

  // ============================================================================
  // TEMPLATE LOADING
  // ============================================================================

  /**
   * Fetch HTML template from server
   * @param {string} path - Template file path
   * @returns {Promise<string|null>} HTML content or null on error
   */
  async function loadTemplate(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error("Template loading error:", error);
      return null;
    }
  }

  // ============================================================================
  // DOM HELPERS
  // ============================================================================

  /**
   * Create a line item element
   * @param {Object} item
   * @param {string} item.name
   * @param {number} item.price
   * @param {number} item.qty
   * @returns {HTMLElement}
   */
  function createLineItem(item) {
    const line = document.createElement("div");
    line.className = "line";

    const name = document.createElement("span");
    name.textContent = `${item.name} x ${item.qty}`;

    const price = document.createElement("span");
    price.textContent = formatCurrency(item.price * item.qty);

    line.appendChild(name);
    line.appendChild(price);
    return line;
  }

  /**
   * Render order summary
   */
  function renderSummary() {
    const itemsEl = document.getElementById("orderItems");
    const totalEl = document.getElementById("orderTotal");

    if (!itemsEl || !totalEl) return;

    const cart = loadCart();

    if (!cart.length) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "empty";
      emptyDiv.textContent = "Your cart is empty.";
      itemsEl.replaceChildren(emptyDiv);
      totalEl.textContent = formatCurrency(0);
      return;
    }

    let total = 0;
    const fragment = document.createDocumentFragment();

    cart.forEach((item) => {
      total += item.price * item.qty;
      fragment.appendChild(createLineItem(item));
    });

    itemsEl.replaceChildren(fragment);
    totalEl.textContent = formatCurrency(total);
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  function handleBackToCart() {
    window.location.href = "cart.html";
  }

  function handleConfirmOrder() {
    alert("Order confirmed! Thank you.");
    clearCartStorage();
    window.location.href = "index.html";
  }

  // ============================================================================
  // CHECKOUT INITIALIZATION
  // ============================================================================

  /**
   * Load and initialize checkout page
   */
  async function initCheckout() {
    const mountPoint = document.getElementById(MOUNT_POINT_ID);

    if (!mountPoint) {
      console.warn(`Checkout mount point #${MOUNT_POINT_ID} not found`);
      return;
    }

    if (mountPoint.dataset.injected === "true") {
      return; // Already injected
    }

    // Load template
    const templateHTML = await loadTemplate(TEMPLATE_PATH);
    if (!templateHTML) {
      console.error("Could not load checkout template");
      return;
    }

    // Inject template
    mountPoint.innerHTML = templateHTML;
    mountPoint.dataset.injected = "true";

    // Render order summary
    renderSummary();

    // Render customer segmentation if available
    if (window.renderClusterPrediction) {
      window.renderClusterPrediction();
    }

    // Attach event handlers
    const backBtn = document.getElementById("backToCart");
    const confirmBtn = document.getElementById("confirmOrder");

    if (backBtn) backBtn.addEventListener("click", handleBackToCart);
    if (confirmBtn) confirmBtn.addEventListener("click", handleConfirmOrder);
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  document.addEventListener("DOMContentLoaded", initCheckout);
})();
