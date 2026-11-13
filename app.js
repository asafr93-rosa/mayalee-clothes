(function () {
  const PHONE = "972542104009";
  const CATEGORIES = ["הכל", "שמלות", "חולצות", "מכנסיים", "ספורט", "בגדי ים", "נעליים", "פריטים לבית"];

  const items = window.ITEMS.map((it, i) => ({ ...it, id: i }));
  const state = { category: "הכל", availability: "available", q: "", selected: new Set() };

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

  $("search").oninput = (e) => { state.q = e.target.value.trim(); render(); };
  $("clear").onclick = () => { state.selected.clear(); grid.querySelectorAll("button.card").forEach(paintCard); updateBar(); };
  $("send").onclick = send;
  $("chat").href = `https://wa.me/${PHONE}?text=${encodeURIComponent("היי, אשמח לשמוע עוד על הפריטים בארון ♡")}`;

  function visible() {
    return items.filter((it) =>
      (state.category === "הכל" || it.category === state.category) &&
      (state.availability === "all" || (state.availability === "sold") === !!it.sold) &&
      (!state.q || it.name.includes(state.q))
    );
  }

  function card(it) {
    const el = document.createElement(it.sold ? "div" : "button");
    el.className = "card" + (it.sold ? " sold" : "");
    el.dataset.id = it.id;
    if (!it.sold) {
      el.type = "button";
      // Only this card and the send bar change on tap; rebuilding the grid would reload every photo.
      el.onclick = () => {
        state.selected.has(it.id) ? state.selected.delete(it.id) : state.selected.add(it.id);
        paintCard(el);
        updateBar();
      };
    }
    const meta = it.size ? `${it.category} · מידה ${it.size}` : it.category;
    el.innerHTML = `
      <div class="photo">
        ${it.image ? `<img src="${it.image}" alt="" loading="lazy">` : `<span class="ph">${it.category}</span>`}
        ${it.sold ? '<span class="badge">נמכר ♡</span>' : ""}
        ${!it.sold ? '<span class="check"></span>' : ""}
      </div>
      <div class="info">
        <h3></h3>
        <p class="meta"></p>
        <p class="price">${it.sold ? "כבר מצא ארון חדש" : it.price + " ₪"}</p>
      </div>`;
    el.querySelector("h3").textContent = it.name;
    el.querySelector(".meta").textContent = meta;
    if (!it.sold) paintCard(el);
    return el;
  }

  function paintCard(el) {
    const on = state.selected.has(Number(el.dataset.id));
    el.classList.toggle("selected", on);
    el.setAttribute("aria-pressed", on);
    el.querySelector(".check").textContent = on ? "✓" : "+";
  }

  function render() {
    document.querySelectorAll(".chip").forEach((b) => b.classList.toggle("active", b.textContent === state.category));
    const list = visible();
    grid.replaceChildren(...list.map(card));
    $("empty").hidden = list.length > 0;
    $("count").textContent = `(${items.length} פריטים)`;
    updateBar();
  }

  function updateBar() {
    const sel = items.filter((i) => state.selected.has(i.id));
    $("sendbar").hidden = sel.length === 0;
    document.body.classList.toggle("has-bar", sel.length > 0);
    $("sel-count").textContent = sel.length === 1 ? "פריט אחד נבחר" : `${sel.length} פריטים נבחרו`;
    $("sel-total").textContent = `· ${sel.reduce((s, i) => s + (i.price || 0), 0)} ₪`;
  }

  function send() {
    const sel = items.filter((i) => state.selected.has(i.id));
    if (!sel.length) return;
    // U+200F (right-to-left mark) at the start of every line makes WhatsApp render each line RTL.
    // A second mark after the name keeps English words (e.g. "Levi's") from pulling the price into their
    // left-to-right run, which would otherwise show the price between the Hebrew and English words.
    const RLM = "\u200F";
    const lines = ["היי מאיהלי אשמח לקנות את הפריטים הבאים:", ...sel.map((i) => `${i.name}${RLM} - ${i.price} ₪`)];
    const text = lines.map((l) => RLM + l).join("\n");
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  render();
})();
