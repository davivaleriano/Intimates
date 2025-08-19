// Delicatta - lógica básica de catálogo, busca e carrinho (client-side)

const PRODUCTS = [
  {id:1, name:"Conjunto Renda Suave", price:119.9, category:["feminino","conjuntos"], sizes:["P","M","G"], badge:"Novo"},
  {id:2, name:"Sutiã Comfort Sem Bojo", price:79.9, category:["feminino","sutiens"], sizes:["P","M","G","GG"]},
  {id:3, name:"Calcinha Cintura Alta", price:39.9, category:["feminino","calcinhas","plus"], sizes:["M","G","GG","XG"], badge:"Plus Size"},
  {id:4, name:"Cueca Boxer Microfibra", price:49.9, category:["masculino","cuecas"], sizes:["P","M","G","GG"], badge:"Best seller"},
  {id:5, name:"Pijama Curto Algodão", price:129.9, category:["feminino","pijamas"], sizes:["P","M","G"]},
  {id:6, name:"Body Modelador", price:159.9, category:["feminino","modeladores","plus"], sizes:["M","G","GG","XG"], badge:"Nova cor"},
  {id:7, name:"Cueca Samba‑canção", price:54.9, category:["masculino","pijamas"], sizes:["M","G","GG"]},
  {id:8, name:"Top Conforto", price:69.9, category:["feminino","sutiens"], sizes:["PP","P","M","G"]},
  {id:9, name:"Calcinha Fio Duplo", price:34.9, category:["feminino","calcinhas"], sizes:["P","M","G"]},
  {id:10,name:"Conjunto Básico Cotton", price:99.9, category:["feminino","conjuntos"], sizes:["P","M","G","GG"]},
  {id:11,name:"Cueca Slip Clássica", price:29.9, category:["masculino","cuecas"], sizes:["P","M","G","GG"]},
  {id:12,name:"Pijama Longo Inverno", price:179.9, category:["feminino","pijamas","plus"], sizes:["G","GG","XG"]},
];

let state = {
  search: "",
  category: "todas",
  size: "todos",
  sort: "relevancia",
  cart: JSON.parse(localStorage.getItem("delicatta_cart") || "[]")
};

const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categorySel = document.getElementById("category");
const sizeSel = document.getElementById("size");
const sortSel = document.getElementById("sort");
const clearFilters = document.getElementById("clearFilters");
const cartCount = document.getElementById("cartCount");

function formatBRL(v){return v.toLocaleString("pt-BR",{style:"currency", currency:"BRL"})}

function render(){
  // filtrar
  let items = PRODUCTS.filter(p => {
    const s = state.search.trim().toLowerCase();
    const matchesSearch = !s || p.name.toLowerCase().includes(s);
    const matchesCat = state.category === "todas" || p.category.includes(state.category);
    const matchesSize = state.size === "todos" || p.sizes.includes(state.size);
    return matchesSearch && matchesCat && matchesSize;
  });

  // ordenar
  if(state.sort === "menor-preco") items.sort((a,b)=>a.price-b.price);
  if(state.sort === "maior-preco") items.sort((a,b)=>b.price-a.price);
  if(state.sort === "novidades") items.sort((a,b)=>b.id-a.id);

  // desenhar
  grid.innerHTML = items.map(p => `
    <article class="card product" aria-label="${p.name}">
      <div class="img" aria-hidden="true">${(p.name.split(" ")[0]||"")}</div>
      <h3>${p.name}</h3>
      <p>${p.sizes.map(s=>`<span class="tag">${s}</span>`).join(" ")}</p>
      <div class="price">
        <span class="value">${formatBRL(p.price)}</span>
        <button class="btn btn-primary small" data-add="${p.id}">Adicionar</button>
      </div>
      ${p.badge?`<div class="tag" style="margin-top:8px;display:inline-block">${p.badge}</div>`:""}
    </article>
  `).join("");

  updateCartCount();
}

function updateCartCount(){
  const count = state.cart.reduce((sum,i)=>sum+i.qty,0);
  cartCount.textContent = count;
  localStorage.setItem("delicatta_cart", JSON.stringify(state.cart));
}

function addToCart(id){
  const prod = PRODUCTS.find(p=>p.id===id);
  const found = state.cart.find(i=>i.id===id);
  if(found){ found.qty += 1; }
  else { state.cart.push({id:prod.id, name:prod.name, price:prod.price, qty:1}); }
  updateCartCount();
  drawCart();
  openDrawer();
}

function changeQty(id, delta){
  const item = state.cart.find(i=>i.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty<=0) state.cart = state.cart.filter(i=>i.id!==id);
  updateCartCount();
  drawCart();
}

function removeItem(id){
  state.cart = state.cart.filter(i=>i.id!==id);
  updateCartCount();
  drawCart();
}

const drawer = document.getElementById("cartDrawer");
const openCartBtn = document.getElementById("openCart");
const closeCartBtn = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

function drawCart(){
  if(state.cart.length===0){
    cartItems.innerHTML = '<p class="muted">Seu carrinho está vazio.</p>';
    cartTotal.textContent = formatBRL(0);
    return;
  }
  cartItems.innerHTML = state.cart.map(i=>`
    <div class="cart-item">
      <div class="cart-thumb" aria-hidden="true"></div>
      <div class="cart-info">
        <strong>${i.name}</strong>
        <div class="qty">
          <button data-minus="${i.id}">−</button>
          <span>Qtd: ${i.qty}</span>
          <button data-plus="${i.id}">+</button>
        </div>
      </div>
      <div style="text-align:right">
        <div>${formatBRL(i.price*i.qty)}</div>
        <button class="tiny btn btn-ghost" data-remove="${i.id}" style="margin-top:6px">Remover</button>
      </div>
    </div>
  `).join("");

  const total = state.cart.reduce((sum,i)=>sum+i.price*i.qty,0);
  cartTotal.textContent = formatBRL(total);
}

function openDrawer(){ drawer.classList.add("open"); drawer.setAttribute("aria-hidden","false"); }
function closeDrawer(){ drawer.classList.remove("open"); drawer.setAttribute("aria-hidden","true"); }

// Eventos
document.addEventListener("click", (e)=>{
  const addId = e.target.getAttribute("data-add");
  const plusId = e.target.getAttribute("data-plus");
  const minusId = e.target.getAttribute("data-minus");
  const removeId = e.target.getAttribute("data-remove");

  if(addId){ addToCart(Number(addId)); }
  if(plusId){ changeQty(Number(plusId), +1); }
  if(minusId){ changeQty(Number(minusId), -1); }
  if(removeId){ removeItem(Number(removeId)); }

  if(e.target.id==="openCart"){ drawCart(); openDrawer(); }
  if(e.target.id==="closeCart"){ closeDrawer(); }
});

searchInput.addEventListener("input", e=>{ state.search=e.target.value; render(); });
categorySel.addEventListener("change", e=>{ state.category=e.target.value; render(); });
sizeSel.addEventListener("change", e=>{ state.size=e.target.value; render(); });
sortSel.addEventListener("change", e=>{ state.sort=e.target.value; render(); });
clearFilters.addEventListener("click", ()=>{
  state.search=""; searchInput.value="";
  state.category="todas"; categorySel.value="todas";
  state.size="todos"; sizeSel.value="todos";
  state.sort="relevancia"; sortSel.value="relevancia";
  render();
});

// Menu mobile
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", ()=>{
  const isOpen = mainNav.style.display === "flex";
  mainNav.style.display = isOpen ? "none" : "flex";
});

// Newsletter e contato (apenas demonstração)
document.getElementById("newsletterForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  alert("Inscrição realizada! Em breve você receberá novidades por e‑mail.");
  e.target.reset();
});
document.getElementById("contactForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  alert("Mensagem enviada! Responderemos em breve.");
  e.target.reset();
});

// Checkout
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckout = document.getElementById("closeCheckout");
const confirmarPedido = document.getElementById("confirmarPedido");

checkoutBtn.addEventListener("click", ()=>{
  if(state.cart.length===0){ alert("Seu carrinho está vazio."); return; }
  checkoutModal.showModal();
});
closeCheckout.addEventListener("click", ()=> checkoutModal.close());
confirmarPedido.addEventListener("click", (e)=>{
  const total = state.cart.reduce((s,i)=>s+i.price*i.qty,0);
  if(total<=0){ alert("Carrinho vazio."); return; }
  setTimeout(()=>{
    alert("Pedido confirmado! Número do pedido: #" + Math.floor(Math.random()*90000+10000));
    state.cart = []; updateCartCount(); drawCart(); checkoutModal.close();
  }, 200);
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Inicializar
render();
drawCart();
