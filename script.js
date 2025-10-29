// var
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const currency = v => '₱' + Number(v).toFixed(2);

// error
function showCenteredToast(msg, color = '#a15c38') {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
    background: color, color: '#fff', padding: '18px 28px',
    borderRadius: '12px', zIndex: 99999,
    boxShadow: '0 8px 30px rgba(2,6,23,0.25)', fontWeight: '600',
    opacity: 1, transition: 'opacity 0.5s ease', textAlign: 'center'
  });
  document.body.appendChild(t);
  setTimeout(() => t.style.opacity = '0', 2000);
  setTimeout(() => t.remove(), 2500);
}

function showCenteredError(msg) {
  const modal = new bootstrap.Modal(document.getElementById('errorModal'));
  document.getElementById('errorModalBody').textContent = msg;
  modal.show();
}

// product page
const cardsRow = document.getElementById('cardsRow');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const productModalEl = document.getElementById('productModal');
const productModal = productModalEl ? new bootstrap.Modal(productModalEl) : null;
const productModalTitle = document.getElementById('productModalTitle');
const productModalImg = document.getElementById('productModalImg');
const productModalDesc = document.getElementById('productModalDesc');
const productModalCategory = document.getElementById('productModalCategory');
const productModalPrice = document.getElementById('productModalPrice');
const modalAddToCart = document.getElementById('modalAddToCart');

if (cardsRow) {
  // back products
  const fallbackProducts = [
    { id: 1, name: "Four Seasons Lemonade", category: "Lemonades", price: 129.00, image: "img/foursea.png", description: "Citrus medley with tangy passionfruit, honey, and fresh lemon." },
    { id: 2, name: "Blue Lemonade", category: "Lemonades", price: 119.00, image: "img/bluelemon.png", description: "Vibrant azure lemonade with butterfly pea and zesty lime." },
    { id: 3, name: "Classic Pearl Tea (House Blend)", category: "Milk Tea", price: 139.00, image: "img/pearltea.png", description: "Signature house-blend milk tea with chewy tapioca pearls." },
    { id: 4, name: "Iced Strawberry Choco", category: "Fruit Drinks", price: 139.00, image: "img/starwberry.png", description: "Sweet strawberry blend with chocolate ribbons and ice." },
    { id: 5, name: "Classic Pearl Milk Tea", category: "Milk Tea", price: 129.00, image: "img/classic.png", description: "Robust black tea, creamy milk, and chewy pearls." },
    { id: 6, name: "Lychee Fruit Tea", category: "Fruit Drinks", price: 129.00, image: "img/lychee.png", description: "Refreshing lychee fruit blend with a hint of jasmine tea." },
    { id: 7, name: "Cookies & Cream Milk Tea", category: "Specials", price: 159.00, image: "img/cookies.png", description: "Rich milk tea with crushed cookies and cream foam." },
    { id: 8, name: "Caramel Macchiato", category: "Coffee", price: 149.00, image: "img/redvelvet.png", description: "Creamy espresso, steamed milk, and caramel drizzle." }
  ];

  fetch('products.json')
    .then(r => r.json())
    .then(data => { products = data; renderCards(products); })
    .catch(() => { products = fallbackProducts; renderCards(products); });

  function renderCards(list) {
    cardsRow.innerHTML = '';
    if (!list.length) { cardsRow.innerHTML = `<p class="text-muted">No items match your search.</p>`; return; }

    list.forEach(p => {
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';
      col.innerHTML = `
        <div class="card h-100">
          <div class="ribbon text-muted">${p.category}</div>
          <img src="${p.image}" alt="${p.name}" class="card-img-top" onerror="this.src='img/placeholder.png';">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between mb-2">
              <div>${p.name}</div>
              <div>${currency(p.price)}</div>
            </div>
            <p class="text-muted small mb-3">${p.description}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <button class="btn btn-outline-secondary btn-sm details-btn" data-id="${p.id}">Details</button>
              <button class="btn btn-primary add-btn" data-id="${p.id}">＋</button>
            </div>
          </div>
        </div>`;
      cardsRow.appendChild(col);
    });

    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addToCart(btn.dataset.id);
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 180);
      });
    });

    document.querySelectorAll('.details-btn').forEach(btn => {
      btn.addEventListener('click', () => showProductModal(btn.dataset.id));
    });
  }

  function addToCart(id) {
    const p = products.find(x => String(x.id) === String(id));
    if (!p) return;
    const existing = cart.find(x => x.id === p.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...p, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    showCenteredToast(`${p.name} added to cart!`);
  }

  function showProductModal(id) {
    if (!productModal) return;
    const p = products.find(x => String(x.id) === String(id));
    if (!p) return;
    productModalTitle.textContent = p.name;
    productModalImg.src = p.image;
    productModalDesc.textContent = p.description;
    productModalCategory.textContent = p.category;
    productModalPrice.textContent = currency(p.price);
    modalAddToCart.setAttribute('data-id', p.id);
    productModal.show();
  }

  modalAddToCart?.addEventListener('click', () => {
    addToCart(modalAddToCart.getAttribute('data-id'));
    productModal.hide();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      renderCards(cat === 'All' ? products : products.filter(p => p.category === cat));
    });
  });

  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    renderCards(products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      String(p.price).includes(q)
    ));
  });
}

// cart page
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartCountText = document.getElementById('cartCountText');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModalEl = document.getElementById('checkoutModal');
const checkoutModal = checkoutModalEl ? new bootstrap.Modal(checkoutModalEl) : null;
const checkoutModalBody = document.getElementById('checkoutModalBody');
const confirmCheckoutBtn = document.getElementById('confirmCheckoutBtn');



if (cartItemsContainer) {
  renderCart();

  function renderCart() {
    cartItemsContainer.innerHTML = '';
    if (!cart.length) {
      cartItemsContainer.innerHTML = `<p class="text-muted py-3">Your cart is empty. Add some drinks!</p>`;
      updateCartUI();
      return;
    }

    cart.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'd-flex align-items-center py-3' + (i > 0 ? ' border-top' : '');
      div.innerHTML = `
      <img src="${item.image}" style="width:70px;height:70px;object-fit:cover" class="me-3 rounded-3">
      <div class="flex-grow-1">
        <h6 class="mb-1 fw-semibold">${item.name}</h6>
        <p class="text-muted small mb-0">${item.description}</p>
      </div>
      <div class="text-end me-4">${currency(item.price * item.quantity)}</div>
      <div class="d-flex align-items-center border rounded px-2 me-4" style="width:90px;">
        <button class="btn btn-sm border-0 qty-decrease" data-index="${i}">−</button>
        <input type="text" value="${item.quantity}" class="form-control text-center border-0 p-0 qty-input" style="width:30px;" data-index="${i}">
        <button class="btn btn-sm border-0 qty-increase" data-index="${i}">+</button>
      </div>
      <a href="#" class="text-primary small remove-item" data-index="${i}">Remove</a>`;

      cartItemsContainer.appendChild(div);
    });

    document.querySelectorAll('.qty-increase').forEach(b => b.addEventListener('click', () => updateQuantity(b.dataset.index, 1)));
    document.querySelectorAll('.qty-decrease').forEach(b => b.addEventListener('click', () => updateQuantity(b.dataset.index, -1)));
    document.querySelectorAll('.qty-input').forEach(input => input.addEventListener('change', () => {
      const i = input.dataset.index;
      cart[i].quantity = Math.max(1, parseInt(input.value) || 1);
      saveCart(); renderCart();
    }));
    document.querySelectorAll('.remove-item').forEach(a => a.addEventListener('click', e => {
      e.preventDefault(); removeFromCart(a.dataset.index);
    }));

    updateCartUI();
  }

  function updateCartUI() {
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    if (cartCountText) cartCountText.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`;
    if (cartTotal) cartTotal.textContent = currency(totalPrice);
  }

  function updateQuantity(index, delta) {
    const item = cart[index]; if (!item) return;
    item.quantity = Math.max(1, item.quantity + delta);
    saveCart(); renderCart();
  }

  function removeFromCart(index) {
    const removed = cart[index];
    cart.splice(index, 1);
    saveCart(); renderCart();
    showCenteredToast(`${removed.name} removed from cart.`);
  }

  function saveCart() { localStorage.setItem('cart', JSON.stringify(cart)); }

  checkoutBtn?.addEventListener('click', () => {
    if (!cart.length) { showCenteredError('Your cart is empty!'); return; }
    const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    checkoutModalBody.innerHTML = `<p>Items: ${totalItems}</p><p>Total: ${currency(totalPrice)}</p><p>Proceed to checkout?</p>`;
    checkoutModal?.show();
  });

  confirmCheckoutBtn?.addEventListener('click', () => {
    checkoutModal?.hide();
    showCenteredToast('Thanks! Your order has been placed.', '#4CAF50');
    cart = []; saveCart(); renderCart();
  });

  const shippingInputs = document.querySelectorAll('input[name="shipping"]');
shippingInputs.forEach(r => r.addEventListener('change', updateShipping));

function updateShipping() {
  const deliverySelected = document.getElementById('delivery').checked;
  const shippingCost = deliverySelected ? 19 : 0;
  document.getElementById('shippingText').textContent = shippingCost ? currency(shippingCost) : 'FREE';
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  document.getElementById('cartTotal').textContent = currency(subtotal + shippingCost);
}

}
