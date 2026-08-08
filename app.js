const CFG = window.CFSS_SUPABASE_CONFIG || {};
const configured = CFG.url && CFG.publishableKey && !CFG.url.includes("YOUR_PROJECT_REF") && !CFG.publishableKey.includes("YOUR_SUPABASE_PUBLISHABLE_KEY");
const supabase = configured ? window.supabase.createClient(CFG.url, CFG.publishableKey) : null;

const q = document.getElementById("search");
const f = document.getElementById("filter");
const cat = document.getElementById("catalog");
const count = document.getElementById("count");
const status = document.getElementById("data-status");
let rows = [];

const esc = (s) => String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const money = (v) => v === null || v === undefined || v === "" ? "" : `₹${Number(v).toLocaleString("en-IN")}`;

function showStatus(text, type = "") {
  if (!status) return;
  status.textContent = text;
  status.className = `data-status ${type}`;
}

function normalize(c) {
  return {
    id: c.id,
    category: c.category || "Base Game",
    name: c.name || "Unnamed Car",
    image: c.image_url || c.image || "",
    buy: c.buy_price ?? c.buy ?? "",
    sell: c.sell_price ?? c.sell ?? "",
    notes: c.notes || ""
  };
}

function render() {
  const term = q.value.trim().toLowerCase();
  const selected = f.value;
  const filtered = rows.filter(c =>
    (selected === "all" || c.category === selected) && c.name.toLowerCase().includes(term)
  );
  count.textContent = `${filtered.length} car${filtered.length === 1 ? "" : "s"}`;

  cat.innerHTML = filtered.map(c => `
    <article class="card" data-id="${esc(c.id)}" tabindex="0" role="button" aria-label="View ${esc(c.name)}">
      ${c.image ? `<img class="pic" loading="lazy" src="${esc(c.image)}" alt="${esc(c.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="pic fallback" style="display:none">🚗</div>` : `<div class="pic">🚗</div>`}
      <div class="body">
        <span class="tag">${esc(c.category)}</span>
        <h3>${esc(c.name)}</h3>
        <p class="price-line">${c.buy !== "" ? `Buy: ${esc(money(c.buy))}` : ""}${c.buy !== "" && c.sell !== "" ? " • " : ""}${c.sell !== "" ? `Sell: ${esc(money(c.sell))}` : ""}</p>
      </div>
    </article>`).join("") || `<div class="empty"><div>🚗</div><h3>No cars found</h3><p>Try another search or category.</p></div>`;

  cat.querySelectorAll(".card").forEach(card => {
    const open = () => openDetails(Number(card.dataset.id));
    card.addEventListener("click", open);
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
}

function rebuildFilters() {
  const current = f.value;
  f.innerHTML = `<option value="all">All categories</option>`;
  [...new Set(rows.map(c => c.category))].sort().forEach(x => {
    const o = document.createElement("option"); o.value = x; o.textContent = x; f.appendChild(o);
  });
  f.value = [...f.options].some(o => o.value === current) ? current : "all";
}

async function loadCars() {
  if (!configured) {
    rows = (window.CFSS_CARS || []).map(normalize);
    showStatus("Supabase is not configured yet — showing the starter catalogue.", "warning");
    rebuildFilters(); render(); return;
  }
  showStatus("Loading live catalogue…", "loading");
  const { data, error } = await supabase.from("cars").select("id,name,category,image_url,buy_price,sell_price,notes,created_at").order("id");
  if (error) {
    console.error(error);
    rows = (window.CFSS_CARS || []).map(normalize);
    showStatus(`Could not load Supabase data: ${error.message}`, "error");
  } else {
    rows = (data || []).map(normalize);
    showStatus("Live catalogue connected", "success");
  }
  rebuildFilters(); render();
}

function openDetails(id) {
  const c = rows.find(x => Number(x.id) === Number(id));
  if (!c) return;
  const modal = document.getElementById("details-modal");
  document.getElementById("details-content").innerHTML = `
    <div class="details-image">${c.image ? `<img src="${esc(c.image)}" alt="${esc(c.name)}">` : "🚗"}</div>
    <div class="details-info">
      <span class="tag">${esc(c.category)}</span>
      <h2>${esc(c.name)}</h2>
      ${c.buy !== "" ? `<div class="detail-row"><span>Buy price</span><b>${esc(money(c.buy))}</b></div>` : ""}
      ${c.sell !== "" ? `<div class="detail-row"><span>Sell price</span><b>${esc(money(c.sell))}</b></div>` : ""}
      ${c.notes ? `<div class="notes"><b>Notes</b><p>${esc(c.notes)}</p></div>` : ""}
    </div>`;
  modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
}

function closeDetails() {
  const modal = document.getElementById("details-modal");
  modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true");
}

document.getElementById("close-details")?.addEventListener("click", closeDetails);
document.getElementById("details-modal")?.addEventListener("click", e => { if (e.target.id === "details-modal") closeDetails(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeDetails(); });
q.addEventListener("input", render); f.addEventListener("change", render);
loadCars();
