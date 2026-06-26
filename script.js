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
// 1.5 = l'utilisateur scrolle ~150vh sans que la section ne défile.
const PIN_DISTANCE = 1.5;

// Unité de référence du parallax (en px). Les multiplicateurs de vitesse
// ci-dessous sont appliqués à cette référence = 1 hauteur de viewport.
const PARALLAX_REF = () => window.innerHeight;

/* --- CIEL (calque de fond, très lent) --- */
// Vitesse de translation verticale du ciel (× la référence). ~0.2x = lent.
const SKY_SPEED = 0.2;
// Scale final du ciel (effet d'éloignement subtil).
const SKY_SCALE = 1.05;

/* --- COLLINE (premier plan, rapide) --- */
// Vitesse de translation verticale de la colline (× la référence). ~0.9x = rapide.
const MOUNTAIN_SPEED = 0.9;
// Scale final de la colline (effet caméra qui avance vers la colline).
const MOUNTAIN_SCALE = 1.3;

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
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      // pin pendant PIN_DISTANCE × viewport
      end: () => "+=" + window.innerHeight * PIN_DISTANCE,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true, // recalcule les valeurs () au resize
      // markers: true, // ← décommente pour visualiser start/end en dev
    },
  });

  // CIEL : translateY lent (vers le haut) + léger scale.
  tl.fromTo(
    sky,
    { y: 0, scale: 1 },
    {
      // déplacement vertical du ciel = +(SKY_SPEED × référence) en px
      // (positif = vers le BAS : on scrolle vers le bas → le ciel descend, lentement)
      y: () => SKY_SPEED * PARALLAX_REF(),
      scale: SKY_SCALE,
      ease: "none",
    },
    0 // démarre à t=0 sur la timeline
  );

  // PANNEAU : remonte de PANEL_FROM_Y à PANEL_TO_Y + fade-in.
  tl.fromTo(
    panel,
    { yPercent: 100, opacity: 0 },
    {
      // translateY de bas en haut (les % sont relatifs à la hauteur du panneau)
      yPercent: -20,
      opacity: 1,
      ease: "none",
    },
    0
  );

  // COLLINE : translateY rapide (vers le haut) + gros scale (caméra qui avance).
  tl.fromTo(
    mountain,
    { y: 0, scale: 1 },
    {
      // déplacement vertical de la colline = +(MOUNTAIN_SPEED × référence) en px
      // (positif = vers le BAS : on scrolle vers le bas → la colline descend, vite)
      y: () => MOUNTAIN_SPEED * PARALLAX_REF(),
      scale: MOUNTAIN_SCALE,
      ease: "none",
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
