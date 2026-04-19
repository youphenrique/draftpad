// @ts-check

/**
 * @namespace Preview
 */
const Preview = {
  isEnabled: false,
  isLoaded: false,

  /**
   * Toggles the visibility and rendering of the markdown preview.
   * @returns {Promise<boolean>}
   */
  async toggle() {
    this.isEnabled = !this.isEnabled;
    const previewEl = document.getElementById("preview");
    if (!previewEl) return this.isEnabled;

    if (this.isEnabled) {
      previewEl.classList.remove("hidden");
      if (!this.isLoaded) {
        await this.loadMarked();
      }
      this.render();
    } else {
      previewEl.classList.add("hidden");
    }

    return this.isEnabled;
  },

  hide() {
    this.isEnabled = false;
    const previewEl = document.getElementById("preview");
    if (previewEl) {
      previewEl.classList.add("hidden");
    }
  },

  /**
   * @returns {Promise<void>}
   */
  async loadMarked() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "vendor/marked.min.js";
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  /**
   * @param {string} [content]
   */
  render(content) {
    if (!this.isEnabled || !this.isLoaded) return;

    /** @type {HTMLTextAreaElement | null} */
    const editorEl = /** @type {any} */ (document.getElementById("editor"));
    const text = content !== undefined ? content : editorEl ? editorEl.value : "";
    const previewEl = document.getElementById("preview");

    // @ts-ignore - marked is loaded dynamically
    if (previewEl && typeof marked !== "undefined") {
      // @ts-ignore
      previewEl.innerHTML = marked.parse(text);
    }
  },
};
