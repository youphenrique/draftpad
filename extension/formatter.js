// @ts-check

/**
 * @typedef {Object} FormatConfig
 * @property {string} label
 * @property {string} parser
 * @property {string[]} pluginFiles
 * @property {string[]} pluginKeys
 */

/**
 * @namespace Formatter
 */
const Formatter = {
  _prettierLoaded: false,
  /** @type {Set<string>} */
  _loadedScripts: new Set(),

  /** @type {Object<string, FormatConfig>} */
  _FORMATS: {
    markdown: {
      label: "Markdown",
      parser: "markdown",
      pluginFiles: ["vendor/prettier-plugin-markdown.js"],
      pluginKeys: ["markdown"],
    },
    json: {
      label: "JSON",
      parser: "json",
      pluginFiles: ["vendor/prettier-plugin-estree.js", "vendor/prettier-plugin-babel.js"],
      pluginKeys: ["estree", "babel"],
    },
    html: {
      label: "HTML",
      parser: "html",
      pluginFiles: ["vendor/prettier-plugin-html.js"],
      pluginKeys: ["html"],
    },
    css: {
      label: "CSS",
      parser: "css",
      pluginFiles: ["vendor/prettier-plugin-postcss.js"],
      pluginKeys: ["postcss"],
    },
    javascript: {
      label: "JavaScript",
      parser: "babel",
      pluginFiles: ["vendor/prettier-plugin-estree.js", "vendor/prettier-plugin-babel.js"],
      pluginKeys: ["estree", "babel"],
    },
    typescript: {
      label: "TypeScript",
      parser: "typescript",
      pluginFiles: [
        "vendor/prettier-plugin-estree.js",
        "vendor/prettier-plugin-typescript.js",
      ],
      pluginKeys: ["estree", "typescript"],
    },
  },

  /**
   * @returns {Array<{value: string, label: string}>}
   */
  getOptions() {
    return Object.entries(this._FORMATS).map(([value, { label }]) => ({
      value,
      label,
    }));
  },

  /**
   * @param {string} src
   * @returns {Promise<void>}
   */
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

  /**
   * @param {string} format
   */
  async _ensureReady(format) {
    const config = this._FORMATS[format];
    if (!config) throw new Error(`Unknown format: ${format}`);

    if (!this._prettierLoaded) {
      await this._loadScript("vendor/prettier.browser.js");
      this._prettierLoaded = true;
    }

    for (const file of config.pluginFiles) {
      await this._loadScript(file);
    }
  },

  /**
   * @param {string} content
   * @param {string} [format="markdown"]
   * @returns {Promise<string>}
   */
  async format(content, format = "markdown") {
    const config = this._FORMATS[format];
    if (!config) return content;

    await this._ensureReady(format);

    // @ts-ignore - Prettier browser globals
    const plugins = config.pluginKeys.map((key) => prettierPlugins[key]);

    // @ts-ignore
    return await prettier.format(content, {
      parser: config.parser,
      plugins,
    });
  },
};
