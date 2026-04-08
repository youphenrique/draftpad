const Preview = {
  isEnabled: false,
  isLoaded: false,

  async toggle() {
    this.isEnabled = !this.isEnabled;
    const previewEl = document.getElementById("preview");

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

  async loadMarked() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "marked.min.js";
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  render(content) {
    if (!this.isEnabled || !this.isLoaded) return;
    const text =
      content !== undefined ? content : document.getElementById("editor").value;
    document.getElementById("preview").innerHTML = marked.parse(text);
  },
};
