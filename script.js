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

// Durée du pinning, en multiple de la hauteur du viewport.
// 0.55 = l'animation se termine très vite (~55vh de scroll seulement).
const PIN_DISTANCE = 0.55;

// Le dock sort TÔT : il finit d'apparaître à cette fraction de l'animation.
// 0.5 = dock entièrement révélé à mi-parcours (donc très rapidement).
const DOCK_REVEAL = 0.5;

// Unité de référence du parallax (en px). Les multiplicateurs de vitesse
// ci-dessous sont appliqués à cette référence = 1 hauteur de viewport.
const PARALLAX_REF = () => window.innerHeight;

/* --- CIEL (calque de fond, très lent) --- */
// Vitesse de translation verticale du ciel (× la référence). ~0.11x = très lent.
const SKY_SPEED = 0.11;
// Scale final du ciel (effet d'éloignement subtil).
const SKY_SCALE = 1.04;

/* --- COLLINE (premier plan) --- */
// Vitesse de descente de la colline (× la référence). ~0.25x : elle descend
// juste assez pour révéler le dock, tout en restant TRÈS visible.
const MOUNTAIN_SPEED = 0.25;
// Scale final de la colline (léger, pour ne pas masquer le dock).
const MOUNTAIN_SCALE = 1.05;

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
const mm = gsap.matchMedia();

/* ============================================================
   1) DESKTOP (>= 768px) + mouvement autorisé
      → expérience complète : pin + scrub.
   ============================================================ */
mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
  const tl = gsap.timeline({
    defaults: { duration: 1 }, // durée "de référence" de la timeline
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      // pin court : l'animation se boucle en PIN_DISTANCE × viewport
      end: () => "+=" + window.innerHeight * PIN_DISTANCE,
      pin: true,
      scrub: 0.8, // < lissage doux pour un rendu bien fluide
      invalidateOnRefresh: true, // recalcule les valeurs () au resize
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

  // DOCK : sort TÔT — durée courte (DOCK_REVEAL) + ease pour un settle fluide.
  // Il est entièrement révélé bien avant la fin du pin.
  tl.fromTo(
    panel,
    { yPercent: 100, opacity: 0 },
    {
      yPercent: -50, // centré dans le viewport (au-dessus des collines)
      opacity: 1,
      duration: DOCK_REVEAL,
      ease: "power2.out",
    },
    0
  );
});

/* ============================================================
   2) MOBILE (< 768px) + mouvement autorisé
      → pas de pin : juste un parallax léger pendant que le hero
        défile normalement.
   ============================================================ */
mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
  const tlMobile = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  // Ciel : très léger déplacement vers le bas.
  tlMobile.fromTo(
    sky,
    { y: 0 },
    { y: () => SKY_SPEED * 0.5 * PARALLAX_REF(), ease: "none" },
    0
  );

  // Colline : déplacement vers le bas un peu plus marqué (sans scale fort, mobile = sobre).
  tlMobile.fromTo(
    mountain,
    { y: 0 },
    { y: () => MOUNTAIN_SPEED * 0.5 * PARALLAX_REF(), ease: "none" },
    0
  );

  // Panneau : simple fade-in pendant la descente.
  tlMobile.fromTo(
    panel,
    { opacity: 0, yPercent: 30 },
    { opacity: 1, yPercent: 0, ease: "none" },
    0
  );
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
   Interactivité du dock : bascule l'onglet actif au clic.
   ============================================================ */
const dockTabs = document.querySelectorAll(".dock-tab");
dockTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    dockTabs.forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");
  });
});
