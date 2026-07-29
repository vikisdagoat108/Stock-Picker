(function () {
  const ROOT = location.pathname.includes("/picks/") ? "../" : "";
  const THEME_KEY = "sp_theme";
  const USER_KEY = "sp_user";

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || "dark";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function getUser() {
    return localStorage.getItem(USER_KEY);
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function renderTopbar() {
    let bar = document.getElementById("topbar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "topbar";
      bar.className = "topbar";
      document.body.insertBefore(bar, document.body.firstChild);
    }

    const theme = getTheme();
    const user = getUser();

    bar.innerHTML = `
      <a href="${ROOT}welcome.html" class="topbar-logo">📈 Simple Stock Picks</a>
      <div class="topbar-right">
        <button id="themeToggleBtn" class="theme-toggle-btn" type="button">${theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}</button>
        ${
          user
            ? `<a href="${ROOT}saved.html" class="signout-btn" style="text-decoration:none;">⭐ Saved</a><span class="user-chip">👤 ${escapeHtml(user)}</span><button id="signOutBtn" class="signout-btn" type="button">Sign Out</button>`
            : `<button id="loginBtn" class="login-btn" type="button">Log In</button>`
        }
      </div>
    `;

    document.getElementById("themeToggleBtn").addEventListener("click", () => {
      setTheme(getTheme() === "dark" ? "light" : "dark");
      renderTopbar();
    });

    if (user) {
      document.getElementById("signOutBtn").addEventListener("click", () => {
        localStorage.removeItem(USER_KEY);
        renderTopbar();
        window.dispatchEvent(new CustomEvent("sp-auth-change"));
      });
    } else {
      document.getElementById("loginBtn").addEventListener("click", () => openLoginModal());
    }
  }

  function openLoginModal(onSuccess) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal-card">
        <h3>Log In</h3>
        <p class="modal-note">This just remembers your name on this device so the site can greet you and save your picks — there's no real account, password, or data collection.</p>
        <input type="text" id="loginNameInput" placeholder="Your name" autocomplete="off" maxlength="40">
        <div class="modal-actions">
          <button class="modal-cancel" id="modalCancelBtn" type="button">Cancel</button>
          <button class="modal-submit" id="modalSubmitBtn" type="button">Log In</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById("loginNameInput");
    input.focus();

    function close() {
      overlay.remove();
    }
    function submit() {
      const name = input.value.trim();
      if (!name) {
        input.focus();
        return;
      }
      localStorage.setItem(USER_KEY, name);
      close();
      renderTopbar();
      window.dispatchEvent(new CustomEvent("sp-auth-change"));
      if (typeof onSuccess === "function") onSuccess(name);
    }

    document.getElementById("modalCancelBtn").addEventListener("click", close);
    document.getElementById("modalSubmitBtn").addEventListener("click", submit);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
      if (e.key === "Escape") close();
    });
  }

  window.SPAuth = {
    getUser: getUser,
    requireLogin: function (onReady) {
      const user = getUser();
      if (user) {
        onReady(user);
      } else {
        openLoginModal(onReady);
      }
    },
  };

  document.addEventListener("DOMContentLoaded", renderTopbar);
})();
