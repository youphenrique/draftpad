let saveTimeout;
let previewTimeout;
let editorActionsTimer;

const MORE_OPTIONS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>`;


const PANEL_LEFT_OPEN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-panel-left-open"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>`;
const PANEL_LEFT_CLOSE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-panel-left-close"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>`;

const DOM = {
  editor: document.getElementById("editor"),
  sidebar: document.getElementById("sidebar"),
  btnNewNote: document.getElementById("btn-new-note"),
  btnToggleSidebar: document.getElementById("btn-toggle-sidebar"),
  btnCopy: document.getElementById("btn-copy"),
  btnClear: document.getElementById("btn-clear"),
  btnFormat: document.getElementById("btn-format"),
  btnTogglePreview: document.getElementById("btn-toggle-preview"),
  formatSelector: document.getElementById("format-selector"),
  noteList: document.getElementById("note-list"),
  lightThemeBtn: document.getElementById("light-theme-button"),
  systemThemeBtn: document.getElementById("system-theme-button"),
  darkThemeBtn: document.getElementById("dark-theme-button"),
  textareaWrapper: document.querySelector(".textarea-wrapper"),
  editorActions: document.querySelector(".editor-actions"),
};

const ThemeManager = {
  theme: "system",

  async load() {
    this.theme = await Storage.get("theme", "system");
    this.apply();

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (this.theme === "system") {
          this.apply();
        }
      });
  },

  async setTheme(theme) {
    this.theme = theme;
    await Storage.set("theme", this.theme);
    this.apply();
  },

  apply() {
    document.body.classList.remove("light-theme", "dark-theme");
    if (this.theme !== "system") {
      document.body.classList.add(`${this.theme}-theme`);
    }
    this.updateButtons();
  },

  updateButtons() {
    const map = {
      light: DOM.lightThemeBtn,
      system: DOM.systemThemeBtn,
      dark: DOM.darkThemeBtn,
    };
    Object.entries(map).forEach(([theme, btn]) => {
      btn.classList.toggle("active", theme === this.theme);
    });
  },
};

function showEditorActions() {
  if (DOM.editor.value.trim().length > 0) {
    DOM.editorActions.classList.add("visible");
  }
}

function hideEditorActions() {
  DOM.editorActions.classList.remove("visible");
}

function scheduleHideEditorActions() {
  clearTimeout(editorActionsTimer);
  editorActionsTimer = setTimeout(hideEditorActions, 1000);
}

function syncFormatSelector() {
  const note = NotesManager.getActiveNote();
  DOM.formatSelector.value = note?.format ?? "markdown";
}

function startInlineRename(li, note) {
  const titleEl = li.querySelector(".note-item-title");
  if (!titleEl) return;

  const currentTitle = note.customTitle ?? note.title;
  const input = document.createElement("input");
  input.type = "text";
  input.className = "note-item-rename-input";
  input.value = currentTitle;

  li.replaceChild(input, titleEl);
  input.focus();
  input.select();

  let saved = false;

  function save() {
    if (saved) return;
    saved = true;
    const newTitle = input.value.trim();
    NotesManager.renameNote(note.id, newTitle || note.title);
    renderNoteList();
  }

  function cancel() {
    if (saved) return;
    saved = true;
    renderNoteList();
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
    e.stopPropagation();
  });

  input.addEventListener("blur", save);

  input.addEventListener("click", (e) => e.stopPropagation());
}

function renderNoteList() {
  DOM.noteList.innerHTML = "";
  NotesManager.notes.forEach((note) => {
    const li = document.createElement("li");
    li.className = `note-item ${note.id === NotesManager.activeNoteId ? "active" : ""}`;

    const titleSpan = document.createElement("span");
    titleSpan.className = "note-item-title";
    titleSpan.textContent = (note.customTitle ?? note.title) || "Untitled";

    const menu = document.createElement("dp-select");
    menu.className = "note-item-menu";
    menu.actionMode = true;
    menu.align = "right";
    menu.icon = MORE_OPTIONS_SVG;
    menu.options = [
      { value: "rename", label: "Rename" },
      { value: "delete", label: "Delete" },
    ];

    menu.addEventListener("open", () => menu.classList.add("is-open"));
    menu.addEventListener("close", () => menu.classList.remove("is-open"));

    menu.addEventListener("action", (e) => {
      if (e.detail.value === "rename") {
        startInlineRename(li, note);
      } else if (e.detail.value === "delete") {
        NotesManager.deleteNote(note.id);
        renderNoteList();
        loadActiveNote();
      }
    });

    menu.addEventListener("click", (e) => e.stopPropagation());

    li.addEventListener("click", () => {
      if (li.querySelector(".note-item-rename-input")) return;
      NotesManager.setActiveNote(note.id);
      loadActiveNote();
      renderNoteList();
    });

    li.appendChild(titleSpan);
    li.appendChild(menu);
    DOM.noteList.appendChild(li);
  });
}

function loadActiveNote() {
  const note = NotesManager.getActiveNote();
  if (note) {
    DOM.editor.value = note.content;
    Preview.render(note.content);
    syncFormatSelector();
    DOM.editor.focus();

    if (note.content.trim() === "") {
      hideEditorActions();
    }
  }
}

function handleInput() {
  const content = DOM.editor.value;

  if (content.trim() === "") {
    hideEditorActions();
  }

  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    NotesManager.updateActiveNote(content);
    renderNoteList();
  }, 250);

  clearTimeout(previewTimeout);
  previewTimeout = setTimeout(() => {
    Preview.render(content);
  }, 250);
}

async function init() {
  await NotesManager.load();
  await ThemeManager.load();

  DOM.formatSelector.options = Formatter.getOptions();

  renderNoteList();
  loadActiveNote();

  DOM.editor.addEventListener("input", handleInput);

  // Save on blur and visibility change for safety
  DOM.editor.addEventListener("blur", () => {
    NotesManager.updateActiveNote(DOM.editor.value);
    renderNoteList();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      NotesManager.updateActiveNote(DOM.editor.value);
    }
  });

  DOM.btnNewNote.addEventListener("click", () => {
    NotesManager.createNote();
    loadActiveNote();
    renderNoteList();
  });

  DOM.btnToggleSidebar.addEventListener("click", () => {
    const isHidden = DOM.sidebar.classList.toggle("hidden");
    DOM.btnToggleSidebar.innerHTML = isHidden
      ? PANEL_LEFT_OPEN_SVG
      : PANEL_LEFT_CLOSE_SVG;
  });

  DOM.lightThemeBtn.addEventListener("click", () =>
    ThemeManager.setTheme("light"),
  );
  DOM.systemThemeBtn.addEventListener("click", () =>
    ThemeManager.setTheme("system"),
  );
  DOM.darkThemeBtn.addEventListener("click", () =>
    ThemeManager.setTheme("dark"),
  );

  DOM.btnCopy.addEventListener("click", () => {
    navigator.clipboard.writeText(DOM.editor.value);
  });

  DOM.formatSelector.addEventListener("change", (e) => {
    NotesManager.updateActiveNoteFormat(e.detail.value);
  });

  DOM.btnFormat.addEventListener("click", async () => {
    const note = NotesManager.getActiveNote();
    const format = note?.format ?? "markdown";
    const content = DOM.editor.value;
    if (!content.trim()) return;

    DOM.btnFormat.disabled = true;
    try {
      DOM.editor.value = await Formatter.format(content, format);
      handleInput();
    } catch (_err) {
      DOM.btnFormat.classList.add("format-error");
      setTimeout(() => DOM.btnFormat.classList.remove("format-error"), 1200);
    } finally {
      DOM.btnFormat.disabled = false;
    }
  });

  DOM.btnClear.addEventListener("click", () => {
    DOM.editor.value = "";
    handleInput();
    DOM.editor.focus();
  });

  DOM.btnTogglePreview.addEventListener("click", async () => {
    const isEnabled = await Preview.toggle();
    DOM.btnTogglePreview.style.backgroundColor = isEnabled
      ? "var(--active-bg)"
      : "";
  });

  DOM.textareaWrapper.addEventListener("mousemove", (e) => {
    showEditorActions();
    if (!DOM.editorActions.contains(e.target)) {
      scheduleHideEditorActions();
    } else {
      clearTimeout(editorActionsTimer);
    }
  });

  DOM.textareaWrapper.addEventListener("mouseleave", () => {
    clearTimeout(editorActionsTimer);
    hideEditorActions();
  });

  DOM.editorActions.addEventListener("mouseenter", () => {
    clearTimeout(editorActionsTimer);
  });

  DOM.editorActions.addEventListener("mouseleave", () => {
    scheduleHideEditorActions();
  });
}

void init();
