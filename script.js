const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const year = document.querySelector("#year");
const revealItems = document.querySelectorAll(".reveal");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const offGridCarousel = document.querySelector("[data-off-grid-carousel]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (year) {
  year.textContent = new Date().getFullYear();
}

const updateHeaderState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

if (!reducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (!reducedMotion && hero) {
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let scrollOffset = 0;

  const render = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    hero.style.setProperty("--hero-shift-x", `${currentX}px`);
    hero.style.setProperty("--hero-shift-y", `${currentY - scrollOffset}px`);

    window.requestAnimationFrame(render);
  };

  hero.addEventListener(
    "pointermove",
    (event) => {
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;

      targetX = x * 20;
      targetY = y * 16;
    },
    { passive: true }
  );

  hero.addEventListener(
    "pointerleave",
    () => {
      targetX = 0;
      targetY = 0;
    },
    { passive: true }
  );

  window.addEventListener(
    "scroll",
    () => {
      scrollOffset = Math.min(window.scrollY * 0.015, 8);
    },
    { passive: true }
  );

  render();
}

if (offGridCarousel) {
  const cards = Array.from(offGridCarousel.querySelectorAll(".off-grid-card"));
  let offGridTicking = false;

  const updateOffGridActive = () => {
    const center =
      offGridCarousel.scrollLeft + offGridCarousel.clientWidth / 2;

    let activeCard = cards[0];
    let smallestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - center);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        activeCard = card;
      }
    });

    cards.forEach((card) => {
      card.classList.toggle("is-active", card === activeCard);
    });
  };

  const requestOffGridUpdate = () => {
    if (offGridTicking) {
      return;
    }

    offGridTicking = true;
    window.requestAnimationFrame(() => {
      updateOffGridActive();
      offGridTicking = false;
    });
  };

  updateOffGridActive();
  offGridCarousel.addEventListener("scroll", requestOffGridUpdate, {
    passive: true,
  });
  window.addEventListener("resize", requestOffGridUpdate);

  offGridCarousel.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      if (offGridCarousel.scrollWidth <= offGridCarousel.clientWidth) {
        return;
      }

      event.preventDefault();
      offGridCarousel.scrollLeft += event.deltaY;
    },
    { passive: false }
  );
}

const supportsCustomCursor = false;

if (supportsCustomCursor) {
  document.documentElement.classList.add("has-custom-cursor");

  const root = document.documentElement;
  const interactiveSelector = [
    "a",
    "button",
    ".button",
    ".text-link",
    ".case-study__link",
    ".contact__links a",
  ].join(", ");

  let dotX = -100;
  let dotY = -100;
  let ringX = -100;
  let ringY = -100;

  const setHoverState = (target) => {
    const isInteractive = Boolean(target?.closest(interactiveSelector));
    cursorDot.classList.toggle("is-hover", isInteractive);
    cursorRing.classList.toggle("is-hover", isInteractive);
  };

  const renderCursor = () => {
    ringX += (dotX - ringX) * 0.18;
    ringY += (dotY - ringY) * 0.18;

    root.style.setProperty("--cursor-x", `${dotX}px`);
    root.style.setProperty("--cursor-y", `${dotY}px`);
    cursorRing.style.setProperty("--cursor-x", `${ringX}px`);
    cursorRing.style.setProperty("--cursor-y", `${ringY}px`);

    window.requestAnimationFrame(renderCursor);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      dotX = event.clientX;
      dotY = event.clientY;

      cursorDot.classList.add("is-visible");
      cursorRing.classList.add("is-visible");
      setHoverState(event.target);
    },
    { passive: true }
  );

  window.addEventListener(
    "pointerdown",
    () => {
      cursorDot.classList.add("is-pressed");
      cursorRing.classList.add("is-pressed");
    },
    { passive: true }
  );

  window.addEventListener(
    "pointerup",
    () => {
      cursorDot.classList.remove("is-pressed");
      cursorRing.classList.remove("is-pressed");
    },
    { passive: true }
  );

  document.documentElement.addEventListener("mouseleave", () => {
    cursorDot.classList.remove("is-visible", "is-hover", "is-pressed");
    cursorRing.classList.remove("is-visible", "is-hover", "is-pressed");
  });

  document.documentElement.addEventListener("mouseenter", () => {
    cursorDot.classList.add("is-visible");
    cursorRing.classList.add("is-visible");
  });

  window.addEventListener("blur", () => {
    cursorDot.classList.remove("is-visible", "is-hover", "is-pressed");
    cursorRing.classList.remove("is-visible", "is-hover", "is-pressed");
  });

  renderCursor();
}
