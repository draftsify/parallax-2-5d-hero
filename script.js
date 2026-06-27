/* ============================================================
   PARALLAX 2.5D — GSAP ScrollTrigger
   ------------------------------------------------------------
   Le hero est "pinned" (sticky) pendant ~150vh de scroll.
   Chaque calque bouge à sa propre vitesse (scrub) pour créer
   la profondeur. Voir les CONSTANTES ci-dessous pour ajuster.
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------
   RÉGLAGES — ajuste librement ces valeurs.
   ------------------------------------------------------------ */

// Durée du scroll de l'animation, en multiple de la hauteur du viewport.
// 0.85 = plus de course → apparition plus lente et progressive.
const PIN_DISTANCE = 0.85;

// Fraction de l'animation sur laquelle le dock apparaît.
// 0.92 = il se révèle sur presque tout le scroll → bien lent et étalé.
const DOCK_REVEAL = 0.92;
// Flou initial du dock (px) qui se résorbe pendant l'apparition (effet "depuis le flou").
const DOCK_BLUR = 18;

// Unité de référence du parallax (en px). Les multiplicateurs de vitesse
// ci-dessous sont appliqués à cette référence = 1 hauteur de viewport.
const PARALLAX_REF = () => window.innerHeight;

/* --- CIEL (calque de fond, très lent) --- */
// Vitesse de translation verticale du ciel (× la référence). ~0.11x = très lent.
const SKY_SPEED = 0.11;
// Scale final du ciel (effet d'éloignement subtil).
const SKY_SCALE = 1.04;

/* --- COLLINE (premier plan) --- */
// Vitesse de descente de la colline (× la référence). ~0.32x : elle descend
// juste assez pour révéler le dock centré, tout en restant TRÈS visible.
const MOUNTAIN_SPEED = 0.45;
// Scale final de la colline (léger, pour ne pas masquer le dock).
const MOUNTAIN_SCALE = 1.05;

/* --- TITRE (texte principal) --- */
// Le titre se fond + se floute quand on scrolle. Fraction de l'animation
// au bout de laquelle il a totalement disparu (0.42 = il s'efface tôt pour
// laisser la place au texte explicatif qui prend le relais au-dessus du dock).
const TITLE_FADE = 0.42;
// Flou max appliqué au titre quand il disparaît (px).
const TITLE_BLUR = 10;

/* --- TEXTE EXPLICATIF (lead) au-dessus du dock --- */
// Moment d'apparition (position sur la timeline) et durée du fondu.
// Démarre juste après l'effacement du titre → relais propre, sans chevauchement.
const LEAD_START = 0.44;
const LEAD_REVEAL = 0.5;
// Flou initial du texte explicatif (px), résorbé pendant l'apparition.
const LEAD_BLUR = 12;

/* --- FLEURS FLOTTANTES --- */
// Amplitude de la dérive verticale au scroll (× la référence), divisée par la
// "profondeur" data-depth de chaque fleur : les plus proches dérivent plus.
const PETAL_DRIFT = 0.16;

/* --- PANNEAU PRODUIT (glass, au milieu) --- */
// Translation verticale du panneau : de +100% (caché en bas, derrière la
// colline) à -20% (remonté au-dessus du centre).
const PANEL_FROM_Y = "100%";
const PANEL_TO_Y = "-20%";

/* ------------------------------------------------------------
   Sélecteurs
   ------------------------------------------------------------ */
const sky = ".layer--sky";
const mountain = ".layer--mountain";
const panel = "#product-panel";

/* ------------------------------------------------------------
   gsap.matchMedia() : 3 contextes (desktop / mobile / reduced-motion),
   chacun nettoyé automatiquement quand la media-query ne matche plus.
   ------------------------------------------------------------ */
// Hauteur de la piste de scroll = (1 + PIN_DISTANCE) × viewport.
// Une seule source de vérité : ajuste PIN_DISTANCE pour tout régler.
const sceneEl = document.querySelector(".scene");
if (sceneEl) sceneEl.style.height = (1 + PIN_DISTANCE) * 100 + "vh";

const mm = gsap.matchMedia();

/* ============================================================
   1) DESKTOP (>= 768px) + mouvement autorisé
      → expérience complète : pin + scrub.
   ============================================================ */
mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
  const tl = gsap.timeline({
    defaults: { duration: 1 }, // durée "de référence" de la timeline
    scrollTrigger: {
      // pas de pin : le hero est "sticky" (CSS), donc aucun espace blanc.
      trigger: ".scene",
      start: "top top",       // début quand la scene touche le haut
      end: "bottom bottom",   // fin exactement au bas de la scene (= fin du scroll)
      scrub: 1,               // lissage plus marque = apparition bien smooth
      invalidateOnRefresh: true,
      // markers: true, // ← décommente pour visualiser start/end en dev
    },
  });

  // CIEL : descend très lentement + léger scale (durée pleine = 1).
  tl.fromTo(
    sky,
    { y: 0, scale: 1 },
    {
      y: () => SKY_SPEED * PARALLAX_REF(),
      scale: SKY_SCALE,
      ease: "none",
    },
    0
  );

  // COLLINE : descend juste assez pour révéler le dock (durée pleine = 1).
  tl.fromTo(
    mountain,
    { y: 0, scale: 1 },
    {
      y: () => MOUNTAIN_SPEED * PARALLAX_REF(),
      scale: MOUNTAIN_SCALE,
      ease: "none",
    },
    0
  );

  // DOCK : apparition LENTE et étalée sur presque tout le scroll (DOCK_REVEAL),
  // avec remontée + fade + scale + flou qui se résorbe progressivement.
  tl.fromTo(
    panel,
    // x:0 / y:0 forcent GSAP à piloter le centrage en POURCENTAGE (xPercent/yPercent)
    // et non en pixels — sinon le translate(-50%,100%) du CSS laisse un résidu
    // qui bloque le dock trop bas.
    // Apparition douce : remonte + fade + léger scale + flou qui se résorbe.
    {
      xPercent: -50,
      yPercent: 100,
      x: 0,
      y: 0,
      opacity: 0,
      scale: 0.92,
      filter: "blur(" + DOCK_BLUR + "px)",
    },
    {
      xPercent: -50,
      yPercent: -50, // parfaitement centré dans le viewport
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      duration: DOCK_REVEAL,
      ease: "power2.out", // montee progressive et douce
    },
    0
  );

  // TITRE : se fond + se floute progressivement quand on scrolle.
  tl.fromTo(
    ".hero__title",
    { opacity: 1, filter: "blur(0px)" },
    {
      opacity: 0,
      filter: "blur(" + TITLE_BLUR + "px)",
      duration: TITLE_FADE,
      ease: "power1.in",
    },
    0
  );

  // TEXTE EXPLICATIF : prend le relais du titre, apparaît au-dessus du dock
  // (fondu + montée douce + flou qui se résorbe, comme le dock).
  tl.fromTo(
    ".hero__lead",
    { opacity: 0, y: 18, filter: "blur(" + LEAD_BLUR + "px)" },
    { opacity: 1, y: 0, filter: "blur(0px)", duration: LEAD_REVEAL, ease: "power2.out" },
    LEAD_START
  );

  // FLEURS : dérive verticale douce au scroll (parallaxe par profondeur).
  gsap.utils.toArray(".petal").forEach((p) => {
    const depth = parseFloat(p.dataset.depth) || 1;
    tl.fromTo(
      p,
      { y: 0 },
      { y: () => (PETAL_DRIFT * PARALLAX_REF()) / depth, ease: "none" },
      0
    );
  });

  // NUAGES : parallaxe verticale lente (fond, bougent peu).
  gsap.utils.toArray(".cloud").forEach((c) => {
    const depth = parseFloat(c.dataset.depth) || 1;
    tl.fromTo(
      c,
      { y: 0 },
      { y: () => (PETAL_DRIFT * 0.5 * PARALLAX_REF()) / depth, ease: "none" },
      0
    );
  });
});

/* ============================================================
   2) MOBILE (< 768px) + mouvement autorisé
      → pas de pin : juste un parallax léger pendant que le hero
        défile normalement.
   ============================================================ */
mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
  const tlMobile = gsap.timeline({
    defaults: { duration: 1 },
    scrollTrigger: {
      trigger: ".scene",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  // Ciel : très léger déplacement vers le bas.
  tlMobile.fromTo(
    sky,
    { y: 0, scale: 1 },
    { y: () => SKY_SPEED * 0.6 * PARALLAX_REF(), scale: SKY_SCALE, ease: "none" },
    0
  );

  // Colline : descente sobre (mobile).
  tlMobile.fromTo(
    mountain,
    { y: 0, scale: 1 },
    { y: () => MOUNTAIN_SPEED * 0.8 * PARALLAX_REF(), scale: MOUNTAIN_SCALE, ease: "none" },
    0
  );

  // Dock : remonte, se centre, fade + scale + flou qui se résorbe (comme desktop).
  tlMobile.fromTo(
    panel,
    { xPercent: -50, yPercent: 100, x: 0, y: 0, opacity: 0, scale: 0.92, filter: "blur(" + DOCK_BLUR + "px)" },
    { xPercent: -50, yPercent: -50, opacity: 1, scale: 1, filter: "blur(0px)", duration: DOCK_REVEAL, ease: "power2.out" },
    0
  );

  // Titre : fondu + flou.
  tlMobile.fromTo(
    ".hero__title",
    { opacity: 1, filter: "blur(0px)" },
    { opacity: 0, filter: "blur(" + TITLE_BLUR + "px)", duration: TITLE_FADE, ease: "power1.in" },
    0
  );

  // Texte explicatif : prend le relais du titre au-dessus du dock (avec flou).
  tlMobile.fromTo(
    ".hero__lead",
    { opacity: 0, y: 18, filter: "blur(" + LEAD_BLUR + "px)" },
    { opacity: 1, y: 0, filter: "blur(0px)", duration: LEAD_REVEAL, ease: "power2.out" },
    LEAD_START
  );

  // FLEURS : dérive plus discrète sur mobile.
  gsap.utils.toArray(".petal").forEach((p) => {
    const depth = parseFloat(p.dataset.depth) || 1;
    tlMobile.fromTo(
      p,
      { y: 0 },
      { y: () => (PETAL_DRIFT * 0.6 * PARALLAX_REF()) / depth, ease: "none" },
      0
    );
  });

  // NUAGES : parallaxe encore plus discrète sur mobile.
  gsap.utils.toArray(".cloud").forEach((c) => {
    const depth = parseFloat(c.dataset.depth) || 1;
    tlMobile.fromTo(
      c,
      { y: 0 },
      { y: () => (PETAL_DRIFT * 0.3 * PARALLAX_REF()) / depth, ease: "none" },
      0
    );
  });
});

/* ============================================================
   3) prefers-reduced-motion : reduce
      → aucune animation. On affiche simplement la première frame
        (état initial du CSS). Rien à faire en JS.
   ============================================================ */
mm.add("(prefers-reduced-motion: reduce)", () => {
  // Volontairement vide : la première frame est rendue par le CSS.
});

/* ============================================================
   Intro globale : toute la scène se révèle depuis un léger flou au
   chargement (fondu + flou qui se résorbe + micro-zoom). clearProps
   retire le filtre à la fin pour que le backdrop-filter du dock
   (liquid glass) refonctionne normalement ensuite.
   ============================================================ */
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.set(".hero__stage", { autoAlpha: 0, filter: "blur(24px)", scale: 1.035 });
  gsap.to(".hero__stage", {
    autoAlpha: 1,
    filter: "blur(0px)",
    scale: 1,
    duration: 1.2,
    ease: "power2.out",
    clearProps: "filter,transform",
  });
}

/* ============================================================
   Intro navbar : la barre glass glisse + apparaît au chargement
   (les enfants se posent en léger décalé). Désactivé si reduced-motion.
   ============================================================ */
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro.from(".nav__inner", { y: -22, opacity: 0, filter: "blur(10px)", duration: 0.9, delay: 0.1, clearProps: "filter" });
  intro.from(
    ".nav__inner > *",
    { y: -8, opacity: 0, duration: 0.6, stagger: 0.07 },
    "-=0.45"
  );
}

/* ============================================================
   Interactivité du dock : au clic sur un onglet, on active l'onglet
   ET on affiche le panneau correspondant (data-tab ↔ data-panel).
   Tous les panneaux ont la même structure → aucun saut de hauteur,
   tout reste exactement en place ; seul le contenu change (fondu).
   ============================================================ */
const dockTabs = document.querySelectorAll(".dock-tab");
const dockPanels = document.querySelectorAll(".dock-panel");
dockTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    dockTabs.forEach((t) => t.classList.toggle("is-active", t === tab));
    dockPanels.forEach((p) =>
      p.classList.toggle("is-active", p.dataset.panel === target)
    );
    if (window.closeTokenMenu) window.closeTokenMenu();
  });
});

/* ============================================================
   DÉMO INTERACTIVE DU DOCK — 100% front, AUCUN backend.
   Montant éditable, sélecteur de token, bouton Max, taux & total en
   direct, destinataire éditable, puis CTA → modale récap → traitement
   → succès. Rien n'est envoyé nulle part : tout est simulé côté client.
   ============================================================ */
(function dockDemo() {
  // Taux indicatifs (EUR par unité) — purement décoratifs.
  const RATES = { USDC: 0.93, USDT: 0.93, ETH: 2950, BTC: 58000, SOL: 135, EUR: 1, USD: 0.92, GBP: 1.17 };
  // Soldes fictifs par token (pour "Max" et l'affichage Balance).
  const BALANCES = { USDC: 24983.21, USDT: 12050, ETH: 8.42, BTC: 1.284, SOL: 96.5 };
  // Jeux de tokens proposés selon le type de panneau.
  const TOKEN_SETS = { crypto: ["USDC", "USDT", "ETH", "BTC", "SOL"], fiat: ["EUR", "USD", "GBP"] };

  // --- Formatage ---
  const fmtEUR = (n) => "€" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtNum = (n) => n.toLocaleString("en-US", { maximumFractionDigits: 6 });
  const fmtRate = (t) => {
    const r = RATES[t] || 1;
    const d = r >= 100 ? 0 : 2;
    return "≈ €" + r.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) + " / " + t;
  };
  const parseAmt = (el) => {
    const v = parseFloat((el && el.value ? el.value : "").replace(/,/g, "").trim());
    return isFinite(v) && v > 0 ? v : 0;
  };
  const rndHex = (n) => Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

  // --- Petits SVG inline réutilisés dans la modale ---
  const ARROW = '<svg viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const LOCK = '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  const ICONS = {
    buy: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 7h13l-1.4 8.4a2 2 0 0 1-2 1.6H9.3a2 2 0 0 1-2-1.6L5.5 5H3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.3" fill="currentColor"/><circle cx="17" cy="20" r="1.3" fill="currentColor"/></svg>',
    sell: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 21V5m0 0l-6 6m6-6l6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none"><path d="M21 4L3 11l7 3 3 7 8-17z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M3 10h18" stroke="currentColor" stroke-width="1.7"/></svg>',
    auth: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8.5" r="3.5" stroke="currentColor" stroke-width="1.7"/><path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  };

  /* -------- Mise à jour live d'un panneau (taux, total, solde) -------- */
  function refreshPanel(panel) {
    if (!panel) return;
    const action = panel.dataset.panel;
    const token = panel.querySelector(".token-select").dataset.token;
    const amt = parseAmt(panel.querySelector(".dock-card__amount"));
    const rate = RATES[token] || 1;

    const rateEl = panel.querySelector(".dock-card__rate");
    if (rateEl) rateEl.textContent = fmtRate(token);

    const feeEl = panel.querySelector(".dock-fee__val");
    if (feeEl && (action === "buy" || action === "sell")) feeEl.textContent = fmtEUR(amt * rate);

    const balEl = panel.querySelector(".dock-card__bal");
    if (balEl && BALANCES[token] != null) balEl.textContent = fmtNum(BALANCES[token]);
  }

  /* -------- Saisie du montant -------- */
  document.querySelectorAll(".dock-card__amount").forEach((input) => {
    input.addEventListener("input", () => {
      // On ne garde que chiffres + un séparateur décimal.
      input.value = input.value.replace(/[^\d.,]/g, "");
      refreshPanel(input.closest(".dock-panel"));
    });
  });

  /* -------- Bouton Max -------- */
  document.querySelectorAll(".max-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.closest(".dock-panel");
      const token = panel.querySelector(".token-select").dataset.token;
      const bal = BALANCES[token];
      if (bal == null) return;
      panel.querySelector(".dock-card__amount").value = fmtNum(bal);
      refreshPanel(panel);
    });
  });

  /* -------- Sélecteur de token (menu déroulant) -------- */
  let openMenuBtn = null;
  function closeTokenMenu() {
    document.querySelectorAll(".token-menu").forEach((m) => m.remove());
    if (openMenuBtn) openMenuBtn.classList.remove("is-open");
    openMenuBtn = null;
  }
  function openTokenMenu(btn) {
    const panel = btn.closest(".dock-panel");
    const set = TOKEN_SETS[panel.dataset.tokens] || TOKEN_SETS.crypto;
    const current = btn.dataset.token;
    const menu = document.createElement("div");
    menu.className = "token-menu";
    menu.setAttribute("role", "listbox");
    menu.innerHTML = set
      .map(
        (t) =>
          '<button type="button" role="option" class="token-menu__item' +
          (t === current ? " is-selected" : "") +
          '" data-token="' + t + '"><span>' + t + "</span>" +
          '<svg class="tick" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
      )
      .join("");
    // Ancré en position:fixed sur <body> → échappe au contexte d'empilement du
    // dock (sinon il passe sous la ligne de frais / le CTA).
    document.body.appendChild(menu);
    const r = btn.getBoundingClientRect();
    menu.style.top = r.bottom + 8 + "px";
    menu.style.right = window.innerWidth - r.right + "px";
    btn.classList.add("is-open");
    openMenuBtn = btn;

    menu.querySelectorAll(".token-menu__item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const t = item.dataset.token;
        btn.dataset.token = t;
        btn.querySelector(".token-select__name").textContent = t;
        // Si le solde change de token, on vide le montant pour éviter une valeur incohérente.
        panel.querySelector(".dock-card__amount").value = "";
        refreshPanel(panel);
        closeTokenMenu();
      });
    });
  }
  document.querySelectorAll(".token-select").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasOpen = openMenuBtn === btn;
      closeTokenMenu();
      if (!wasOpen) openTokenMenu(btn);
    });
  });
  // clic ailleurs → ferme le menu
  document.addEventListener("click", () => closeTokenMenu());
  // scroll → ferme le menu (il est en position:fixed, il ne suivrait pas le dock)
  window.addEventListener("scroll", () => closeTokenMenu(), { passive: true });

  /* ============================================================
     MODALE
     ============================================================ */
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");
  let confirmFn = null; // action à exécuter au clic "Confirmer"

  function openModal(html, onConfirm) {
    confirmFn = onConfirm || null;
    modalContent.innerHTML = html;
    modal.hidden = false;
    modal.classList.remove("is-closing");
    document.documentElement.style.overflow = "hidden";
    const focusable = modalContent.querySelector("input, button");
    if (focusable && focusable.tagName === "INPUT") focusable.focus();
  }
  function setModal(html, onConfirm) {
    confirmFn = onConfirm || null;
    modalContent.innerHTML = html;
  }
  function closeModal() {
    modal.classList.add("is-closing");
    setTimeout(() => {
      modal.hidden = true;
      modal.classList.remove("is-closing");
      modalContent.innerHTML = "";
      document.documentElement.style.overflow = "";
      confirmFn = null;
    }, 240);
  }
  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
  modalContent.addEventListener("click", (e) => {
    // Segmented control : choix SEPA / carte one-time.
    const seg = e.target.closest("[data-pay]");
    if (seg) {
      seg.parentElement.querySelectorAll("[data-pay]").forEach((o) => o.classList.remove("is-on"));
      seg.classList.add("is-on");
      const detail = modalContent.querySelector("#pay-detail span");
      if (detail) detail.textContent = seg.dataset.detail;
      return;
    }
    // Membership : génère une nouvelle carte à usage unique.
    const nc = e.target.closest("[data-newcard]");
    if (nc) {
      const numEl = modalContent.querySelector(".m-card__num");
      if (numEl) {
        numEl.textContent = "•••• •••• •••• " + (1000 + Math.floor(Math.random() * 9000));
        numEl.classList.remove("flash");
        void numEl.offsetWidth;
        numEl.classList.add("flash");
      }
      return;
    }
    const btn = e.target.closest("[data-modal-action]");
    if (!btn) return;
    if (btn.dataset.modalAction === "cancel") closeModal();
    else if (btn.dataset.modalAction === "confirm" && confirmFn) confirmFn();
  });

  // Briques de contenu
  const head = (icon, title, sub) =>
    '<div class="m-head"><div class="m-icon">' + icon + '</div><h3 class="m-title" id="modal-title">' +
    title + '</h3><p class="m-sub">' + sub + "</p></div>";
  const rows = (arr) =>
    '<div class="m-rows">' +
    arr.map((r) => '<div class="m-row' + (r[2] ? " m-row--total" : "") + '"><span class="m-row__k">' + r[0] + '</span><span class="m-row__v">' + r[1] + "</span></div>").join("") +
    "</div>";
  const confirmActions = (label) =>
    '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-modal-action="confirm"><span class="btn__label">' +
    label + '</span><span class="btn__icon">' + ARROW + '</span></button>' +
    '<button type="button" class="m-ghost" data-modal-action="cancel">Cancel</button></div>';
  const privacyNote = (txt) => '<p class="m-note">' + LOCK + "<span>" + txt + "</span></p>";
  const processing = (label, sub) =>
    '<div class="m-state"><div class="m-spin"></div><p class="m-title" style="font-size:18px">' +
    label + '</p><p class="m-sub">' + (sub || "Routing through the privacy layer…") + "</p></div>";
  const successHead = (title, sub) =>
    '<div class="m-state"><div class="m-check">' + CHECK + '</div><h3 class="m-title" id="modal-title">' +
    title + '</h3><p class="m-sub">' + sub + "</p></div>";
  const doneBtn = (label) => '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-close><span class="btn__label">' + (label || "Done") + '</span></button></div>';

  /* Sélecteur de moyen de paiement : SEPA ou carte à usage unique.
     kind="pay" pour un achat, "payout" pour un encaissement (vente). */
  function paySelector(kind) {
    const c4 = 1000 + Math.floor(Math.random() * 9000); // n° de carte one-time fictif
    const sepaTxt = kind === "payout"
      ? "SEPA transfer — in your account in minutes"
      : "SEPA transfer — settles instantly, no card needed";
    const cardTxt = kind === "payout"
      ? "Single-use card · •••• " + c4 + " · spend anywhere"
      : "Single-use card · •••• " + c4 + " · burned after payment";
    const label = kind === "payout" ? "Payout to" : "Pay with";
    return (
      '<div class="m-pay"><span class="m-pay__k">' + label + '</span>' +
      '<div class="m-seg" role="radiogroup" aria-label="' + label + '">' +
      '<button type="button" class="m-seg__opt is-on" data-pay="sepa" data-detail="' + sepaTxt + '">SEPA</button>' +
      '<button type="button" class="m-seg__opt" data-pay="card" data-detail="' + cardTxt + '">One-time card</button>' +
      '</div></div>' +
      '<p class="m-pay__detail" id="pay-detail">' + LOCK + "<span>" + sepaTxt + "</span></p>"
    );
  }
  // Renvoie le libellé du moyen choisi dans la modale courante.
  function chosenPay() {
    const on = modalContent.querySelector(".m-seg__opt.is-on");
    return on && on.dataset.pay === "card" ? "One-time card" : "SEPA";
  }

  // Lance traitement → succès après ~1.5 s
  function runFlow(processingLabel, buildSuccess) {
    setModal(processing(processingLabel));
    setTimeout(() => setModal(buildSuccess()), 1500);
  }
  // Enchaîne plusieurs étapes de traitement (ex. mix CEX → vente) puis le succès.
  function runSteps(labels, buildSuccess) {
    let i = 0;
    setModal(processing(labels[0]));
    const advance = () => {
      i++;
      if (i < labels.length) { setModal(processing(labels[i])); setTimeout(advance, 1200); }
      else setTimeout(() => setModal(buildSuccess()), 300);
    };
    setTimeout(advance, 1200);
  }

  /* -------- Ouverture d'une transaction (buy / sell / send) -------- */
  function openTransaction(action, panel) {
    const token = panel.querySelector(".token-select").dataset.token;
    const amtInput = panel.querySelector(".dock-card__amount");
    const amt = parseAmt(amtInput);
    const rate = RATES[token] || 1;

    // Validation : montant requis.
    if (amt <= 0) {
      amtInput.classList.remove("shake");
      void amtInput.offsetWidth; // reflow → rejoue l'animation
      amtInput.classList.add("shake");
      amtInput.focus();
      return;
    }
    // Send : destinataire requis.
    let recipient = "";
    if (action === "send") {
      const rEl = panel.querySelector(".dock-fee__input");
      recipient = (rEl.value || "").trim();
      if (!recipient) {
        rEl.classList.remove("shake");
        void rEl.offsetWidth;
        rEl.classList.add("shake");
        rEl.focus();
        return;
      }
    }

    const eur = amt * rate;
    const ref = "PVX-" + rndHex(6).toUpperCase();

    if (action === "buy") {
      openModal(
        head(ICONS.buy, "Review your purchase", "No account, no KYC — pay and go.") +
          rows([
            ["You buy", fmtNum(amt) + " " + token],
            ["Rate", fmtRate(token).replace("≈ ", "")],
            ["You pay", fmtEUR(eur), true],
          ]) +
          paySelector("pay") +
          confirmActions("Confirm & Buy") +
          privacyNote("End-to-end private — no identity check"),
        () => {
          const via = chosenPay();
          runFlow("Buying privately…", () =>
            successHead("Purchase complete", fmtNum(amt) + " " + token + " is now in your private balance.") +
            rows([["Paid", fmtEUR(eur)], ["Via", via], ["Reference", ref]]) +
            doneBtn("Done")
          );
        }
      );
    } else if (action === "sell") {
      openModal(
        head(ICONS.sell, "Review your sale", "Mixed through a CEX, then sold — untraceable.") +
          rows([
            ["You sell", fmtNum(amt) + " " + token],
            ["Rate", fmtRate(token).replace("≈ ", "")],
            ["You receive", fmtEUR(eur), true],
          ]) +
          paySelector("payout") +
          confirmActions("Confirm & Sell") +
          privacyNote("Routed through a mixer — no link to you"),
        () => {
          const via = chosenPay();
          runSteps(["Mixing through a CEX…", "Selling privately…"], () =>
            successHead(
              "Sale complete",
              via === "One-time card"
                ? fmtEUR(eur) + " loaded onto your one-time card."
                : fmtEUR(eur) + " is on its way by SEPA."
            ) +
            rows([["Sold", fmtNum(amt) + " " + token], ["Payout", via], ["Reference", ref]]) +
            doneBtn("Done")
          );
        }
      );
    } else if (action === "send") {
      const short = recipient.length > 22 ? recipient.slice(0, 10) + "…" + recipient.slice(-6) : recipient;
      openModal(
        head(ICONS.send, "Review transfer", "Sent over a stealth address.") +
          rows([
            ["You send", fmtNum(amt) + " " + token],
            ["To", short],
            ["Network fee", fmtEUR(0)],
          ]) +
          confirmActions("Confirm & Send") +
          privacyNote("Untraceable — no link to your wallet"),
        () =>
          runFlow("Sending privately…", () =>
            successHead("Transfer sent", fmtNum(amt) + " " + token + " delivered to " + short + ".") +
            rows([["Reference", ref]]) +
            doneBtn("Done")
          )
      );
    }
  }

  /* -------- Membership (carte anonyme, inscription) -------- */
  function openMembership(panel) {
    const amt = parseAmt(panel.querySelector(".dock-card__amount"));
    const handle = "ghost-" + rndHex(4);
    const topupRow = amt > 0 ? [["Initial top-up", fmtEUR(amt)]] : [];
    openModal(
      head(ICONS.card, "Become a member", "Mint one-time cards on demand — no email, no KYC.") +
        '<div class="m-field"><label>Your member handle</label><input class="m-input" value="@' + handle + '" readonly></div>' +
        '<div class="m-field"><label>Set a passphrase</label><input class="m-input" type="password" placeholder="••••••••" autocomplete="new-password"></div>' +
        rows([["Cards", "Unlimited one-time"], ["Funding", "SEPA / crypto"], ...topupRow, ["Due today", fmtEUR(0), true]]) +
        confirmActions("Create membership") +
        privacyNote("Your identity is never collected"),
      () =>
        runFlow("Creating your membership…", () => {
          const num = "•••• •••• •••• " + (1000 + Math.floor(Math.random() * 9000));
          return (
            successHead("Welcome aboard", "Mint a fresh single-use card whenever you spend.") +
            '<div class="m-card"><div class="m-card__top"><span>ONE-TIME</span>' + LOCK + '</div>' +
            '<div class="m-card__num">' + num + '</div>' +
            '<div class="m-card__bottom"><span>@' + handle + '</span><span>SINGLE-USE</span></div></div>' +
            '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-newcard><span class="btn__label">Create one-time card</span><span class="btn__icon">' + ARROW + '</span></button>' +
            '<button type="button" class="m-ghost" data-close>Done</button></div>'
          );
        })
    );
  }

  /* -------- Branchement des CTA du dock -------- */
  document.querySelectorAll(".dock-panel").forEach((panel) => {
    const cta = panel.querySelector(".dock-cta");
    if (!cta) return;
    cta.addEventListener("click", () => {
      const action = panel.dataset.panel;
      if (action === "card") openMembership(panel);
      else openTransaction(action, panel);
    });
  });

  /* -------- Boutons navbar : Open app / Sign up (auth anonyme) -------- */
  function openAuth(mode) {
    const isSignup = mode === "signup";
    openModal(
      head(ICONS.auth, isSignup ? "Create your account" : "Open your account", "No email, no KYC — just a handle.") +
        '<div class="m-field"><label>' + (isSignup ? "Choose a handle" : "Your handle") + '</label><input class="m-input" placeholder="@yourhandle" autocomplete="off"></div>' +
        '<div class="m-field"><label>Passphrase</label><input class="m-input" type="password" placeholder="••••••••" autocomplete="' + (isSignup ? "new-password" : "current-password") + '"></div>' +
        '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-modal-action="confirm"><span class="btn__label">' +
        (isSignup ? "Create account" : "Open app") + '</span><span class="btn__icon">' + ARROW + '</span></button></div>' +
        privacyNote("Anonymous by design"),
      () =>
        runFlow(isSignup ? "Creating your account…" : "Opening your account…", () =>
          successHead(isSignup ? "You're in" : "Welcome back", isSignup ? "Your private account is ready." : "Your private account is unlocked.") +
          doneBtn(isSignup ? "Get started" : "Continue")
        )
    );
  }
  document.querySelectorAll("[data-auth]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openAuth(el.dataset.auth);
    });
  });

  // expose pour le handler d'onglets (fermeture du menu token au switch)
  window.closeTokenMenu = closeTokenMenu;

  // Init : valeurs cohérentes au chargement.
  document.querySelectorAll(".dock-panel").forEach(refreshPanel);
})();

/* ============================================================
   Flottement idle continu des fleurs : oscillation douce + légère
   rotation, en boucle (yoyo). Appliqué à l'<img> intérieur → indépendant
   de la parallaxe au scroll portée par le wrapper .petal. Les fleurs les
   plus proches (data-depth faible) flottent d'une amplitude plus large.
   Désactivé si l'utilisateur préfère réduire les animations.
   ============================================================ */
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.utils.toArray(".petal").forEach((p, i) => {
    const inner = p.querySelector(".petal__inner");
    const depth = parseFloat(p.dataset.depth) || 1;
    const amp = 3 + 5 / depth; // amplitude très légère (px)
    const rot = 3 / depth; // rotation discrète (deg)

    // Flottement : oscillation douce de position + rotation (sur .petal__inner).
    gsap.fromTo(
      inner,
      { y: -amp / 2, x: -amp * 0.25, rotation: -rot },
      {
        y: amp / 2,
        x: amp * 0.25,
        rotation: rot,
        duration: 5 + (i % 5) * 0.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.4,
      }
    );

    // Fondu : respiration d'opacité, sur un rythme différent → effet organique.
    gsap.fromTo(
      inner,
      { autoAlpha: 1 },
      {
        autoAlpha: 0.45,
        duration: 3.5 + (i % 4) * 0.9,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.6,
      }
    );
  });
}

/* ============================================================
   FLOU DE MOUVEMENT AU SCROLL : un flou directionnel piloté par la
   VITESSE de scroll est appliqué aux calques en mouvement (ciel, colline,
   fleurs, nuages) — jamais au dock ni au texte (qui restent nets), et
   jamais à .hero__stage (sinon le backdrop-filter du dock casserait).
   Plus on scrolle vite, plus ça floute ; au repos, ça revient à net.
   ============================================================ */
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const blurTargets = gsap.utils.toArray([
    ".layer--sky",
    ".layer--mountain",
    ".petals",
    ".clouds",
  ]);
  const state = { blur: 0 };
  const render = () => {
    const f = state.blur > 0.06 ? "blur(" + state.blur.toFixed(2) + "px)" : "none";
    for (const el of blurTargets) el.style.filter = f;
  };
  let resetTween;
  ScrollTrigger.create({
    trigger: ".scene",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      // getVelocity() ≈ px/s ; on plafonne le flou à 6px pour rester lisible.
      const target = Math.min(Math.abs(self.getVelocity()) / 460, 6);
      if (target > state.blur) {
        gsap.to(state, {
          blur: target,
          duration: 0.12,
          ease: "power1.out",
          overwrite: true,
          onUpdate: render,
        });
      }
      // À chaque frame on (re)programme le retour au net : dès que le scroll
      // ralentit/s'arrête, ce tween reprend la main et résorbe le flou.
      resetTween && resetTween.kill();
      resetTween = gsap.to(state, {
        blur: 0,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.05,
        onUpdate: render,
      });
    },
  });
}

/* ============================================================
   Nuages : dérive horizontale lente et continue (sur l'<img> intérieur),
   indépendante de la parallaxe au scroll portée par le wrapper .cloud.
   ============================================================ */
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.utils.toArray(".cloud").forEach((c, i) => {
    const img = c.querySelector("img");
    const depth = parseFloat(c.dataset.depth) || 1;
    const dx = 34 / depth; // dérive horizontale (px) — les plus proches bougent plus
    gsap.fromTo(
      img,
      { x: -dx / 2 },
      {
        x: dx / 2,
        duration: 20 + i * 5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 1.5,
      }
    );
  });
}
