(() => {
  const key = "senda-theme";
  const system = matchMedia("(prefers-color-scheme: dark)");
  let preference;
  try { preference = localStorage.getItem(key); } catch {}
  function render() {
    const dark = preference === "dark" || (preference !== "light" && system.matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.querySelector('meta[name="theme-color"]').content = dark ? "#161b2a" : "#f9f5eb";
    const button = document.getElementById("theme-toggle");
    if (button) button.setAttribute("aria-pressed", String(dark));
  }
  render();
  system.addEventListener("change", render);
  window.addEventListener("storage", event => {
    if (event.key === key || event.key === null) {
      preference = event.newValue;
      render();
    }
  });
  document.addEventListener("DOMContentLoaded", () => {
    render();
    document.getElementById("theme-toggle").addEventListener("click", () => {
      preference = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem(key, preference); } catch {}
      render();
    });
  });
})();
