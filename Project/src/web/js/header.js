/**
 * Site Header Controller
 * Loads header template and populates dynamic content
 */

(function () {
  // ============================================================================
  // CONSTANTS
  // ============================================================================

  const MOUNT_POINT_ID = "site-header";
  const TEMPLATE_PATH = "templates/header.html";

  const CATEGORIES = [
    { label: "Fish", href: "fish.html" },
    { label: "Fruits", href: "fruits.html" },
    { label: "Gold", href: "gold.html" },
    { label: "Meat", href: "meat.html" },
    { label: "Sweets", href: "sweet.html" },
    { label: "Wines", href: "wine.html" },
  ].sort((a, b) => a.label.localeCompare(b.label));

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
  // DYNAMIC CONTENT POPULATION
  // ============================================================================

  /**
   * Populate category links in dropdown
   * @param {HTMLElement} container - Dropdown content container
   */
  function populateCategoryLinks(container) {
    if (!container) return;

    const fragment = document.createDocumentFragment();

    CATEGORIES.forEach((category) => {
      const link = document.createElement("a");
      link.href = category.href;
      link.textContent = category.label;
      fragment.appendChild(link);
    });

    container.replaceChildren(fragment);
  }

  // ============================================================================
  // HEADER INITIALIZATION
  // ============================================================================

  /**
   * Load and inject header template
   */
  async function initHeader() {
    const mountPoint = document.getElementById(MOUNT_POINT_ID);

    if (!mountPoint) {
      console.warn(`Header mount point #${MOUNT_POINT_ID} not found`);
      return;
    }

    if (mountPoint.dataset.injected === "true") {
      return; // Already injected
    }

    // Load template
    const templateHTML = await loadTemplate(TEMPLATE_PATH);
    if (!templateHTML) {
      console.error("Could not load header template");
      return;
    }

    // Inject template
    mountPoint.innerHTML = templateHTML;
    mountPoint.dataset.injected = "true";

    // Populate dynamic content
    const categoryContainer = document.getElementById("categoryLinks");
    populateCategoryLinks(categoryContainer);

    // Update cart count after header is injected
    if (window.cartAPI && window.cartAPI.updateCartCount) {
      window.cartAPI.updateCartCount();
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  document.addEventListener("DOMContentLoaded", initHeader);
})();
