const CFG = window.CFSS_SUPABASE_CONFIG || {};
const configured = CFG.url && CFG.publishableKey && !CFG.url.includes("YOUR_PROJECT_REF") && !CFG.publishableKey.includes("YOUR_SUPABASE_PUBLISHABLE_KEY");
const supabaseClient = configured ? window.supabase.createClient(CFG.url, CFG.publishableKey) : null;
const ADMIN_UID = "a6a20264-3bda-4a41-9570-61548f7fb5b6";
const $ = id => document.getElementById(id);
let editing = null;
let adminCars = [];

function msg(text, type = "") { $("admin-message").textContent = text; $("admin-message").className = `message ${type}`; }
function loginMsg(text, type = "") { $("login-message").textContent = text; $("login-message").className = `message ${type}`; }
function money(v) { return v === null || v === undefined || v === "" ? "" : `₹${Number(v).toLocaleString("en-IN")}`; }

function resetForm() {
  editing = null; $("car-form").reset(); $("car-id").value = ""; $("form-title").textContent = "New car"; $("delete-car").hidden = true; $("current-image").innerHTML = "";
}
function fillForm(c) {
  editing = c; $("car-id").value = c.id; $("car-name").value = c.name || ""; $("car-category").value = c.category || "Base Game"; $("car-buy").value = c.buy_price ?? ""; $("car-sell").value = c.sell_price ?? ""; $("car-notes").value = c.notes || ""; $("form-title").textContent = `Edit: ${c.name}`; $("delete-car").hidden = false;
  $("current-image").innerHTML = c.image_url ? `<img src="${c.image_url}" alt="Current image"><span>Current image</span>` : "No image uploaded";
  window.scrollTo({top: 0, behavior: "smooth"});
}

function renderList() {
  $("admin-list").innerHTML = adminCars.map(c => `<button class="admin-car" data-id="${c.id}"><span>${c.image_url ? "🖼️" : "🚗"}</span><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(c.category)}</small></button>`).join("") || `<p class="muted">No cars in Supabase yet. Use “Import starter catalogue”.</p>`;
  document.querySelectorAll(".admin-car").forEach(b => b.addEventListener("click", () => fillForm(adminCars.find(c => Number(c.id) === Number(b.dataset.id)))));
}
function escapeHtml(s) { return String(s ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }

async function loadCars() {
  const { data, error } = await supabaseClient.from("cars").select("id,name,category,image_url,buy_price,sell_price,notes,created_at").order("id");
  if (error) return msg(error.message, "error");
  adminCars = data || []; renderList();
}

async function uploadImage(file, carId) {
  if (!file) return null;
  if (file.size > 6 * 1024 * 1024) throw new Error("Image is larger than 6 MB.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `cars/${carId}-${Date.now()}.${ext}`;
  const { error } = await supabaseClient.storage.from("car-images").upload(path, file, { contentType: file.type || "image/jpeg", upsert: false, cacheControl: "31536000" });
  if (error) throw error;
  return supabaseClient.storage.from("car-images").getPublicUrl(path).data.publicUrl;
}
function storagePathFromUrl(url) {
  if (!url || !CFG.url) return null;
  const marker = "/storage/v1/object/public/car-images/";
  const i = url.indexOf(marker); return i >= 0 ? decodeURIComponent(url.slice(i + marker.length)) : null;
}
async function deleteImage(url) { const path = storagePathFromUrl(url); if (!path) return; const { error } = await supabaseClient.storage.from("car-images").remove([path]); if (error) console.warn("Image delete warning", error); }

$("login-form").addEventListener("submit", async e => {
  e.preventDefault();
  if (!configured) return loginMsg("Add your Supabase URL and publishable key to supabase-config.js first.", "error");
  loginMsg("Signing in…", "loading");
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email: $("email").value.trim(), password: $("password").value });
  if (error) return loginMsg(error.message, "error");
  if (data.user.id !== ADMIN_UID) { await supabaseClient.auth.signOut(); return loginMsg("This account is not authorized as GhostAlgo admin.", "error"); }
  showAdmin(data.user);
});

async function showAdmin(user) {
  $("login-panel").hidden = true; $("admin-panel").hidden = false; $("whoami").textContent = `Signed in as ${user.email}`; await loadCars();
}
async function checkSession() {
  if (!configured) return;
  const { data } = await supabaseClient.auth.getSession();
  if (data.session?.user) {
    if (data.session.user.id === ADMIN_UID) showAdmin(data.session.user); else await supabaseClient.auth.signOut();
  }
}
supabaseClient?.auth.onAuthStateChange((event, session) => { if (event === "SIGNED_OUT") { $("login-panel").hidden = false; $("admin-panel").hidden = true; resetForm(); } });

$("signout").addEventListener("click", async () => { await supabaseClient.auth.signOut(); });
$("new-car").addEventListener("click", resetForm);
$("cancel-edit").addEventListener("click", resetForm);
$("refresh-cars").addEventListener("click", loadCars);

$("car-form").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    const name = $("car-name").value.trim(); if (!name) throw new Error("Car name is required.");
    const payload = { name, category: $("car-category").value, buy_price: $("car-buy").value === "" ? null : Number($("car-buy").value), sell_price: $("car-sell").value === "" ? null : Number($("car-sell").value), notes: $("car-notes").value.trim() || null };
    msg("Saving…", "loading");
    let carId = editing?.id;
    if (editing) {
      const { error } = await supabaseClient.from("cars").update(payload).eq("id", carId); if (error) throw error;
    } else {
      const { data, error } = await supabaseClient.from("cars").insert(payload).select().single(); if (error) throw error; carId = data.id;
    }
    const file = $("car-image").files[0];
    if (file) {
      const url = await uploadImage(file, carId);
      const { error } = await supabaseClient.from("cars").update({ image_url: url }).eq("id", carId); if (error) throw error;
      if (editing?.image_url && editing.image_url !== url) await deleteImage(editing.image_url);
    }
    msg("Car saved successfully.", "success"); resetForm(); await loadCars();
  } catch (error) { console.error(error); msg(error.message || "Could not save car.", "error"); }
});

$("delete-car").addEventListener("click", async () => {
  if (!editing || !confirm(`Delete “${editing.name}”? This cannot be undone.`)) return;
  try {
    msg("Deleting…", "loading");
    const { error } = await supabaseClient.from("cars").delete().eq("id", editing.id); if (error) throw error;
    if (editing.image_url) await deleteImage(editing.image_url);
    msg("Car deleted.", "success"); resetForm(); await loadCars();
  } catch (error) { console.error(error); msg(error.message || "Could not delete car.", "error"); }
});

$("import-cars").addEventListener("click", async () => {
  if (!confirm("Import the starter catalogue? Existing cars will be left unchanged.")) return;
  try {
    msg("Checking starter catalogue…", "loading");
    const { data: existing, error } = await supabaseClient.from("cars").select("name,category"); if (error) throw error;
    const keys = new Set((existing || []).map(c => `${c.category}|||${c.name}`));
    const source = (window.CFSS_CARS || []).map(c => ({ name: c.name, category: c.category, buy_price: null, sell_price: null, notes: null }));
    const missing = source.filter(c => !keys.has(`${c.category}|||${c.name}`));
    if (!missing.length) { msg("Starter catalogue is already imported.", "success"); return; }
    for (let i = 0; i < missing.length; i += 100) { const { error } = await supabaseClient.from("cars").insert(missing.slice(i, i + 100)); if (error) throw error; }
    msg(`Imported ${missing.length} starter cars.`, "success"); await loadCars();
  } catch (error) { console.error(error); msg(error.message || "Import failed.", "error"); }
});

checkSession();
