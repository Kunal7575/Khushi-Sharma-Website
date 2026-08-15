(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
  const trackedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  const progressBar = document.querySelector(".scroll-progress span");

  function closeMenu() {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    nav.classList.remove("open");
    document.body.classList.remove("menu-open");
  }

  menuButton?.addEventListener("click", () => {
    const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(willOpen));
    menuButton.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
    nav?.classList.toggle("open", willOpen);
    document.body.classList.toggle("menu-open", willOpen);
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  let scrollFrame = null;
  function updateScrollUI() {
    const scrollTop = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, scrollTop / scrollable)) : 0;

    header?.classList.toggle("scrolled", scrollTop > 24);
    if (progressBar) progressBar.style.width = `${progress * 100}%`;

    if (trackedSections.length) {
      const referencePoint = scrollTop + window.innerHeight * 0.36;
      let activeId = trackedSections[0].id;
      trackedSections.forEach((section) => {
        if (referencePoint >= section.offsetTop) activeId = section.id;
      });
      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${activeId}`;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    }
    scrollFrame = null;
  }

  window.addEventListener("scroll", () => {
    if (scrollFrame === null) scrollFrame = window.requestAnimationFrame(updateScrollUI);
  }, { passive: true });
  updateScrollUI();

  const words = [...document.querySelectorAll(".word")];
  let currentWordIndex = 0;
  words.forEach((word, index) => word.setAttribute("aria-hidden", index === 0 ? "false" : "true"));

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && words.length > 1) {
    window.setInterval(() => {
      words[currentWordIndex].classList.remove("active");
      words[currentWordIndex].setAttribute("aria-hidden", "true");
      currentWordIndex = (currentWordIndex + 1) % words.length;
      words[currentWordIndex].classList.add("active");
      words[currentWordIndex].setAttribute("aria-hidden", "false");
    }, 3200);
  }

  const revealElements = [...document.querySelectorAll("[data-reveal]")];
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  const counters = [...document.querySelectorAll("[data-count]")];
  function animateCounter(element) {
    const target = Number(element.dataset.count || 0);
    const suffix = element.dataset.suffix || "";
    const start = performance.now();
    function tick(now) {
      const elapsed = Math.min(1, (now - start) / 1200);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      element.textContent = `${Math.floor(target * eased)}${suffix}`;
      if (elapsed < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.7 });
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  const clock = document.querySelector("#live-clock");
  const timeFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short"
  });

  function updateClock() {
    if (clock) clock.textContent = timeFormatter.format(new Date());
  }
  updateClock();
  window.setInterval(updateClock, 1000);

  const copyButton = document.querySelector("#copy-email");
  copyButton?.addEventListener("click", async () => {
    const email = copyButton.dataset.email;
    if (!email) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const temporaryInput = document.createElement("textarea");
        temporaryInput.value = email;
        temporaryInput.setAttribute("readonly", "");
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        document.execCommand("copy");
        temporaryInput.remove();
      }
      copyButton.textContent = "Email copied";
      copyButton.classList.add("copied");
      window.setTimeout(() => {
        copyButton.textContent = "Copy email";
        copyButton.classList.remove("copied");
      }, 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1080) closeMenu();
  });
})();
