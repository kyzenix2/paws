const SITE = {
  ca: "0xdbd789230e1da543e13152ef6ff1ed18b879519f",
  twitter: "https://x.com/Paws_rh_x",
  telegram: "",
  chainSlug: "robinhood",
  // DexScreener charts the token on its pair page, not the contract address.
  chartAddress: "0x740e35047419d02dc642ba8c78719bdb41907b99",
};

function isRealCa(value) {
  const ca = (value || "").trim();
  return ca.length > 0 && ca.toUpperCase() !== "TBA";
}

function setLink(node, url) {
  if (!url) {
    node.href = "#";
    node.removeAttribute("target");
    node.removeAttribute("rel");
    return;
  }

  node.href = url;
  node.target = "_blank";
  node.rel = "noopener noreferrer";
}

function applySite() {
  const real = isRealCa(SITE.ca);
  const ca = real ? SITE.ca.trim() : "TBA";

  document.querySelectorAll("[data-ca]").forEach((node) => {
    node.textContent = ca;
  });

  const buyUrl = real
    ? `https://app.uniswap.org/swap?chain=robinhood&outputCurrency=${encodeURIComponent(ca)}`
    : "";
  document.querySelectorAll("[data-buy]").forEach((node) => setLink(node, buyUrl));

  const chartAddress = real ? (SITE.chartAddress || ca).trim() : "";
  const chartUrl = chartAddress
    ? `https://dexscreener.com/${SITE.chainSlug}/${encodeURIComponent(chartAddress)}`
    : "";
  document.querySelectorAll("[data-chart-link]").forEach((node) => setLink(node, chartUrl));

  const frame = document.querySelector("[data-chart-frame]");
  const placeholder = document.querySelector("[data-chart-placeholder]");
  if (frame && placeholder) {
    if (real) {
      frame.src = `${chartUrl}?embed=1&theme=dark&trades=0&info=0`;
      frame.classList.remove("hidden");
      placeholder.classList.add("hidden");
    } else {
      frame.removeAttribute("src");
      frame.classList.add("hidden");
      placeholder.classList.remove("hidden");
    }
  }

  document.querySelectorAll("[data-x]").forEach((node) => {
    setLink(node, (SITE.twitter || "").trim());
  });

  if (!(SITE.telegram || "").trim()) {
    document.querySelectorAll("[data-telegram]").forEach((node) => node.remove());
  } else {
    document.querySelectorAll("[data-telegram]").forEach((node) => {
      setLink(node, SITE.telegram.trim());
    });
  }
}

function flashCopied(button) {
  const label = button.querySelector("[data-copy-label]");
  if (!label) return;
  const original = button.dataset.label || "Copy";
  label.textContent = "Copied!";
  button.classList.add("is-copied");
  window.clearTimeout(button._copyTimer);
  button._copyTimer = window.setTimeout(() => {
    label.textContent = original;
    button.classList.remove("is-copied");
  }, 1600);
}

function fallbackCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (err) {
    ok = false;
  }
  area.remove();
  return ok;
}

function copyCa(button) {
  const text = isRealCa(SITE.ca) ? SITE.ca.trim() : "TBA";
  const legacyOk = fallbackCopy(text);

  if (legacyOk) flashCopied(button);

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      if (!legacyOk) flashCopied(button);
    }).catch(() => {});
  }
}

function updateActiveNav() {
  const marker = window.scrollY + 110;
  let current = "";
  document.querySelectorAll("main section[id]").forEach((section) => {
    if (section.offsetTop <= marker) current = section.id;
  });
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
  });
}

function init() {
  applySite();

  document.addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-copy]");
    if (copyButton) {
      event.preventDefault();
      copyCa(copyButton);
      return;
    }

    const link = event.target.closest("a[href='#']");
    if (link) event.preventDefault();
  });

  const menu = document.querySelector("[data-menu]");
  if (menu) {
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => menu.removeAttribute("open"));
    });
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateActiveNav();
        ticking = false;
      });
    },
    { passive: true }
  );
  updateActiveNav();
}

init();
