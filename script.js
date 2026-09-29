(() => {
  "use strict";

  const sections = Array.isArray(window.ATLAS_SECTIONS) ? window.ATLAS_SECTIONS : [];
  const byId = (id) => document.getElementById(id);
  const trailNav = byId("trailNav");
  const chapterGrid = byId("chapterGrid");
  const activeTrail = byId("activeTrail");
  const results = byId("results");
  const noResults = byId("noResults");
  const search = byId("search");
  const clearSearch = byId("clearSearch");
  const reset = byId("reset");
  const dialog = byId("topicDialog");
  const dialogContent = byId("dialogContent");
  const dialogClose = byId("dialogClose");

  const trails = [
    ["todos", "Todas", "Toda a biblioteca do Atlas."],
    ["fundamentos", "01 · Fundamentos", "O que é IA, ML e redes neurais."],
    ["generativa", "02 · IA generativa", "LLMs, tokens e Transformers."],
    ["sistemas", "03 · Sistemas de IA", "RAG, agentes e infraestrutura."],
    ["riscos", "04 · Riscos e responsabilidade", "Erros, viés, privacidade e segurança."],
    ["estudhub", "05 · IA no EstudHub", "IA aplicada ao ciclo de criação."],
    ["por_dentro", "06 · Por dentro dos modelos", "Logits, contexto e arquitetura."],
    ["projeto", "07 · Produto e aplicação", "Glossário, mitos e futuro."],
    ["site", "08 · Conteúdo do próprio site", "Narrativa do projeto."],
    ["usar_ia", "09 · Como usar IA", "Expansões práticas além do material-base."]
  ];

  const gloss = [
    ["IA", "Inteligência Artificial"], ["ML", "Machine Learning / aprendizado de máquina"], ["DL", "Deep Learning / aprendizado profundo"],
    ["LLM", "Large Language Model"], ["Token", "Unidade de informação processada pelo modelo"], ["Embedding", "Representação numérica usada para capturar relações"],
    ["Transformer", "Arquitetura baseada em atenção"], ["RAG", "Retrieval-Augmented Generation"], ["Agente", "Sistema que pode planejar e usar ferramentas"],
    ["Logit", "Valor de saída antes da transformação em probabilidade"], ["Softmax", "Função que converte logits em distribuição de probabilidade"], ["Fine-tuning", "Treinamento adicional para adaptar um modelo"]
  ];

  let activeTrailKey = "todos";
  let query = "";
  let listMode = false;

  const normalize = (v) => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");

  function trailFor(key) { return trails.find(t => t[0] === key) || trails[0]; }

  function matches(section) {
    const cat = activeTrailKey === "todos" || section.group === activeTrailKey;
    const q = normalize(query);
    if (!q) return cat;
    const hay = normalize([section.num, section.title, section.groupLabel, section.plain].join(" "));
    return cat && hay.includes(q);
  }

  function renderTrailNav() {
    trailNav.innerHTML = trails.map(([key, label]) => `
      <button class="trail-button ${activeTrailKey === key ? "active" : ""}" data-trail="${key}" type="button" aria-pressed="${activeTrailKey === key}">
        <span class="trail-line"></span><span>${label}</span>
      </button>`).join("");
  }

  function renderCards() {
    const filtered = sections.filter(matches);
    const [label, desc] = trailFor(activeTrailKey).slice(1);
    activeTrail.innerHTML = `<div><span class="trail-pill">${label}</span><p>${desc}</p></div>`;
    results.textContent = `${filtered.length} ${filtered.length === 1 ? "tópico" : "tópicos"}${query ? ` para “${query}”` : ""}`;

    chapterGrid.classList.toggle("list-mode", listMode);
    chapterGrid.innerHTML = filtered.map((s, idx) => `
      <article class="chapter-card" data-id="${s.num}" style="--delay:${Math.min(idx, 8) * 35}ms">
        <div class="chapter-card-top"><span class="chapter-number">${String(s.num).padStart(2,"0")}</span><span class="chapter-group">${s.groupLabel}</span></div>
        <h3>${s.title}</h3>
        <p>${s.plain.slice(0, 158)}${s.plain.length > 158 ? "…" : ""}</p>
        <button type="button" class="read-topic" data-open-topic="${s.num}">Explorar tópico <span>→</span></button>
      </article>`).join("");

    noResults.hidden = filtered.length !== 0;
  }

  function renderGlossary() {
    byId("glossaryGrid").innerHTML = gloss.map(([term, desc]) => `<button class="glossary-item" type="button" data-gloss="${term}"><b>${term}</b><span>${desc}</span></button>`).join("");
  }

  function renderEstudHub() {
    const hub = sections.filter(s => s.group === "estudhub").slice(0, 13);
    byId("estudTimeline").innerHTML = hub.map((s, i) => `
      <article class="timeline-item ${i % 2 ? "right" : "left"}">
        <div class="timeline-dot">${String(i + 1).padStart(2,"0")}</div>
        <div class="timeline-card"><span>${s.title.startsWith("Etapa") ? "PROCESSO" : "VISÃO"}</span><h3>${s.title}</h3><p>${s.plain.slice(0, 180)}${s.plain.length > 180 ? "…" : ""}</p><button class="read-topic" data-open-topic="${s.num}" type="button">Ver no Atlas →</button></div>
      </article>`).join("");
  }

  function openTopic(id) {
    const s = sections.find(x => String(x.num) === String(id));
    if (!s) return;
    dialogContent.innerHTML = `
      <div class="dialog-meta"><span>${String(s.num).padStart(2,"0")}</span><em>${s.groupLabel}</em></div>
      <h1>${s.title}</h1>
      ${s.body}
      ${Array.isArray(s.sources) && s.sources.length ? `<div class="dialog-sources"><b>Referências</b>${s.sources.map(url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url} ↗</a>`).join("")}</div>` : ""}`;
    dialog.showModal();
    dialog.querySelector(".dialog-shell").scrollTop = 0;
  }

  trailNav.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-trail]"); if (!btn) return;
    activeTrailKey = btn.dataset.trail; renderTrailNav(); renderCards();
    byId("explorer").scrollIntoView({behavior:"smooth", block:"start"});
  });

  [chapterGrid, byId("estudTimeline")].forEach(area => area.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open-topic]"); if (!btn) return;
    openTopic(btn.dataset.openTopic);
  }));

  byId("glossaryGrid").addEventListener("click", (e) => {
    const item = e.target.closest("[data-gloss]"); if (!item) return;
    const term = item.dataset.gloss;
    search.value = term; query = term; activeTrailKey = "todos"; renderTrailNav(); renderCards();
    byId("explorer").scrollIntoView({behavior:"smooth", block:"start"});
  });

  search.addEventListener("input", () => { query = search.value.trim(); renderCards(); });
  clearSearch.addEventListener("click", () => { search.value = ""; query = ""; renderCards(); search.focus(); });
  reset.addEventListener("click", () => { search.value = ""; query = ""; activeTrailKey = "todos"; renderTrailNav(); renderCards(); });

  document.querySelectorAll(".view-btn").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active")); btn.classList.add("active"); listMode = btn.dataset.view === "list"; renderCards();
  }));

  dialogClose.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && dialog.open) dialog.close(); });

  const navMenu = byId("navMenu");
  navMenu.addEventListener("click", () => {
    const open = navMenu.getAttribute("aria-expanded") !== "true";
    navMenu.setAttribute("aria-expanded", String(open)); document.body.classList.toggle("nav-open", open);
  });
  document.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => { navMenu.setAttribute("aria-expanded","false"); document.body.classList.remove("nav-open"); }));

  const toTop = byId("toTop");
  window.addEventListener("scroll", () => toTop.classList.toggle("show", window.scrollY > 700), {passive:true});
  toTop.addEventListener("click", () => window.scrollTo({top:0,behavior:"smooth"}));

  const io = "IntersectionObserver" in window ? new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }}), {threshold:.12}) : null;
  document.querySelectorAll(".manifesto-card,.lab-card,.timeline-item,.hub-principles > div,.source-grid > a").forEach(el => io ? io.observe(el) : el.classList.add("in"));

  byId("metricChapters").textContent = sections.length;
  renderTrailNav(); renderCards(); renderGlossary(); renderEstudHub();
})();
