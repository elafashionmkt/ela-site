
/**
 * Manual fixes on top of Pixso export
 * - Sticky/fixed header behavior (within Pixso scroll)
 * - Functional accordion (one open at a time)
 * - Layout reflow: push sections below accordion when it expands
 * - Optional micro-animations using existing GSAP bundle
 */
(function () {
  const $id = (id) => document.getElementById(id);

  function getScrollEl() {
    // Pixso export usually scrolls inside #2_7; fallback to outer container.
    const a = $id("2_7");
    if (a && (a.scrollHeight > a.clientHeight || getComputedStyle(a).overflowY.includes("auto"))) return a;
    return document.querySelector(".scroll-container-0_1") || window;
  }

  function px(n) { return `${Math.round(n * 1000) / 1000}px`; }

  function setupAccordion() {
    const root = $id("7_17");
    if (!root) return;

    const items = Array.from(root.querySelectorAll("[data-acc-item]"));
    if (!items.length) return;

    // Base layout measurements (for pushing content below)
    const container = $id("2_7");
    const baseContainerH = container ? container.getBoundingClientRect().height : 0;

    const servicesTop = root.offsetTop; // because it's absolute inside #2_7
    const baseServicesH = root.getBoundingClientRect().height;

    const siblings = container
      ? Array.from(container.children).filter((el) => el !== root)
      : [];

    const below = siblings.filter((el) => {
      const top = el.offsetTop ?? 0;
      return top > servicesTop;
    });

    function applyShift(delta) {
      // Push sections below the accordion down by delta
      below.forEach((el) => {
        el.style.transform = delta ? `translateY(${px(delta)})` : "";
      });

      // Grow the scroll container height so nothing gets clipped
      if (container) {
        const base = parseFloat(getComputedStyle(container).height) || baseContainerH;
        container.style.height = px(base + delta);
      }
    }

    function closeItem(item) {
      const btn = item.querySelector(".ela-acc__trigger");
      const panel = item.querySelector(".ela-acc__panel");
      if (!btn || !panel) return;

      item.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-expanded", "false");

      // Animate close
      if (window.gsap) {
        gsap.killTweensOf(panel);
        gsap.to(panel, {
          height: 0,
          opacity: 0,
          duration: 0.25,
          ease: "power2.out",
          onComplete: () => {
            panel.hidden = true;
            panel.style.height = "";
            panel.style.opacity = "";
          }
        });
      } else {
        panel.hidden = true;
      }
    }

    function openItem(item) {
      const btn = item.querySelector(".ela-acc__trigger");
      const panel = item.querySelector(".ela-acc__panel");
      if (!btn || !panel) return;

      item.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-expanded", "true");

      panel.hidden = false;

      // Animate open to natural height
      const target = panel.scrollHeight;

      if (window.gsap) {
        gsap.killTweensOf(panel);
        gsap.fromTo(panel,
          { height: 0, opacity: 0 },
          { height: target, opacity: 1, duration: 0.3, ease: "power2.out", onComplete: () => {
              panel.style.height = "auto";
              panel.style.opacity = "";
            }
          }
        );
      } else {
        panel.style.height = "auto";
      }
    }

    function recalcShift() {
      // Let layout settle, then measure.
      requestAnimationFrame(() => {
        const newH = root.getBoundingClientRect().height;
        const delta = Math.max(0, newH - baseServicesH);
        applyShift(delta);
      });
    }

    items.forEach((item) => {
      const btn = item.querySelector(".ela-acc__trigger");
      if (!btn) return;

      btn.addEventListener("click", () => {
        const isOpen = item.getAttribute("aria-expanded") === "true";

        items.forEach((it) => closeItem(it));

        if (!isOpen) openItem(item);

        recalcShift();
      });
    });

    // Start with all closed
    items.forEach((it) => closeItem(it));
    recalcShift();
  }

  function setupScrollClass() {
    const scrollEl = getScrollEl();
    const nav = $id("7_15");
    if (!nav) return;

    function onScroll() {
      const y = scrollEl === window ? window.scrollY : scrollEl.scrollTop;
      nav.classList.toggle("is-scrolled", y > 8);
    }

    if (scrollEl === window) {
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      scrollEl.addEventListener("scroll", onScroll, { passive: true });
    }
    onScroll();
  }

  function setupSectionAnimations() {
    // Use the existing GSAP bundle if present
    if (!window.gsap || !window.ScrollTrigger) return;

    const sections = [
      $id("7_14"),
      $id("7_13"),
      $id("7_17"),
      $id("7_18"),
      $id("7_19"),
      $id("7_20")
    ].filter(Boolean);

    sections.forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 18 }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Keep original Pixso inline animation logic (moved here)

const $ = id => document.getElementById(id);

CustomEase.create("LINEAR", "0,0,1,1");

const tl_1 = gsap.timeline({ paused: true })
  .set($('2_7'), {position: 'fixed', top: 0, left: 0})
  .set($('0_0'), {position: 'fixed', top: 0, left: 0})
  .set($('0_0'), { display: 'block' })
    .to($('2_7'), { display: 'none', duration: '0' });

$('2_7').addEventListener("click", e => {
  e.stopPropagation();
  tl_1.play();
});

$('2_7').addEventListener("click", e => {
  e.stopPropagation();
  const container = $('2_7')
  const rect = $('2_7').getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const targetY = rect.top - containerRect.top + container.scrollTop + 0;
  const targetX = rect.left - containerRect.left + container.scrollLeft + 0;
  gsap.to(container, {
    scrollTo: { x: targetX, y: targetY },
    duration: 0.3,
    ease: "LINEAR"
  });
});


    // Add missing behaviors
    setupAccordion();
    setupScrollClass();
    setupSectionAnimations();
  });
})();
