const Formatter = {
  _prettierLoaded: false,
  _loadedScripts: new Set(),

  _FORMATS: {
    markdown: {
      label: "Markdown",
      parser: "markdown",
      pluginFiles: ["prettier-plugin-markdown.js"],
      pluginKeys: ["markdown"],
    },
    json: {
      label: "JSON",
      parser: "json",
      pluginFiles: ["prettier-plugin-estree.js", "prettier-plugin-babel.js"],
      pluginKeys: ["estree", "babel"],
    },
    html: {
      label: "HTML",
      parser: "html",
      pluginFiles: ["prettier-plugin-html.js"],
      pluginKeys: ["html"],
    },
    css: {
      label: "CSS",
      parser: "css",
      pluginFiles: ["prettier-plugin-postcss.js"],
      pluginKeys: ["postcss"],
    },
    javascript: {
      label: "JavaScript",
      parser: "babel",
      pluginFiles: ["prettier-plugin-estree.js", "prettier-plugin-babel.js"],
      pluginKeys: ["estree", "babel"],
    },
    typescript: {
      label: "TypeScript",
      parser: "typescript",
      pluginFiles: [
        "prettier-plugin-estree.js",
        "prettier-plugin-typescript.js",
      ],
      pluginKeys: ["estree", "typescript"],
    },
  },

  getOptions() {
    return Object.entries(this._FORMATS).map(([value, { label }]) => ({
      value,
      label,
    }));
  },

  _loadScript(src) {
    if (this._loadedScripts.has(src)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        this._loadedScripts.add(src);
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  },

  async _ensureReady(format) {
    const config = this._FORMATS[format];
    if (!config) throw new Error(`Unknown format: ${format}`);

    if (!this._prettierLoaded) {
      await this._loadScript("prettier.browser.js");
      this._prettierLoaded = true;
    }

    for (const file of config.pluginFiles) {
      await this._loadScript(file);
    }
  },

  async format(content, format = "markdown") {
    const config = this._FORMATS[format];
    if (!config) return content;

    await this._ensureReady(format);

    const plugins = config.pluginKeys.map((key) => prettierPlugins[key]);

    return await prettier.format(content, {
      parser: config.parser,
      plugins,
    });
  },
};
