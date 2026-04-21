// @ts-check
import { html, Component } from "../vendor/preact-standalone.mjs";

import { Dropdown } from "./dropdown.js";
import {
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  LightThemeIcon,
  SystemThemeIcon,
  DarkThemeIcon,
  CopyIcon,
  FormatIcon,
  ClearIcon,
  PreviewIcon,
} from "./icons.js";

/**
 * @typedef {Object} EditorAreaProps
 * @property {string} theme
 * @property {(theme: string) => void} onThemeChange
 * @property {boolean} isSidebarHidden
 * @property {() => void} onToggleSidebar
 * @property {any} activeNote
 * @property {Array<{value: string, label: string}>} formatOptions
 * @property {boolean} isPreviewEnabled
 * @property {() => void} onTogglePreview
 */

/**
 * @typedef {Object} EditorAreaState
 * @property {boolean} showActions
 * @property {boolean} isFormatting
 * @property {boolean} flashError
 */

/**
 * @extends {Component<EditorAreaProps, EditorAreaState>}
 */
export class EditorArea extends Component {
  /**
   * @param {EditorAreaProps} props
   */
  constructor(props) {
    super(props);
    /** @type {EditorAreaState} */
    this.state = {
      showActions: false,
      isFormatting: false,
      flashError: false,
    };

    /** @type {ReturnType<typeof setTimeout> | null} */
    this.hideActionsTimer = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this.saveTimeout = null;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this.previewTimeout = null;

    /** @type {HTMLTextAreaElement | null} */
    this.editorEl = null;

    /** @type {HTMLDivElement | null} */
    this.actionsEl = null;

    this.handleInput = this.handleInput.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.scheduleHideActions = this.scheduleHideActions.bind(this);
    this.showActions = this.showActions.bind(this);
    this.handleFormat = this.handleFormat.bind(this);
  }

  componentDidMount() {
    // @ts-ignore
    if (this.props.activeNote && this.editorEl) {
      if (document.activeElement !== this.editorEl) {
        this.editorEl.focus();
      }
    }
  }

  /**
   * @param {EditorAreaProps} prevProps
   */
  componentDidUpdate(prevProps) {
    // @ts-ignore
    if (prevProps.activeNote?.id !== this.props.activeNote?.id) {
      this.setState({ showActions: false });
      if (this.editorEl) {
        this.editorEl.focus();
      }
    }
  }

  showActions() {
    // @ts-ignore
    if (this.props.activeNote?.content?.trim().length > 0) {
      this.setState({ showActions: true });
    }
  }

  scheduleHideActions() {
    // @ts-ignore
    clearTimeout(this.hideActionsTimer);
    this.hideActionsTimer = setTimeout(() => {
      this.setState({ showActions: false });
    }, 1000);
  }

  /**
   * @param {Event} e
   */
  handleInput(e) {
    // @ts-ignore
    const content = e.target.value;
    if (content.trim() === "") {
      this.setState({ showActions: false });
    }

    // @ts-ignore
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      NotesManager.updateActiveNote(content);
    }, 250);

    // @ts-ignore
    if (this.previewTimeout) clearTimeout(this.previewTimeout);
    this.previewTimeout = setTimeout(() => {
      Preview.render(content);
    }, 250);
  }

  /**
   * @param {Event} e
   */
  handleBlur(e) {
    // @ts-ignore
    NotesManager.updateActiveNote(e.target.value);
  }

  async handleFormat() {
    // @ts-ignore
    const { activeNote } = this.props;
    const format = activeNote?.format ?? "markdown";
    const content = this.editorEl?.value || "";
    if (!content.trim()) return;

    this.setState({ isFormatting: true });
    try {
      const formatted = await Formatter.format(content, format);
      if (this.editorEl) this.editorEl.value = formatted;
      NotesManager.updateActiveNote(formatted);
      Preview.render(formatted);
    } catch (_err) {
      // Simulate error flash
      this.setState({ flashError: true });
      setTimeout(() => this.setState({ flashError: false }), 1200);
    } finally {
      this.setState({ isFormatting: false });
    }
  }

  render() {
    const {
      theme,
      onThemeChange,
      isSidebarHidden,
      onToggleSidebar,
      activeNote,
      formatOptions,
      isPreviewEnabled,
      onTogglePreview,
    } = /** @type {EditorAreaProps} */ (this.props);

    // @ts-ignore
    const { showActions, isFormatting, flashError } = this.state;
    const isMarkdown = (activeNote?.format ?? "markdown") === "markdown";

    return html`
      <main>
        <div class="main-area">
          <header class="toolbar">
            <button id="btn-toggle-sidebar" title="Toggle Sidebar" class="icon-button" onClick=${onToggleSidebar}>
              ${isSidebarHidden ? html`<${PanelLeftOpenIcon} />` : html`<${PanelLeftCloseIcon} />`}
            </button>
            <div class="spacer"></div>
            <${Dropdown}
              id="format-selector"
              value=${activeNote?.format ?? "markdown"}
              options=${formatOptions}
              onChange=${(/** @type {string} */ val) => NotesManager.updateActiveNoteFormat(val)}
            />
            <div class="toolbar-divider"></div>
            <div id="theme-toggle" class="theme-toggle-group">
              <button
                aria-label="Light theme"
                class="icon-button ${theme === "light" ? "active" : ""}"
                onClick=${() => onThemeChange("light")}
              >
                <${LightThemeIcon} />
              </button>
              <button
                aria-label="System theme"
                class="icon-button ${theme === "system" ? "active" : ""}"
                onClick=${() => onThemeChange("system")}
              >
                <${SystemThemeIcon} />
              </button>
              <button
                aria-label="Dark theme"
                class="icon-button ${theme === "dark" ? "active" : ""}"
                onClick=${() => onThemeChange("dark")}
              >
                <${DarkThemeIcon} />
              </button>
            </div>
          </header>

          <div class="editor-container">
            <div
              class="textarea-wrapper"
              onMouseMove=${(/** @type {MouseEvent} */ e) => {
                this.showActions();
                if (this.actionsEl && !this.actionsEl.contains(/** @type {Node} */ (e.target))) {
                  this.scheduleHideActions();
                } else {
                  // @ts-ignore
                  clearTimeout(this.hideActionsTimer);
                }
              }}
              onMouseLeave=${() => {
                // @ts-ignore
                clearTimeout(this.hideActionsTimer);
                this.setState({ showActions: false });
              }}
            >
              <textarea
                id="editor"
                placeholder="Start typing..."
                spellcheck="false"
                value=${activeNote ? activeNote.content : ""}
                onInput=${this.handleInput}
                onBlur=${this.handleBlur}
                ref=${(/** @type {HTMLTextAreaElement} */ el) => (this.editorEl = el)}
              ></textarea>

              <div
                class="editor-actions ${showActions ? "visible" : ""}"
                ref=${(/** @type {HTMLDivElement} */ el) => (this.actionsEl = el)}
                onMouseEnter=${() => clearTimeout(/** @type {ReturnType<typeof setTimeout>} */ (this.hideActionsTimer))}
                onMouseLeave=${this.scheduleHideActions}
              >
                <button
                  title="Copy Content"
                  class="icon-button"
                  onClick=${() => navigator.clipboard.writeText(this.editorEl?.value || "")}
                >
                  <${CopyIcon} />
                </button>
                <button
                  title="Format Content"
                  class="icon-button ${flashError ? "format-error" : ""}"
                  onClick=${this.handleFormat}
                  disabled=${isFormatting}
                >
                  <${FormatIcon} />
                </button>
                <button
                  title="Clear Content"
                  class="icon-button"
                  onClick=${() => {
                    if (this.editorEl) {
                      this.editorEl.value = "";
                      // @ts-ignore
                      this.handleInput({ target: this.editorEl });
                      this.editorEl.focus();
                    }
                  }}
                >
                  <${ClearIcon} />
                </button>
                <button
                  title="Toggle Preview"
                  class="icon-button ${!isMarkdown ? "hidden" : ""}"
                  style=${isPreviewEnabled ? "background-color: var(--active-bg)" : ""}
                  onClick=${onTogglePreview}
                >
                  <${PreviewIcon} />
                </button>
              </div>
            </div>
            <div id="preview" class="preview-area ${isPreviewEnabled ? "" : "hidden"}"></div>
          </div>
        </div>
      </main>
    `;
  }
}
