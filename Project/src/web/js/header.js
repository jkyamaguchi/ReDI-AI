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

  const headerHTML =
    `\n    <header>\n      <nav>\n        <a href="index.html">Home</a>\n        <div class="dropdown">\n          <button class="dropbtn">Products ▾</button>\n          <div class="dropdown-content">` +
    dropdownLinks +
    `\n          </div>\n        </div>\n        <button id="openCartBtn" class="cart-btn" type="button">My Cart (<span id="cartCount">0</span>)</button>\n      </nav>\n    </header>`;

  // Overlay removed: cart now has dedicated page (cart.html)

  function injectHeaderAndCart() {
    const mount = document.getElementById("site-header");
    if (mount && !mount.dataset.injected) {
      mount.innerHTML = headerHTML;
      mount.dataset.injected = "true";
    }
  }

  document.addEventListener("DOMContentLoaded", injectHeaderAndCart);
})();
