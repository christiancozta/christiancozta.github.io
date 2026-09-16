"use strict";
(() => {
  const page = location.pathname.split("/").pop().toLowerCase();
  const key = page === "echo.html" ? "echo" : page === "data.html" ? "data" : "";

  if (key) {
    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach((node) => node.remove());
      const base = `assets/${key}/brand/`;
      const icons = [
        { rel: "icon", href: `${base}favicon.svg?v=20260916`, type: "image/svg+xml", sizes: "any" },
        { rel: "icon", href: `${base}favicon-64.png?v=20260916`, type: "image/png", sizes: "64x64" },
        { rel: "icon", href: `${base}favicon-48.png?v=20260916`, type: "image/png", sizes: "48x48" },
        { rel: "icon", href: `${base}favicon-32.png?v=20260916`, type: "image/png", sizes: "32x32" },
        { rel: "icon", href: `${base}favicon-16.png?v=20260916`, type: "image/png", sizes: "16x16" },
        { rel: "shortcut icon", href: `${base}favicon.ico?v=20260916`, type: "image/x-icon", sizes: "any" }
      ];
      for (const spec of icons) {
        const link = document.createElement("link");
        Object.assign(link, spec);
        document.head.appendChild(link);
      }
    }, { once: true });
  }

  document.write('<script src="assets/shared/js/support-core-20260916.js?v=20260916"></script>');
})();
