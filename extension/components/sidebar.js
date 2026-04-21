// @ts-check
import { html, Component } from "../vendor/preact-standalone.mjs";

import { Dropdown } from "./dropdown.js";
import { PlusIcon, MoreOptionsIcon } from "./icons.js";

/**
 * @typedef {Object} SidebarProps
 * @property {Note[]} notes
 * @property {string | null} activeNoteId
 * @property {boolean} isHidden
 * @property {() => void} onNewNote
 * @property {(id: string) => void} onSelectNote
 */

/**
 * @typedef {Object} SidebarState
 * @property {string | null} renamingNoteId
 * @property {string} renameText
 */

/**
 * @extends {Component<SidebarProps, SidebarState>}
 */
export class Sidebar extends Component {
  /**
   * @param {SidebarProps} props
   */
  constructor(props) {
    super(props);
    /** @type {SidebarState} */
    this.state = {
      renamingNoteId: null,
      renameText: "",
    };
    this.handleRenameKeyDown = this.handleRenameKeyDown.bind(this);
    this.saveRename = this.saveRename.bind(this);
  }

  /**
   * @param {Note} note
   * @param {{ stopPropagation: () => void }} e
   */
  startRename(note, e) {
    e.stopPropagation();
    this.setState({
      renamingNoteId: note.id,
      renameText: note.customTitle ?? note.title ?? "",
    });
  }

  saveRename() {
    // @ts-ignore
    const { renamingNoteId, renameText } = this.state;
    if (renamingNoteId) {
      NotesManager.renameNote(renamingNoteId, renameText);
      this.setState({ renamingNoteId: null, renameText: "" });
    }
  }

  cancelRename() {
    this.setState({ renamingNoteId: null, renameText: "" });
  }

  /**
   * @param {KeyboardEvent} e
   */
  handleRenameKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.saveRename();
    } else if (e.key === "Escape") {
      e.preventDefault();
      this.cancelRename();
    }
    e.stopPropagation();
  }

  render() {
    const { notes, activeNoteId, isHidden, onNewNote, onSelectNote } = /** @type {SidebarProps} */ (this.props);
    const { renamingNoteId, renameText } = /** @type {SidebarState} */ (this.state);

    return html`
      <aside class="sidebar ${isHidden ? "hidden" : ""}" id="sidebar">
        <div class="sidebar-header">
          <h2>Drafts</h2>
          <button id="btn-new-note" title="New Note" class="icon-button" onClick=${onNewNote}>
            <${PlusIcon} />
          </button>
        </div>
        <ul id="note-list" class="note-list">
          ${notes.map((note) => {
            const isActive = note.id === activeNoteId;
            const isRenaming = note.id === renamingNoteId;

            return html`
              <li class="note-item ${isActive ? "active" : ""}" onClick=${() => !isRenaming && onSelectNote(note.id)}>
                ${isRenaming
                  ? html`
                      <input
                        type="text"
                        class="note-item-rename-input"
                        value=${renameText}
                        onInput=${(/** @type {any} */ e) => this.setState({ renameText: e.target.value })}
                        onKeyDown=${this.handleRenameKeyDown}
                        onBlur=${this.saveRename}
                        onClick=${(/** @type {Event} */ e) => e.stopPropagation()}
                        ref=${(/** @type {any} */ el) => el && el.focus()}
                      />
                    `
                  : html`<span class="note-item-title">${(note.customTitle ?? note.title) || "Untitled"}</span>`}

                <${Dropdown}
                  className="note-item-menu"
                  actionMode=${true}
                  align="right"
                  icon=${html`<${MoreOptionsIcon} />`}
                  options=${[
                    { value: "rename", label: "Rename" },
                    { value: "delete", label: "Delete" },
                  ]}
                  onAction=${(/** @type {string} */ action) => {
                    if (action === "rename") {
                      this.startRename(note, { stopPropagation: () => {} });
                    } else if (action === "delete") {
                      NotesManager.deleteNote(note.id);
                    }
                  }}
                />
              </li>
            `;
          })}
        </ul>
      </aside>
    `;
  }
}
