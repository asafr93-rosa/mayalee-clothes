(function () {
  const PHONE = "972542104009";
  const CATEGORIES = ["הכל", "שמלות", "חולצות", "מכנסיים", "ספורט", "בגדי ים", "נעליים", "פריטים לבית"];

  const items = window.ITEMS.map((it, i) => ({ ...it, id: i }));
  const state = { category: "הכל", availability: "available", size: "all", q: "", selected: new Set() };

  const $ = (id) => document.getElementById(id);
  const grid = $("grid");

  // Category chips
  CATEGORIES.forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = c;
    b.onclick = () => { state.category = c; render(); };
    $("categories").appendChild(b);
  });

  // Size options
  const sizes = [...new Set(items.map((i) => i.size.toUpperCase()).filter(Boolean))].sort((a, b) => {
    const na = Number(a), nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    if (!isNaN(na)) return -1;
    if (!isNaN(nb)) return 1;
    return a.localeCompare(b);
  });
  $("size").innerHTML = '<option value="all">כל המידות</option>' +
    sizes.map((s) => `<option value="${s}">מידה ${s}</option>`).join("");

  $("availability").onchange = (e) => { state.availability = e.target.value; render(); };
  $("size").onchange = (e) => { state.size = e.target.value; render(); };
  $("search").oninput = (e) => { state.q = e.target.value.trim(); render(); };
  $("clear").onclick = () => { state.selected.clear(); render(); };
  $("send").onclick = send;
  $("chat").href = `https://wa.me/${PHONE}?text=${encodeURIComponent("היי, אשמח לשמוע עוד על הפריטים בארון ♡")}`;

  function visible() {
    return items.filter((it) =>
      (state.category === "הכל" || it.category === state.category) &&
      (state.availability === "all" || (state.availability === "sold") === !!it.sold) &&
      (state.size === "all" || it.size.toUpperCase() === state.size) &&
      (!state.q || it.name.includes(state.q))
    );
  }

  function card(it) {
    const el = document.createElement(it.sold ? "div" : "button");
    const on = state.selected.has(it.id);
    el.className = "card" + (it.sold ? " sold" : "") + (on ? " selected" : "");
    if (!it.sold) {
      el.type = "button";
      el.setAttribute("aria-pressed", on);
      el.onclick = () => { on ? state.selected.delete(it.id) : state.selected.add(it.id); render(); };
    }
    const meta = it.size ? `${it.category} · מידה ${it.size}` : it.category;
    el.innerHTML = `
      <div class="photo">
        ${it.image ? `<img src="${it.image}" alt="" loading="lazy">` : `<span class="ph">${it.category}</span>`}
        ${it.sold ? '<span class="badge">נמכר ♡</span>' : ""}
        ${!it.sold ? `<span class="check">${on ? "✓" : "+"}</span>` : ""}
      </div>
      <div class="info">
        <h3></h3>
        <p class="meta"></p>
        <p class="price">${it.sold ? "כבר מצא ארון חדש" : it.price + " ₪"}</p>
      </div>`;
    el.querySelector("h3").textContent = it.name;
    el.querySelector(".meta").textContent = meta;
    return el;
  }

  function render() {
    document.querySelectorAll(".chip").forEach((b) => b.classList.toggle("active", b.textContent === state.category));
    const list = visible();
    grid.replaceChildren(...list.map(card));
    $("empty").hidden = list.length > 0;
    $("count").textContent = `(${items.length} פריטים)`;

    const sel = items.filter((i) => state.selected.has(i.id));
    $("sendbar").hidden = sel.length === 0;
    document.body.classList.toggle("has-bar", sel.length > 0);
    $("sel-count").textContent = sel.length === 1 ? "פריט אחד נבחר" : `${sel.length} פריטים נבחרו`;
    $("sel-total").textContent = `· ${sel.reduce((s, i) => s + (i.price || 0), 0)} ₪`;
  }

  function send() {
    const sel = items.filter((i) => state.selected.has(i.id));
    if (!sel.length) return;
    const lines = sel.map((i) => `• ${i.name}${i.size ? ` (מידה ${i.size})` : ""} - ${i.price} ₪`);
    const text = `היי ♡ אשמח לקנות את הפריטים הבאים:\n${lines.join("\n")}`;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  render();
})();
