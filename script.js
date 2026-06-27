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
  });
});

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
