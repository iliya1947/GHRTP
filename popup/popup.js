(() => {
  const STORAGE_KEY = "githubRuTranslatorEnabled";
  const enabledCheckbox = document.getElementById("enabled");

  chrome.storage.sync.get([STORAGE_KEY], (result) => {
    enabledCheckbox.checked = result[STORAGE_KEY] !== false;
  });

  enabledCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({
      [STORAGE_KEY]: enabledCheckbox.checked
    });
  });
})();
