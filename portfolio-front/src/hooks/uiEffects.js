// src/hooks/uiEffects.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* =========================================================
   1) useHoverDescription  (≃ hoverChangeDescription)
   ---------------------------------------------------------
   - Maintient un texte courant + helpers pour binder chaque carte
   ========================================================= */
export function useHoverDescription(defaultText = "*Survoler les cartes avec le curseur*") {
  const [text, setText] = useState(defaultText);

  const getHoverProps = useCallback(
    (hoverText) => ({
      onMouseOver: () => setText(hoverText),
      onMouseOut: () => setText(defaultText),
    }),
    [defaultText]
  );

  return { text, setText, getHoverProps };
}

/* =========================================================
   2) useExperienceTabs  (≃ hoverChangeExperience + active)
   ---------------------------------------------------------
   - Gère un “onglet” actif (au clic) + classe active
   ========================================================= */
export function useExperienceTabs(items = []) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] || null;

  const getTabProps = useCallback(
    (index) => ({
      onClick: () => setActiveIndex(index),
      "data-active": index === activeIndex ? "true" : "false",
    }),
    [activeIndex]
  );

  return { activeIndex, setActiveIndex, active, getTabProps };
}

/* =========================================================
   3) useProjectDetails  (≃ projetDetaille.js)
   ---------------------------------------------------------
   - Ouvre/ferme une carte détaillée par id
   ========================================================= */
export function useProjectDetails() {
  const [openId, setOpenId] = useState(null);
  const open = useCallback((id) => setOpenId(id), []);
  const close = useCallback(() => setOpenId(null), []);
  const isOpen = useCallback((id) => openId === id, [openId]);

  return { openId, open, close, isOpen };
}

/* =========================================================
   4) useReveal / Reveal  (remplace ScrollReveal sans lib)
   ---------------------------------------------------------
   - IntersectionObserver: ajoute la classe .is-revealed
   - <Reveal> composant helper si tu préfères un wrapper
   ========================================================= */
export function useReveal({ rootMargin = "0px 0px -10% 0px", threshold = 0.15, once = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("will-reveal"); // état initial (opacity 0 + translate)

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("is-revealed");
            if (once) io.unobserve(el);
          }
        });
      },
      { root: null, rootMargin, threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold, once]);

  return ref;
}

export function Reveal({ children, ...opts }) {
  const ref = useReveal(opts);
  return (
    <div ref={ref} className="will-reveal">
      {children}
    </div>
  );
}

/* =========================================================
   5) useTypewriter  (≃ typeWrite.js)
   ---------------------------------------------------------
   - Retourne le texte “tapé” progressivement
   - speedChars: nb de caractères ajoutés par frame (~60fps)
   ========================================================= */
export function useTypewriter(fullText, { speedChars = 1.5, start = true } = {}) {
  const [text, setText] = useState("");
  const iRef = useRef(0);
  const playing = useRef(false);

  useEffect(() => {
    if (!start) return;
    playing.current = true;
    let raf = 0;

    const step = () => {
      if (!playing.current) return;
      iRef.current += speedChars;
      const i = Math.min(Math.floor(iRef.current), fullText.length);
      setText(fullText.slice(0, i));
      if (i < fullText.length) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => {
      playing.current = false;
      cancelAnimationFrame(raf);
    };
  }, [fullText, speedChars, start]);

  return text;
}
