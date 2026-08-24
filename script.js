const body = document.body;
const revealItems = [...document.querySelectorAll(".reveal")];
const navLinks = [...document.querySelectorAll(".site-nav a")];
const sections = [...document.querySelectorAll("main section[id], main section")];
const trackedSections = [...document.querySelectorAll("main section[id]")];
const progressBar = document.querySelector(".scroll-progress-bar");
const cursorGlow = document.querySelector(".cursor-glow");
const parallaxLayers = [...document.querySelectorAll(".parallax-layer")];
const counters = [...document.querySelectorAll("[data-count-to]")];
const magneticItems = [...document.querySelectorAll(".magnetic")];
const interactiveCards = [
    ...document.querySelectorAll(
        ".hero-facts li, .content-card, .metric-card, .timeline-item, .project-card, .education-card, .skill-panel, .contact-card, .contact-shell, .contact-method, .contact-form-panel"
        + ", .research-card"
    ),
];
const tiltCard = document.querySelector(".tilt-card");
const contactForm = document.querySelector("#contact-form");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-order", `${index}`);
});

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.1,
        rootMargin: "0px 0px -24px 0px",
    }
);

revealItems.forEach((item) => revealObserver.observe(item));

const formatCounterValue = (value, decimals, prefix, suffix, padLength) => {
    const rounded = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
    const padded = /^\d+$/.test(rounded) && padLength > 0 ? rounded.padStart(padLength, "0") : rounded;
    return `${prefix}${padded}${suffix}`;
};

const animateCounter = (counter) => {
    if (counter.dataset.counted === "true") {
        return;
    }

    const target = Number(counter.dataset.countTo || 0);
    const decimals = Number(counter.dataset.decimals || 0);
    const prefix = counter.dataset.prefix || "";
    const suffix = counter.dataset.suffix || "";
    const padLength = Number(counter.dataset.padLength || 0);
    const duration = 1200;
    const start = performance.now();

    counter.dataset.counted = "true";

    const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = target * eased;
        counter.textContent = formatCounterValue(current, decimals, prefix, suffix, padLength);

        if (progress < 1) {
            window.requestAnimationFrame(tick);
        } else {
            counter.textContent = formatCounterValue(target, decimals, prefix, suffix, padLength);
        }
    };

    window.requestAnimationFrame(tick);
};

if (!prefersReducedMotion) {
    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.45,
        }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
} else {
    counters.forEach((counter) => {
        const target = Number(counter.dataset.countTo || 0);
        const decimals = Number(counter.dataset.decimals || 0);
        const prefix = counter.dataset.prefix || "";
        const suffix = counter.dataset.suffix || "";
        const padLength = Number(counter.dataset.padLength || 0);
        counter.textContent = formatCounterValue(target, decimals, prefix, suffix, padLength);
    });
}

const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
            }
        });
    },
    {
        threshold: 0.18,
    }
);

sections.forEach((section) => sectionObserver.observe(section));

const setActiveNav = () => {
    let currentSection = null;

    trackedSections.forEach((section) => {
        const top = section.getBoundingClientRect().top;
        if (top <= 160) {
            currentSection = section;
        }
    });

    navLinks.forEach((link) => {
        const isActive = currentSection && link.getAttribute("href") === `#${currentSection.id}`;
        link.classList.toggle("is-active", Boolean(isActive));
    });
};

const setScrollProgress = () => {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    progressBar.style.width = `${progress}%`;
};

const updateParallax = () => {
    const viewportCenter = window.innerHeight / 2;

    parallaxLayers.forEach((layer) => {
        const speed = Number(layer.dataset.parallaxSpeed || 0.1);
        const rect = layer.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - viewportCenter) * speed * -0.16;
        layer.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    });
};

const updateOnScroll = () => {
    setActiveNav();
    setScrollProgress();
    updateParallax();
};

const updateCursorGlow = (event) => {
    if (!cursorGlow || prefersReducedMotion) {
        return;
    }

    cursorGlow.style.opacity = "1";
    cursorGlow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
};

let ticking = false;

const requestTick = () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateOnScroll();
            ticking = false;
        });
        ticking = true;
    }
};

interactiveCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mouse-x", `${x}%`);
        card.style.setProperty("--mouse-y", `${y}%`);
    });
});

if (!prefersReducedMotion) {
    magneticItems.forEach((item) => {
        item.addEventListener("pointermove", (event) => {
            const rect = item.getBoundingClientRect();
            const offsetX = event.clientX - rect.left - rect.width / 2;
            const offsetY = event.clientY - rect.top - rect.height / 2;
            item.style.transform = `translate(${offsetX * 0.06}px, ${offsetY * 0.08}px)`;
        });

        item.addEventListener("pointerleave", () => {
            item.style.transform = "";
        });
    });
}

if (tiltCard) {
    const resetTilt = () => {
        tiltCard.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)";
    };

    tiltCard.addEventListener("pointermove", (event) => {
        const rect = tiltCard.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const rotateY = (px - 0.5) * 10;
        const rotateX = (0.5 - py) * 10;

        tiltCard.style.setProperty("--mouse-x", `${px * 100}%`);
        tiltCard.style.setProperty("--mouse-y", `${py * 100}%`);
        tiltCard.style.transform =
            `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.01)`;
    });

    tiltCard.addEventListener("pointerleave", resetTilt);
}

if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!contactForm.reportValidity()) {
            return;
        }

        const formData = new FormData(contactForm);
        const name = (formData.get("name") || "").toString().trim();
        const email = (formData.get("email") || "").toString().trim();
        const message = (formData.get("message") || "").toString().trim();

        const subject = `Liên hệ từ portfolio - ${name}`;
        const body = [
            `Họ và tên: ${name}`,
            `Email: ${email}`,
            "",
            "Lời nhắn:",
            message,
        ].join("\n");

        window.location.href =
            `mailto:huonggiang16032005@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
}

window.addEventListener("scroll", requestTick, { passive: true });
window.addEventListener("resize", requestTick);
window.addEventListener("pointermove", updateCursorGlow, { passive: true });

window.addEventListener("pointerleave", () => {
    if (cursorGlow) {
        cursorGlow.style.opacity = "0";
    }
});

window.addEventListener("load", () => {
    body.classList.remove("is-loading");
    body.classList.add("is-ready");
    updateOnScroll();
});
