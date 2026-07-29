(function () {
  const STORE_KEY = "sp_saved";

  function getStore() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function setStore(store) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }

  function getSavedItems(user) {
    const store = getStore();
    return store[user] || [];
  }

  function isSaved(user, id) {
    return getSavedItems(user).some((item) => item.id === id);
  }

  function toggleSaved(user, item) {
    const store = getStore();
    const list = store[user] || [];
    const idx = list.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(item);
    }
    store[user] = list;
    setStore(store);
    window.dispatchEvent(new CustomEvent("sp-saved-change"));
  }

  function removeSaved(user, id) {
    const store = getStore();
    store[user] = (store[user] || []).filter((i) => i.id !== id);
    setStore(store);
    window.dispatchEvent(new CustomEvent("sp-saved-change"));
  }

  function renderSaveButton(elId, item) {
    const holder = document.getElementById(elId);
    if (!holder) return;

    function draw() {
      const user = window.SPAuth.getUser();
      const saved = user && isSaved(user, item.id);
      holder.innerHTML = `<button id="${elId}Btn" class="save-btn ${saved ? "saved" : ""}" type="button">${saved ? "★ Saved" : "☆ Save"}</button>`;
      document.getElementById(elId + "Btn").addEventListener("click", () => {
        window.SPAuth.requireLogin((user) => {
          toggleSaved(user, item);
          draw();
        });
      });
    }

    draw();
    window.addEventListener("sp-auth-change", draw);
  }

  window.SPSaved = {
    getSavedItems: getSavedItems,
    removeSaved: removeSaved,
    renderSaveButton: renderSaveButton,
  };
})();
