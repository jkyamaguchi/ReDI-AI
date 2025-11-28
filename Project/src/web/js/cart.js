      // Re-render cart content directly (no modal). We reuse existing renderCartModal.
      function renderInlineCart() {
        if (window.cartAPI) {
          window.cartAPI.renderCartModal();
          window.cartAPI.updateCartCount();
        }
        // If empty, replace with inline empty message
        const itemsWrap = document.getElementById("cartItems");
        if (itemsWrap && !itemsWrap.innerHTML.trim()) {
          itemsWrap.innerHTML =
            '<div class="empty-inline">Cart is empty.</div>';
        }
      }
      document.addEventListener("DOMContentLoaded", renderInlineCart);
      // Deactivate modal triggers for this page (openCartBtn not present)
      document.addEventListener("click", (e) => {
        if (e.target.id === "checkoutBtn") {
          window.location.href = "checkout.html";
        }
      });
