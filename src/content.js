(() => {
  const STORAGE_KEY = "githubRuTranslatorEnabled";

  const shouldSkipNode = (node) => {
    const parent = node.parentElement;
    if (!parent) return true;
    return ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"].includes(parent.tagName);
  };

  const normalize = (text) => text.replace(/\s+/g, " ").trim();

  const translateTextNode = (node, dict) => {
    if (shouldSkipNode(node) || !node.nodeValue) return;
    const raw = node.nodeValue;
    const normalized = normalize(raw);
    const translated = dict[normalized];
    if (!translated) return;

    const leading = raw.match(/^\s*/)?.[0] ?? "";
    const trailing = raw.match(/\s*$/)?.[0] ?? "";
    node.nodeValue = `${leading}${translated}${trailing}`;
  };

  const attrNames = ["aria-label", "placeholder", "title", "data-content"];

  const translateAttributes = (element, dict) => {
    attrNames.forEach((attr) => {
      const value = element.getAttribute(attr);
      if (!value) return;
      const translated = dict[normalize(value)];
      if (translated) {
        element.setAttribute(attr, translated);
      }
    });
  };

  const walkAndTranslate = (root, dict) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      translateTextNode(walker.currentNode, dict);
    }

    const allElements = root.querySelectorAll ? root.querySelectorAll("*") : [];
    allElements.forEach((element) => translateAttributes(element, dict));
  };

  const observeMutations = (dict) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData" && mutation.target?.nodeType === Node.TEXT_NODE) {
          translateTextNode(mutation.target, dict);
        }

        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node, dict);
            return;
          }
          if (node.nodeType === Node.ELEMENT_NODE) {
            walkAndTranslate(node, dict);
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  };

  const init = (enabled) => {
    if (!enabled) return;

    const dictionary = window.__GITHUB_RU_TRANSLATIONS__ || {};
    walkAndTranslate(document.body, dictionary);
    observeMutations(dictionary);
  };

  chrome.storage.sync.get([STORAGE_KEY], (result) => {
    const enabled = result[STORAGE_KEY] !== false;
    init(enabled);
  });
})();
