(function () {
  const categories = [
    { label: "Fish", href: "fish.html" },
    { label: "Fruits", href: "fruits.html" },
    { label: "Gold", href: "gold.html" },
    { label: "Meat", href: "meat.html" },
    { label: "Sweets", href: "sweet.html" },
    { label: "Wines", href: "wine.html" },
  ].sort((a, b) => a.label.localeCompare(b.label));

  const dropdownLinks = categories
    .map((c) => `\n            <a href="${c.href}">${c.label}</a>`)
    .join("");

  const headerHTML = `\n    <header>\n      <nav>\n        <a href="index.html">Home</a>\n        <div class="dropdown">\n          <button class="dropbtn">Products ▾</button>\n          <div class="dropdown-content">` +
    dropdownLinks +
    `\n          </div>\n        </div>\n        <button id="openCartBtn" class="cart-btn" type="button">My Cart (<span id="cartCount">0</span>)</button>\n      </nav>\n    </header>`;

  const cartOverlayHTML = `\n    <div id="cartOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1000;align-items:center;justify-content:center;">\n      <div style="background:#fff;width:380px;max-width:92%;max-height:75vh;border-radius:8px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 4px 18px rgba(0,0,0,.25);font-family:Arial,sans-serif;">\n        <div style="display:flex;align-items:center;justify-content:space-between;background:#243447;color:#fff;padding:10px 14px;">\n          <strong>Cart</strong>\n          <button id="closeCart" style="background:#555;color:#fff;border:0;padding:4px 10px;border-radius:4px;cursor:pointer;">Close</button>\n        </div>\n        <div id="cartItems" style="padding:12px;overflow-y:auto;flex:1 1 auto"></div>\n        <div style="padding:10px 14px;border-top:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">\n          <div id="cartTotal" style="font-weight:bold"></div>\n          <button id="clearCart" style="background:#c0392b;color:#fff;border:0;padding:6px 10px;border-radius:4px;cursor:pointer;font-size:13px;">Clear</button>\n        </div>\n      </div>\n    </div>`;

  function injectHeaderAndCart() {
    const mount = document.getElementById("site-header");
    if (mount && !mount.dataset.injected) {
      mount.innerHTML = headerHTML;
      mount.dataset.injected = "true";
    }
    // Inject global cart overlay once if not present
    if (!document.getElementById("cartOverlay")) {
      const frag = document.createElement("div");
      frag.innerHTML = cartOverlayHTML;
      document.body.appendChild(frag.firstElementChild);
    }
  }

  document.addEventListener("DOMContentLoaded", injectHeaderAndCart);
})();
