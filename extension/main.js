import { html, render, Component } from "./vendor/preact-standalone.mjs";

import { Sidebar } from "./components/sidebar.js";
import { EditorArea } from "./components/editor-area.js";

/**
 * @typedef {Object} AppState
 * @property {any[]} notes
 * @property {string | null} activeNoteId
 * @property {string} theme
 * @property {boolean} isSidebarHidden
 * @property {boolean} isPreviewEnabled
 */

/**
 * @extends {Component<{}, AppState>}
 */
class App extends Component {
  /**
   * @param {{}} props
   */
  constructor(props) {
    super(props);
    /** @type {AppState} */
    this.state = {
      notes: [],
      activeNoteId: null,
      theme: "system",
      isSidebarHidden: false,
      isPreviewEnabled: false,
    };

    this.handleNotesChange = this.handleNotesChange.bind(this);
    this.handleThemeChange = this.handleThemeChange.bind(this);
    this.handleToggleSidebar = this.handleToggleSidebar.bind(this);
    this.handleSelectNote = this.handleSelectNote.bind(this);
    this.handleNewNote = this.handleNewNote.bind(this);
    this.handleTogglePreview = this.handleTogglePreview.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handlePrefersColorScheme = this.handlePrefersColorScheme.bind(this);
  }

  async componentDidMount() {
    await NotesManager.load();
    NotesManager.subscribe(this.handleNotesChange);

    // @ts-ignore
    const theme = await AppStorage.get("theme", "system");
    this.setState(
      {
        notes: NotesManager.notes,
        activeNoteId: NotesManager.activeNoteId,
        theme,
      },
      () => this.applyTheme(theme),
    );

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", this.handlePrefersColorScheme);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  componentWillUnmount() {
    // @ts-ignore
    NotesManager.subscribe(null); // Simple unsubscribe
    window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", this.handlePrefersColorScheme);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
  }

  handleNotesChange() {
    this.setState({
      notes: [...NotesManager.notes],
      activeNoteId: NotesManager.activeNoteId,
    });
  }

  handlePrefersColorScheme() {
    if (this.state.theme === "system") {
      this.applyTheme("system");
    }
  }

  handleVisibilityChange() {
    if (document.visibilityState === "hidden") {
      /** @type {HTMLTextAreaElement | null} */
      const editorEl = /** @type {any} */ (document.getElementById("editor"));
      if (editorEl) NotesManager.updateActiveNote(editorEl.value);
    }
  }

  /**
   * @param {string} theme
   */
  async handleThemeChange(theme) {
    this.setState({ theme }, () => this.applyTheme(theme));
    await AppStorage.set("theme", theme);
  }

  /**
   * @param {string} theme
   */
  applyTheme(theme) {
    document.body.classList.remove("light-theme", "dark-theme");
    if (theme !== "system") {
      document.body.classList.add(`${theme}-theme`);
    }
  }

  handleToggleSidebar() {
    // @ts-ignore
    this.setState((prev) => ({ isSidebarHidden: !prev.isSidebarHidden }));
  }

  /**
   * @param {string} id
   */
  handleSelectNote(id) {
    NotesManager.setActiveNote(id);
  }

  handleNewNote() {
    NotesManager.createNote();
  }

  async handleTogglePreview() {
    const isEnabled = await Preview.toggle();
    this.setState({ isPreviewEnabled: isEnabled });
  }

  render() {
    // @ts-ignore
    const { notes, activeNoteId, theme, isSidebarHidden, isPreviewEnabled } = this.state;
    const activeNote = notes.find((/** @type {Note} */ n) => n.id === activeNoteId) || null;

    return html`
      <div class="app-container">
        <${Sidebar}
          notes=${notes}
          activeNoteId=${activeNoteId}
          isHidden=${isSidebarHidden}
          onNewNote=${this.handleNewNote}
          onSelectNote=${this.handleSelectNote}
        />
        <${EditorArea}
          theme=${theme}
          onThemeChange=${this.handleThemeChange}
          isSidebarHidden=${isSidebarHidden}
          onToggleSidebar=${this.handleToggleSidebar}
          activeNote=${activeNote}
          formatOptions=${
            /** @type {any} */ (globalThis).Formatter ? /** @type {any} */ (globalThis).Formatter.getOptions() : []
          }
          isPreviewEnabled=${isPreviewEnabled}
          onTogglePreview=${this.handleTogglePreview}
        />
      </div>
    `;
  }
}

// Mount app
const root = document.getElementById("app");

if (root !== null) {
  render(html`<${App} />`, root);
}
