function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("cart:v1")) || [];
  } catch {
    return [];
  }
}
function renderSummary() {
  const itemsEl = document.getElementById("orderItems");
  const totalEl = document.getElementById("orderTotal");
  const cart = loadCart();
  if (!cart.length) {
    itemsEl.innerHTML = '<div class="empty">Your cart is empty.</div>';
    totalEl.textContent = "$0.00";
    return;
  }
  let total = 0;
  itemsEl.innerHTML = cart
    .map((i) => {
      total += i.price * i.qty;
      return `<div class="line"><span>${i.name} x ${i.qty}</span><span>$${(
        i.price * i.qty
      ).toFixed(2)}</span></div>`;
    })
    .join("");
  totalEl.textContent = "$" + total.toFixed(2);
}
document.addEventListener("DOMContentLoaded", renderSummary);
document.getElementById("backToCart").addEventListener("click", () => {
  window.location.href = "cart.html";
});
document.getElementById("confirmOrder").addEventListener("click", () => {
  alert("Order confirmed! Thank you.");
  // Clear cart after confirmation
  localStorage.setItem("cart:v1", JSON.stringify([]));
  window.location.href = "index.html";
});
