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
    wallet: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" stroke-width="1.7"/><path d="M3 10h18" stroke="currentColor" stroke-width="1.7"/><circle cx="17" cy="14.5" r="1.2" fill="currentColor"/></svg>',
    deposit: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 4v11m0 0l-4-4m4 4l4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 19h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none"><circle cx="8" cy="15" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M11 12l8-8m-3 0h3v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  /* Logos crypto / symboles fiat (cercles de marque, 18px). */
  const TOKEN_ICONS = {
    BTC: '<svg class="tok-logo" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#F7931A"/><path d="M21.6 14.3c.25-1.7-1-2.6-2.8-3.2l.57-2.3-1.4-.35-.56 2.24c-.37-.09-.75-.18-1.13-.26l.56-2.25-1.4-.35-.57 2.3-2.83-.7-.37 1.5s1.04.24 1.02.25c.57.14.67.52.65.82l-1.56 6.25c-.07.17-.24.43-.64.33.01.02-1.02-.25-1.02-.25l-.7 1.6 2.74.68-.58 2.34 1.4.35.57-2.3c.38.1.75.2 1.11.29l-.57 2.29 1.4.35.58-2.33c2.39.45 4.19.27 4.94-1.9.61-1.74-.03-2.75-1.29-3.4.92-.21 1.61-.82 1.79-2.06zm-3.2 4.5c-.43 1.74-3.36.8-4.31.56l.76-3.06c.95.24 4 .71 3.55 2.5zm.43-4.53c-.39 1.58-2.83.78-3.62.58l.69-2.77c.79.2 3.34.56 2.93 2.19z" fill="#fff"/></svg>',
    ETH: '<svg class="tok-logo" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#627EEA"/><g fill="#fff"><path fill-opacity=".6" d="M16.1 5l-.18.6v13.06l.18.18 6.06-3.58z"/><path d="M16.1 5L10.05 15.26l6.06 3.58V5z"/><path fill-opacity=".6" d="M16.1 19.97l-.1.13v4.65l.1.3 6.07-8.55z"/><path d="M16.1 25.05v-5.08l-6.05-3.47z"/><path fill-opacity=".2" d="M16.1 18.84l6.06-3.58-6.06-2.76z"/><path fill-opacity=".6" d="M10.05 15.26l6.06 3.58v-6.34z"/></g></svg>',
    SOL: '<svg class="tok-logo" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#0b0b0f"/><defs><linearGradient id="solg" x1="6" y1="22" x2="24" y2="10" gradientUnits="userSpaceOnUse"><stop stop-color="#9945FF"/><stop offset="1" stop-color="#14F195"/></linearGradient></defs><g fill="url(#solg)"><path d="M10.2 20.2c.11-.1.26-.16.41-.16h12.1c.26 0 .39.31.2.49l-2.3 2.3c-.1.1-.25.16-.4.16H8.1c-.26 0-.39-.31-.2-.49z"/><path d="M10.2 9.17c.12-.1.27-.16.41-.16h12.1c.26 0 .39.31.2.49l-2.3 2.3c-.1.1-.25.16-.4.16H8.1c-.26 0-.39-.31-.2-.49z"/><path d="M20.62 14.65c-.1-.1-.25-.16-.4-.16H8.1c-.26 0-.39.31-.2.49l2.3 2.3c.1.1.25.16.41.16h12.1c.26 0 .39-.31.2-.49z"/></g></svg>',
    USDC: '<svg class="tok-logo" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#2775CA"/><path d="M16 8.5v15M19.4 11.6c-.7-1-1.9-1.7-3.4-1.7-2 0-3.4 1.1-3.4 2.7 0 1.7 1.5 2.3 3.4 2.7 1.9.4 3.4 1 3.4 2.7 0 1.6-1.4 2.7-3.4 2.7-1.5 0-2.7-.7-3.4-1.7" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>',
    USDT: '<svg class="tok-logo" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#26A17B"/><path d="M9.5 11.2h13M16 11.5v11" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/><ellipse cx="16" cy="16.2" rx="4.6" ry="1.8" fill="none" stroke="#fff" stroke-width="1.5"/></svg>',
    EUR: '<svg class="tok-logo" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#33475A"/><path d="M20 11.6c-.9-.9-2.1-1.4-3.4-1.4-2.8 0-4.9 2.6-4.9 5.8s2.1 5.8 4.9 5.8c1.3 0 2.5-.5 3.4-1.4M9.6 14.4h7M9.6 17.4h7" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>',
    USD: '<svg class="tok-logo" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#33475A"/><path d="M16 8.5v15M19.4 11.6c-.7-1-1.9-1.7-3.4-1.7-2 0-3.4 1.1-3.4 2.7 0 1.7 1.5 2.3 3.4 2.7 1.9.4 3.4 1 3.4 2.7 0 1.6-1.4 2.7-3.4 2.7-1.5 0-2.7-.7-3.4-1.7" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>',
    GBP: '<svg class="tok-logo" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#33475A"/><path d="M20 10.8c-.7-.7-1.7-1.1-2.7-1.1-1.9 0-3.3 1.4-3.3 3.3v9.3M11.4 16.2h6.4M10.5 22.3h9.6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>',
  };
  const tokenLogo = (t) => TOKEN_ICONS[t] || "";

  /* -------- Mise à jour live d'un panneau (taux, total, solde) -------- */
  function refreshPanel(panel) {
    if (!panel) return;
    const action = panel.dataset.panel;
    const tokSel = panel.querySelector(".token-select");
    if (!tokSel) return; // panneau membership : pas de token (rendu par refreshMembershipUI)
    const token = tokSel.dataset.token;
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
          '" data-token="' + t + '"><span class="tmi-left">' + tokenLogo(t) + "<span>" + t + "</span></span>" +
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
        setSelectLogo(btn);
        // Si le solde change de token, on vide le montant pour éviter une valeur incohérente.
        panel.querySelector(".dock-card__amount").value = "";
        refreshPanel(panel);
        closeTokenMenu();
      });
    });
  }
  // Injecte / met à jour le logo de marque dans un bouton token-select.
  function setSelectLogo(btn) {
    let logo = btn.querySelector(".token-select__logo");
    if (!logo) {
      logo = document.createElement("span");
      logo.className = "token-select__logo";
      btn.insertBefore(logo, btn.firstChild);
    }
    logo.innerHTML = tokenLogo(btn.dataset.token);
  }
  document.querySelectorAll(".token-select").forEach((btn) => {
    setSelectLogo(btn);
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
    // Case à cocher « j'ai sauvegardé ma phrase » → active le bouton Continue.
    const ack = e.target.closest("[data-ack]");
    if (ack) {
      ack.classList.toggle("is-on");
      const cta = modalContent.querySelector('[data-modal-action="confirm"]');
      if (cta) cta.classList.toggle("is-disabled", !ack.classList.contains("is-on"));
      return;
    }
    // Choix du token à déposer / envoyer.
    const dt = e.target.closest("[data-deptok]");
    if (dt) {
      dt.parentElement.querySelectorAll("[data-deptok]").forEach((o) => o.classList.remove("is-on"));
      dt.classList.add("is-on");
      return;
    }
    // Choix du réseau du wallet (sign up).
    const nt = e.target.closest("[data-net]");
    if (nt) {
      nt.parentElement.querySelectorAll("[data-net]").forEach((o) => o.classList.remove("is-on"));
      nt.classList.add("is-on");
      return;
    }
    // Copie de l'adresse du wallet.
    const cp = e.target.closest("[data-copy]");
    if (cp) {
      try { if (navigator.clipboard) navigator.clipboard.writeText(cp.dataset.copy); } catch (_) {}
      cp.classList.add("is-copied");
      setTimeout(() => cp.classList.remove("is-copied"), 1200);
      return;
    }
    // Sélecteur de paiement membership (SEPA / wallet).
    const mp = e.target.closest("[data-mpay]");
    if (mp) {
      mp.parentElement.querySelectorAll("[data-mpay]").forEach((o) => o.classList.remove("is-on"));
      mp.classList.add("is-on");
      return;
    }
    // Sélecteur de type de carte (one-time / classic) + libellé descriptif.
    const ct = e.target.closest("[data-ctype]");
    if (ct) {
      ct.parentElement.querySelectorAll("[data-ctype]").forEach((o) => o.classList.remove("is-on"));
      ct.classList.add("is-on");
      const d = modalContent.querySelector("#ctype-detail span");
      if (d) d.textContent = ct.dataset.ctype === "classic"
        ? "Reusable · spend anywhere, multiple times"
        : "Single-use · burned right after one payment";
      return;
    }
    // Boutons de navigation entre vues wallet.
    if (e.target.closest("[data-deposit]")) { openDeposit(); return; }
    if (e.target.closest("[data-dashboard]")) { openDashboard(); return; }
    if (e.target.closest("[data-wsend]")) { openWalletSend(); return; }
    if (e.target.closest("[data-signup]")) { openSignup(); return; }
    if (e.target.closest("[data-getmember]")) { openMembershipPurchase(); return; }
    if (e.target.closest("[data-cardcreate]")) { openCardCreate(); return; }
    const cardBtn = e.target.closest("[data-card]");
    if (cardBtn) { openCardView(cardBtn.dataset.card); return; }
    const btn = e.target.closest("[data-modal-action]");
    if (!btn) return;
    if (btn.classList.contains("is-disabled")) return; // CTA verrouillé (ex. ack requis)
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
        head(ICONS.buy, "Review your purchase", "No KYC — settle by SEPA or one-time card.") +
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
          if (!gatePay(via)) return; // SEPA → compte requis ; carte one-time → membre requis
          runFlow("Buying privately…", () => {
            const a = loadAcct();
            if (a) {
              a.balances[token] = (a.balances[token] || 0) + amt;
              a.txs.unshift({ type: "buy", token: token, amt: amt, eur: eur, via: via, at: Date.now() });
              vault.save(a);
              refreshAuthUI();
            }
            return (
              successHead("Purchase complete", fmtNum(amt) + " " + token + " is now in your private wallet.") +
              rows([["Paid", fmtEUR(eur)], ["Via", via], ["Reference", ref]]) +
              (a ? walletDoneActions() : doneBtn("Done"))
            );
          });
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
          if (!gatePay(via)) return;
          runSteps(["Mixing through a CEX…", "Selling privately…"], () => {
            const a = loadAcct();
            if (a) {
              a.txs.unshift({ type: "sell", token: token, amt: amt, eur: eur, via: via, at: Date.now() });
              vault.save(a);
            }
            return (
              successHead(
                "Sale complete",
                via === "One-time card"
                  ? fmtEUR(eur) + " loaded onto your one-time card."
                  : fmtEUR(eur) + " is on its way by SEPA."
              ) +
              rows([["Sold", fmtNum(amt) + " " + token], ["Payout", via], ["Reference", ref]]) +
              (a ? walletDoneActions() : doneBtn("Done"))
            );
          });
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

  const MEMBER_PRICE = 9; // € / mois (démo)

  /* -------- Gating des paiements --------
     SEPA → un compte (wallet) suffit. Carte one-time → membership payant. */
  function gatePay(via) {
    const acct = loadAcct();
    if (via === "One-time card") {
      if (!acct) { gateNoAccount("card"); return false; }
      if (!acct.member) { gateNoMember(); return false; }
    } else {
      if (!acct) { gateNoAccount("sepa"); return false; }
    }
    return true;
  }
  function gateNoAccount(reason) {
    openModal(
      head(ICONS.key, "Create your account",
        reason === "card"
          ? "One-time cards need a membership account — start with a free wallet."
          : "SEPA settlement needs a free account. No KYC, 20 seconds.") +
        '<p class="m-lead">Spin up a non-custodial wallet — your keys stay on this device. Then finish your payment.</p>' +
        '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-signup><span class="btn__label">Create wallet</span><span class="btn__icon">' + ARROW + '</span></button>' +
        '<button type="button" class="m-ghost" data-close>Not now</button></div>',
      null
    );
  }
  function gateNoMember() {
    openModal(
      head(ICONS.card, "Membership required", "One-time cards are a member feature — " + fmtEUR(MEMBER_PRICE) + "/mo, no KYC.") +
        '<p class="m-lead">Become a member to mint single-use cards. Your identity is never collected.</p>' +
        '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-getmember><span class="btn__label">Get membership</span><span class="btn__icon">' + ARROW + '</span></button>' +
        '<button type="button" class="m-ghost" data-close>Not now</button></div>',
      null
    );
  }

  /* -------- Membership payant -------- */
  function openMembershipPurchase() {
    const acct = loadAcct();
    if (!acct) { gateNoAccount("card"); return; }
    if (acct.member) { openCardCreate(); return; }
    openModal(
      head(ICONS.card, "Get Membership", "Mint unlimited one-time & classic cards — no KYC.") +
        rows([
          ["Plan", "Member · monthly"],
          ["Cards", "One-time & classic"],
          ["Privacy", "No identity, ever"],
          ["Due today", fmtEUR(MEMBER_PRICE), true],
        ]) +
        '<div class="m-pay"><span class="m-pay__k">Pay with</span>' +
        '<div class="m-seg" role="radiogroup" aria-label="Pay with">' +
        '<button type="button" class="m-seg__opt is-on" data-mpay="sepa">SEPA</button>' +
        '<button type="button" class="m-seg__opt" data-mpay="wallet">From wallet</button>' +
        '</div></div>' +
        confirmActions("Pay " + fmtEUR(MEMBER_PRICE)) +
        privacyNote("Billed privately — your identity is never collected"),
      () => {
        const on = modalContent.querySelector(".m-seg__opt.is-on[data-mpay]");
        const via = on ? on.dataset.mpay : "sepa";
        const a0 = loadAcct();
        if (via === "wallet" && totalValue(a0) < MEMBER_PRICE) {
          // Pas assez de fonds → on invite à recharger.
          openDeposit();
          return;
        }
        runFlow("Activating membership…", () => {
          const a = loadAcct();
          a.member = true;
          a.memberSince = Date.now();
          a.txs.unshift({ type: "membership", via: via, at: Date.now() });
          vault.save(a);
          refreshAuthUI();
          return (
            successHead("You're a member", "Mint one-time or classic cards whenever you spend.") +
            '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-cardcreate><span class="btn__label">Create a card</span><span class="btn__icon">' + ARROW + '</span></button>' +
            '<button type="button" class="m-ghost" data-dashboard>Go to wallet</button></div>'
          );
        });
      }
    );
  }

  /* -------- Génération + rendu d'une carte virtuelle -------- */
  function genCard(type, load) {
    const num = Array.from({ length: 4 }, () => 1000 + Math.floor(Math.random() * 9000)).join(" ");
    const exp = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0") + "/" + (28 + Math.floor(Math.random() * 4));
    return {
      id: "c_" + rndHex(8),
      type: type,
      num: num,
      last4: num.slice(-4),
      exp: exp,
      cvv: String(100 + Math.floor(Math.random() * 900)),
      load: load || 0,
      createdAt: Date.now(),
    };
  }
  function cardVisualHTML(card, handle) {
    const isOne = card.type !== "classic";
    return (
      '<div class="m-card' + (isOne ? "" : " m-card--classic") + '">' +
      '<div class="m-card__top"><span>' + (isOne ? "ONE-TIME" : "CLASSIC") + "</span>" + LOCK + "</div>" +
      '<div class="m-card__num">' + card.num + "</div>" +
      '<div class="m-card__grid"><span><small>EXP</small>' + card.exp + "</span><span><small>CVV</small>" + card.cvv + "</span></div>" +
      '<div class="m-card__bottom"><span>@' + handle + "</span><span>" + (isOne ? "SINGLE-USE" : "REUSABLE") + "</span></div></div>"
    );
  }

  /* -------- Création d'une carte (one-time / classic) -------- */
  function openCardCreate() {
    const acct = loadAcct();
    if (!acct) { gateNoAccount("card"); return; }
    if (!acct.member) { openMembershipPurchase(); return; }
    openModal(
      head(ICONS.card, "Create a card", "Generated on your device — carries nothing about you.") +
        '<div class="m-pay"><span class="m-pay__k">Card type</span>' +
        '<div class="m-seg" role="radiogroup" aria-label="Card type">' +
        '<button type="button" class="m-seg__opt is-on" data-ctype="onetime">One-time</button>' +
        '<button type="button" class="m-seg__opt" data-ctype="classic">Classic</button>' +
        '</div></div>' +
        '<p class="m-pay__detail" id="ctype-detail">' + LOCK + "<span>Single-use · burned right after one payment</span></p>" +
        '<div class="m-field"><label>Load amount (optional)</label><input class="m-input" id="cc-amt" inputmode="decimal" placeholder="0.00" autocomplete="off"></div>' +
        confirmActions("Generate card") +
        privacyNote("No name, no KYC — nothing links the card to you"),
      () => {
        const on = modalContent.querySelector(".m-seg__opt.is-on[data-ctype]");
        const type = on ? on.dataset.ctype : "onetime";
        const load = parseFloat((document.getElementById("cc-amt").value || "").replace(/,/g, "")) || 0;
        runFlow("Minting your card…", () => {
          const a = loadAcct();
          const card = genCard(type, load);
          a.cards.unshift(card);
          a.txs.unshift({ type: "card", kind: type, last4: card.last4, at: Date.now() });
          vault.save(a);
          return (
            successHead("Card ready", type === "classic" ? "Your reusable card is live." : "Single-use card minted — burned after one payment.") +
            cardVisualHTML(card, a.handle) +
            '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-cardcreate><span class="btn__label">Create another</span><span class="btn__icon">' + ARROW + '</span></button>' +
            '<button type="button" class="m-ghost" data-dashboard>Go to wallet</button></div>'
          );
        });
      }
    );
  }

  /* -------- Détail d'une carte existante -------- */
  function openCardView(id) {
    const acct = loadAcct();
    if (!acct) return;
    const card = acct.cards.find((c) => c.id === id);
    if (!card) { openDashboard(); return; }
    const extra = card.load ? [["Loaded", fmtEUR(card.load)]] : [];
    openModal(
      head(ICONS.card, card.type === "classic" ? "Classic card" : "One-time card", "Generated on your device — non-custodial.") +
        cardVisualHTML(card, acct.handle) +
        rows([["Type", card.type === "classic" ? "Reusable" : "Single-use"], ["Expires", card.exp], ["CVV", card.cvv], ...extra]) +
        '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-dashboard><span class="btn__label">Back to wallet</span></button></div>',
      null
    );
  }

  /* -------- Branchement des CTA du dock -------- */
  document.querySelectorAll(".dock-panel").forEach((panel) => {
    const cta = panel.querySelector(".dock-cta");
    if (!cta) return;
    cta.addEventListener("click", () => {
      const action = panel.dataset.panel;
      if (action === "card") {
        const acct = loadAcct();
        if (!acct) openSignup();
        else if (acct.member) openCardCreate();
        else openMembershipPurchase();
      } else openTransaction(action, panel);
    });
  });

  /* ============================================================
     COFFRE LOCAL (localStorage) — "base de données" côté navigateur.
     Vrai non-custodial : on génère les clés sur l'appareil, on n'enregistre
     QUE des données publiques (handle, adresse, soldes). La phrase de
     récupération n'est jamais stockée — montrée une seule fois à la création.
     ============================================================ */
  const VKEY = "umbra.vault.v1";
  const vault = {
    load() { try { return JSON.parse(localStorage.getItem(VKEY)) || null; } catch (_) { return null; } },
    save(v) { try { localStorage.setItem(VKEY, JSON.stringify(v)); } catch (_) {} },
    clear() { try { localStorage.removeItem(VKEY); } catch (_) {} },
  };
  // Charge le compte en garantissant la présence des champs (migration douce
  // des anciens comptes : balances / txs / cards / member).
  function loadAcct() {
    const a = vault.load();
    if (!a) return null;
    if (!a.balances) a.balances = {};
    if (!Array.isArray(a.txs)) a.txs = [];
    if (!Array.isArray(a.cards)) a.cards = [];
    if (typeof a.member !== "boolean") a.member = false;
    if (!a.network || !NETWORKS[a.network]) a.network = "ETH"; // anciens comptes 0x… = ETH
    return a;
  }
  // Horodatage relatif compact pour l'historique.
  function timeAgo(t) {
    if (!t) return "just now";
    const s = Math.max(1, Math.floor((Date.now() - t) / 1000));
    if (s < 60) return s + "s ago";
    const m = Math.floor(s / 60);
    if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    return Math.floor(h / 24) + "d ago";
  }
  // Actions de fin de flux quand un wallet existe (voir le wallet / terminer).
  const walletDoneActions = () =>
    '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-dashboard><span class="btn__label">View wallet</span></button>' +
    '<button type="button" class="m-ghost" data-close>Done</button></div>';

  // Petite liste de mots façon BIP39 pour une phrase crédible (démo).
  const WORDS = ("anchor amber aurora birch bridge cipher cobalt comet cosmos cedar delta drift " +
    "ember falcon fern frost gamma glacier harbor haven iris ivory jade kelp lunar maple meadow " +
    "nebula nimbus onyx opal orbit pebble prism quartz quiver raven ripple saffron slate solar " +
    "spruce timber topaz umbra vault velvet willow zephyr").split(" ");
  const genMnemonic = (n) => Array.from({ length: n || 12 }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(" ");
  // Chaîne aléatoire dans un alphabet donné (pour les formats d'adresse).
  const rndStr = (alpha, n) => Array.from({ length: n }, () => alpha[Math.floor(Math.random() * alpha.length)]).join("");
  const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const BECH = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  // Réseaux proposés à la création : chacun a un nom, un token natif et un
  // format d'adresse réaliste (généré sur l'appareil).
  const NETWORKS = {
    ETH: { name: "Ethereum", token: "ETH", gen: () => "0x" + rndHex(40) },
    SOL: { name: "Solana", token: "SOL", gen: () => rndStr(B58, 44) },
    BTC: { name: "Bitcoin", token: "BTC", gen: () => "bc1" + rndStr(BECH, 39) },
  };
  const netName = (n) => (NETWORKS[n] ? NETWORKS[n].name : "");
  const genAddress = (n) => (NETWORKS[n] || NETWORKS.ETH).gen();
  const fmtAddr = (a) => a.slice(0, 6) + "…" + a.slice(-4);
  const totalValue = (acct) => Object.keys(acct.balances || {}).reduce((s, t) => s + acct.balances[t] * (RATES[t] || 0), 0);
  const shakeEl = (el) => { if (!el) return; el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); if (el.focus) el.focus(); };
  const COPY = '<svg viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2.2" stroke="currentColor" stroke-width="1.6"/><path d="M5 15V6a2 2 0 0 1 2-2h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

  // Carte wallet réutilisable (création + dashboard).
  function walletCardHTML(acct) {
    const net = acct.network && NETWORKS[acct.network] ? netName(acct.network) : "Wallet";
    return (
      '<div class="w-card"><div class="w-card__top"><span class="w-card__brand">' + (acct.network ? tokenLogo(acct.network) : ICONS.wallet) + " " + net + "</span>" +
      '<span class="w-badge">' + LOCK + "NON-CUSTODIAL</span></div>" +
      '<button type="button" class="w-addr" data-copy="' + acct.address + '"><span>' + fmtAddr(acct.address) + "</span>" + COPY + "</button>" +
      '<div class="w-card__bottom"><span>@' + acct.handle + "</span><span>" + fmtEUR(totalValue(acct)) + "</span></div></div>"
    );
  }

  // Met à jour la navbar selon l'état du coffre.
  function refreshAuthUI() {
    const acct = vault.load();
    const signup = document.querySelector('[data-auth="signup"] .btn__label');
    if (signup) signup.textContent = acct ? "@" + acct.handle : "Sign up";
    refreshMembershipUI();
  }

  /* Le 4e onglet du dock s'adapte au statut de membre : un non-membre ne voit
     PAS une création de carte (il ne peut pas en avoir), seulement l'offre
     membership ; un membre voit la création de carte. */
  const CARD_SVG = '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M3 10h18" stroke="currentColor" stroke-width="1.5"/></svg>';
  function refreshMembershipUI() {
    const panel = document.querySelector('.dock-panel[data-panel="card"]');
    if (!panel) return;
    const card = panel.querySelector(".dock-card");
    const fee = panel.querySelector(".dock-fee");
    const ctaLabel = panel.querySelector(".dock-cta .btn__label");
    if (!card || !fee || !ctaLabel) return;
    const acct = loadAcct();
    const member = !!(acct && acct.member);
    if (member) {
      card.innerHTML =
        '<span class="dock-card__label">One-Time Card</span>' +
        '<div class="dock-card__pitch"><span class="dock-card__pitch-ico">' + CARD_SVG + "</span>" +
        '<span class="dock-card__pitch-txt"><strong>Mint a card</strong><span>One-time or classic — generated on your device</span></span></div>' +
        '<div class="dock-card__meta"><span class="left">' + CARD_SVG + "<span>Active membership</span></span>" +
        '<span class="right">Single-use<span class="dock-dot"></span>Burned after</span></div>';
      fee.innerHTML = "<span>Membership</span><span>Active<span class=\"dock-dot\"></span>Unlimited cards</span>";
      ctaLabel.textContent = "Create a card";
    } else {
      card.innerHTML =
        '<span class="dock-card__label">Membership</span>' +
        '<div class="dock-card__pitch"><span class="dock-card__pitch-ico">' + CARD_SVG + "</span>" +
        '<span class="dock-card__pitch-txt"><strong>' + fmtEUR(MEMBER_PRICE) + ' <small>/ month</small></strong><span>Unlock one-time & classic cards — no KYC</span></span></div>' +
        '<div class="dock-card__meta"><span class="left">' + CARD_SVG + "<span>Members only</span></span>" +
        '<span class="right">Cancel anytime</span></div>';
      fee.innerHTML = "<span>Billing</span><span>Private<span class=\"dock-dot\"></span>No identity</span>";
      ctaLabel.textContent = "Become a Member";
    }
  }

  let pendingWallet = null; // wallet en cours de création (avant validation phrase)

  /* -------- Sign up : création de wallet non-custodial (multi-étapes) -------- */
  function openSignup() {
    openModal(
      head(ICONS.key, "Create your wallet", "Non-custodial — you hold the keys, we never see them.") +
        '<div class="m-badge">' + LOCK + "<span>Self-custody · no email · no KYC</span></div>" +
        '<div class="m-field"><label>Choose a handle</label><div class="m-inwrap"><span class="m-inprefix">@</span>' +
        '<input class="m-input m-input--prefixed" id="su-handle" placeholder="yourhandle" autocomplete="off" autocapitalize="none"></div></div>' +
        '<div class="m-field"><label>Set a passphrase</label><input class="m-input" id="su-pass" type="password" placeholder="••••••••" autocomplete="new-password"></div>' +
        '<div class="m-field"><label>Wallet network</label><div class="dep-toks">' +
          ["ETH", "SOL", "BTC"].map((n, i) =>
            '<button type="button" class="dep-tok' + (i === 0 ? " is-on" : "") + '" data-net="' + n + '">' + tokenLogo(n) + "<span>" + NETWORKS[n].name + "</span></button>"
          ).join("") + "</div></div>" +
        '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-modal-action="confirm"><span class="btn__label">Generate wallet</span><span class="btn__icon">' + ARROW + "</span></button></div>" +
        privacyNote("Your keys are generated on your device"),
      () => {
        const hEl = document.getElementById("su-handle");
        const pEl = document.getElementById("su-pass");
        const raw = (hEl.value || "").trim().replace(/^@+/, "");
        if (!raw) { shakeEl(hEl); return; }
        if (!(pEl.value || "").trim()) { shakeEl(pEl); return; }
        const handle = raw.toLowerCase().replace(/[^a-z0-9_-]/g, "") || "ghost-" + rndHex(4);
        const netEl = modalContent.querySelector(".dep-tok.is-on[data-net]");
        const network = netEl && NETWORKS[netEl.dataset.net] ? netEl.dataset.net : "ETH";
        pendingWallet = { handle, network, address: genAddress(network), mnemonic: genMnemonic(12) };
        signupGenerating();
      }
    );
  }
  function signupGenerating() {
    const steps = ["Generating your keys…", "Deriving your address…", "Encrypting locally…"];
    let i = 0;
    setModal(processing(steps[0], "Everything stays on your device."));
    const adv = () => {
      i++;
      if (i < steps.length) { setModal(processing(steps[i], "Everything stays on your device.")); setTimeout(adv, 850); }
      else setTimeout(signupRecovery, 600);
    };
    setTimeout(adv, 850);
  }
  function signupRecovery() {
    const words = pendingWallet.mnemonic.split(" ");
    const grid = '<div class="seed-grid">' + words.map((w, i) => '<span class="seed-word"><b>' + (i + 1) + "</b>" + w + "</span>").join("") + "</div>";
    setModal(
      head(ICONS.key, "Your recovery phrase", "Write these 12 words down. They're the only way to restore your wallet.") +
        grid +
        '<button type="button" class="m-ack" data-ack><span class="m-ack__box">' + CHECK + "</span>" +
        "<span>I've saved my recovery phrase. I understand it's never stored on any server.</span></button>" +
        '<div class="m-actions"><button type="button" class="m-cta btn btn--primary is-disabled" data-modal-action="confirm"><span class="btn__label">Continue</span><span class="btn__icon">' + ARROW + "</span></button></div>" +
        privacyNote("Non-custodial — only you can recover these funds"),
      () => {
        const ack = modalContent.querySelector(".m-ack");
        if (!ack || !ack.classList.contains("is-on")) { shakeEl(ack); return; }
        signupFinalize();
      }
    );
  }
  function signupFinalize() {
    const acct = { handle: pendingWallet.handle, address: pendingWallet.address, network: pendingWallet.network, createdAt: Date.now(), balances: {}, txs: [], member: false, cards: [] };
    vault.save(acct);
    pendingWallet = null;
    refreshAuthUI();
    setModal(
      successHead("Wallet ready", "Your self-custody wallet is live. Open it to add funds, get membership and mint cards.") +
        walletCardHTML(acct) +
        '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-dashboard><span class="btn__label">Open my wallet</span><span class="btn__icon">' + ARROW + "</span></button>" +
        '<button type="button" class="m-ghost" data-deposit>Add funds</button></div>'
    );
  }

  // En-tête de section (avec lien d'action optionnel à droite).
  const section = (label, action) =>
    '<div class="w-section"><span>' + label + "</span>" + (action || "") + "</div>";

  // Ligne d'historique pour une transaction.
  function txLine(tx) {
    const tk = tx.token || "";
    const qty = tx.amt != null ? fmtNum(tx.amt) + " " + tk : "";
    let m;
    if (tx.type === "deposit") m = { ic: ICONS.deposit, label: "Received " + tk, amt: "+" + qty, cls: "pos" };
    else if (tx.type === "send") m = { ic: ICONS.send, label: "Sent " + tk, amt: "−" + qty, cls: "neg" };
    else if (tx.type === "buy") m = { ic: ICONS.buy, label: "Bought " + tk, amt: "+" + qty, cls: "pos" };
    else if (tx.type === "sell") m = { ic: ICONS.sell, label: "Sold " + tk, amt: "−" + qty, cls: "neg" };
    else if (tx.type === "card") m = { ic: ICONS.card, label: (tx.kind === "classic" ? "Classic" : "One-time") + " card created", amt: tx.last4 ? "•••• " + tx.last4 : "", cls: "" };
    else if (tx.type === "membership") m = { ic: ICONS.card, label: "Membership activated", amt: fmtEUR(MEMBER_PRICE), cls: "" };
    else m = { ic: ICONS.wallet, label: tx.type, amt: "", cls: "" };
    const sub = timeAgo(tx.at) + (tx.to ? " · " + (tx.to.length > 16 ? tx.to.slice(0, 8) + "…" : tx.to) : "");
    return (
      '<div class="w-tx__row"><span class="w-tx__ico">' + m.ic + "</span>" +
      '<span class="w-tx__main"><span class="w-tx__label">' + m.label + "</span>" +
      '<span class="w-tx__sub">' + sub + "</span></span>" +
      '<span class="w-tx__amt ' + m.cls + '">' + m.amt + "</span></div>"
    );
  }

  /* -------- Dashboard wallet = page produit -------- */
  function openDashboard() {
    const acct = loadAcct();
    if (!acct) { openSignup(); return; }

    const toks = Object.keys(acct.balances).filter((t) => acct.balances[t] > 0);
    // Carte de solde unifiée : total en haut, détail par token sous un séparateur.
    const balanceCard =
      '<div class="w-balance"><div class="w-balance__total"><span>Total balance</span><strong>' + fmtEUR(totalValue(acct)) + "</strong></div>" +
      (toks.length
        ? '<div class="w-balance__list">' + toks.map((t) =>
            '<div class="w-tok"><span class="w-tok__id">' + tokenLogo(t) + "<span>" + t + "</span></span>" +
            '<span class="w-tok__val"><strong>' + fmtNum(acct.balances[t]) + "</strong><small>" + fmtEUR(acct.balances[t] * (RATES[t] || 0)) + "</small></span></div>"
          ).join("") + "</div>"
        : '<p class="w-empty">No funds yet — add some to get started.</p>') +
      "</div>";
    const dashSub = (acct.network && NETWORKS[acct.network] ? netName(acct.network) + " · " : "") + "Self-custody" + (acct.member ? " · Member" : "");

    // Bloc membership : promo si non-membre, statut + bouton sinon.
    const memberBlock = acct.member
      ? '<div class="w-member"><span class="w-member__pill">' + CHECK + "Member</span>" +
        '<button type="button" class="w-link" data-cardcreate>New card +</button></div>'
      : '<button type="button" class="w-promo" data-getmember>' +
        '<span class="w-promo__ico">' + ICONS.card + "</span>" +
        '<span class="w-promo__txt"><strong>Get Membership</strong><small>One-time & classic cards · ' + fmtEUR(MEMBER_PRICE) + "/mo</small></span>" +
        '<span class="w-promo__arr">' + ARROW + "</span></button>";

    // Cartes émises.
    const cardsBlock = acct.cards.length
      ? section("Your cards", '<button type="button" class="w-link" data-cardcreate>New +</button>') +
        '<div class="w-cards">' + acct.cards.slice(0, 4).map((c) =>
          '<button type="button" class="w-mini' + (c.type === "classic" ? " w-mini--classic" : "") + '" data-card="' + c.id + '">' +
          '<span class="w-mini__type">' + (c.type === "classic" ? "CLASSIC" : "ONE-TIME") + "</span>" +
          '<span class="w-mini__num">•••• ' + c.last4 + "</span>" +
          '<span class="w-mini__exp">' + c.exp + "</span></button>"
        ).join("") + "</div>"
      : "";

    // Activité récente.
    const txBlock = acct.txs.length
      ? '<div class="w-tx">' + acct.txs.slice(0, 8).map(txLine).join("") + "</div>"
      : '<p class="w-empty">No activity yet.</p>';

    openModal(
      head(ICONS.wallet, "@" + acct.handle, dashSub) +
        '<button type="button" class="w-addr w-addr--solo" data-copy="' + acct.address + '"><span>' + fmtAddr(acct.address) + "</span>" + COPY + "</button>" +
        balanceCard +
        '<div class="m-actions m-actions--row"><button type="button" class="m-cta btn btn--primary" data-deposit><span class="btn__label">Add funds</span></button>' +
        '<button type="button" class="m-cta btn m-cta--ghost" data-wsend><span class="btn__label">Send</span></button></div>' +
        section("Membership") + memberBlock +
        cardsBlock +
        section("Activity") + txBlock +
        privacyNote("Only your device holds the keys to this wallet"),
      null
    );
  }

  /* -------- Dépôt : envoyer des fonds dans le wallet -------- */
  function depTokChips(active) {
    const toks = ["USDC", "USDT", "ETH", "BTC", "SOL"];
    return '<div class="dep-toks">' + toks.map((t) =>
      '<button type="button" class="dep-tok' + (t === active ? " is-on" : "") + '" data-deptok="' + t + '">' + tokenLogo(t) + "<span>" + t + "</span></button>"
    ).join("") + "</div>";
  }
  function openDeposit() {
    const acct = loadAcct();
    if (!acct) { openSignup(); return; }
    openModal(
      head(ICONS.deposit, "Add funds", "Send crypto into your self-custody wallet.") +
        depTokChips(acct.network && NETWORKS[acct.network] ? acct.network : "USDC") +
        '<div class="m-field"><label>Amount</label><input class="m-input" id="dep-amt" inputmode="decimal" placeholder="0.00" autocomplete="off"></div>' +
        '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-modal-action="confirm"><span class="btn__label">Deposit</span><span class="btn__icon">' + ARROW + "</span></button>" +
        '<button type="button" class="m-ghost" data-modal-action="cancel">Cancel</button></div>' +
        privacyNote("Funds land in your wallet — you keep the keys"),
      () => {
        const amtEl = document.getElementById("dep-amt");
        const amt = parseFloat((amtEl.value || "").replace(/,/g, ""));
        const sel = modalContent.querySelector(".dep-tok.is-on");
        const t = sel ? sel.dataset.deptok : "USDC";
        if (!(amt > 0)) { shakeEl(amtEl); return; }
        runFlow("Receiving your deposit…", () => {
          const a = vault.load();
          a.balances[t] = (a.balances[t] || 0) + amt;
          a.txs.unshift({ type: "deposit", token: t, amt, at: Date.now() });
          vault.save(a);
          refreshAuthUI();
          return (
            successHead("Funds received", fmtNum(amt) + " " + t + " is now in your self-custody wallet.") +
            rows([["Deposited", fmtNum(amt) + " " + t], ["New balance", fmtNum(a.balances[t]) + " " + t]]) +
            '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-dashboard><span class="btn__label">View wallet</span></button>' +
            '<button type="button" class="m-ghost" data-close>Done</button></div>'
          );
        });
      }
    );
  }

  /* -------- Envoi depuis le wallet (signé par la clé locale) -------- */
  function openWalletSend() {
    const acct = vault.load();
    if (!acct) { openSignup(); return; }
    const toks = Object.keys(acct.balances).filter((t) => acct.balances[t] > 0);
    if (!toks.length) { openDeposit(); return; }
    openModal(
      head(ICONS.send, "Send", "From your self-custody wallet — over a stealth address.") +
        '<div class="dep-toks">' + toks.map((t, i) =>
          '<button type="button" class="dep-tok' + (i === 0 ? " is-on" : "") + '" data-deptok="' + t + '">' + tokenLogo(t) + "<span>" + t + "</span></button>"
        ).join("") + "</div>" +
        '<div class="m-field"><label>Recipient</label><input class="m-input" id="ws-to" placeholder="Address or @handle" autocomplete="off"></div>' +
        '<div class="m-field"><label>Amount</label><input class="m-input" id="ws-amt" inputmode="decimal" placeholder="0.00" autocomplete="off"></div>' +
        '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-modal-action="confirm"><span class="btn__label">Send privately</span><span class="btn__icon">' + ARROW + "</span></button>" +
        '<button type="button" class="m-ghost" data-modal-action="cancel">Cancel</button></div>',
      () => {
        const toEl = document.getElementById("ws-to");
        const amtEl = document.getElementById("ws-amt");
        const sel = modalContent.querySelector(".dep-tok.is-on");
        const t = sel ? sel.dataset.deptok : toks[0];
        const to = (toEl.value || "").trim();
        const amt = parseFloat((amtEl.value || "").replace(/,/g, ""));
        if (!to) { shakeEl(toEl); return; }
        const a = vault.load();
        if (!(amt > 0) || amt > (a.balances[t] || 0)) { shakeEl(amtEl); return; }
        runSteps(["Signing with your key…", "Routing privately…"], () => {
          a.balances[t] = a.balances[t] - amt;
          a.txs.unshift({ type: "send", token: t, amt, to, at: Date.now() });
          vault.save(a);
          refreshAuthUI();
          const short = to.length > 22 ? to.slice(0, 10) + "…" + to.slice(-6) : to;
          return (
            successHead("Sent", fmtNum(amt) + " " + t + " delivered to " + short + ".") +
            rows([["Remaining", fmtNum(a.balances[t]) + " " + t]]) +
            '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-dashboard><span class="btn__label">View wallet</span></button>' +
            '<button type="button" class="m-ghost" data-close>Done</button></div>'
          );
        });
      }
    );
  }

  /* -------- "Open app" sans wallet → invite à en créer un -------- */
  function openLogin() {
    openModal(
      head(ICONS.auth, "Open your wallet", "No wallet on this device yet.") +
        '<p class="m-lead">Create a non-custodial wallet in seconds — no email, no KYC. Your keys never leave your device.</p>' +
        '<div class="m-actions"><button type="button" class="m-cta btn btn--primary" data-signup><span class="btn__label">Create a wallet</span><span class="btn__icon">' + ARROW + "</span></button>" +
        '<button type="button" class="m-ghost" data-close>Cancel</button></div>',
      null
    );
  }

  /* -------- Boutons navbar : routent selon l'état du coffre -------- */
  document.querySelectorAll("[data-auth]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const acct = vault.load();
      if (el.dataset.auth === "signup") acct ? openDashboard() : openSignup();
      else acct ? openDashboard() : openLogin();
    });
  });
  refreshAuthUI();

  // expose pour le handler d'onglets (fermeture du menu token au switch)
  window.closeTokenMenu = closeTokenMenu;

  // Init : valeurs cohérentes au chargement.
  document.querySelectorAll(".dock-panel").forEach(refreshPanel);

  /* -------- Prix en direct (CoinGecko) --------
     Remplace les taux de secours par de vrais prix EUR (BTC, ETH, SOL, USDC,
     USDT) puis rafraîchit les panneaux. En cas d'échec réseau, on garde les
     taux de secours — l'UI reste fonctionnelle. */
  (function fetchLivePrices() {
    const map = { bitcoin: "BTC", ethereum: "ETH", solana: "SOL", "usd-coin": "USDC", tether: "USDT" };
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=" + Object.keys(map).join(",") + "&vs_currencies=eur";
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        let any = false;
        for (const id in map) {
          const v = d && d[id] && d[id].eur;
          if (typeof v === "number" && v > 0) { RATES[map[id]] = v; any = true; }
        }
        if (any) {
          document.querySelectorAll(".dock-panel").forEach(refreshPanel);
          // Si le dashboard est ouvert, on le rafraîchit pour répercuter les valeurs.
          if (!modal.hidden && modalContent.querySelector(".w-total")) {
            const a = loadAcct();
            if (a) openDashboard();
          }
        }
      })
      .catch(() => {});
  })();
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
