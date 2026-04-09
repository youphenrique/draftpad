let saveTimeout;
let previewTimeout;
let editorActionsTimer;

const PANEL_LEFT_CLOSE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-panel-left-close"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>`;
const PANEL_LEFT_OPEN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-panel-left-open"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>`;

const DOM = {
  editor: document.getElementById("editor"),
  sidebar: document.getElementById("sidebar"),
  btnNewNote: document.getElementById("btn-new-note"),
  btnToggleSidebar: document.getElementById("btn-toggle-sidebar"),
  btnCopy: document.getElementById("btn-copy"),
  btnClear: document.getElementById("btn-clear"),
  btnTogglePreview: document.getElementById("btn-toggle-preview"),
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
  DOM.editorActions.classList.add("visible");
}

function hideEditorActions() {
  DOM.editorActions.classList.remove("visible");
}

function scheduleHideEditorActions() {
  clearTimeout(editorActionsTimer);
  editorActionsTimer = setTimeout(hideEditorActions, 1000);
}

function renderNoteList() {
  DOM.noteList.innerHTML = "";
  NotesManager.notes.forEach((note) => {
    const li = document.createElement("li");
    li.className = `note-item ${note.id === NotesManager.activeNoteId ? "active" : ""}`;
    li.textContent = note.title || "Untitled";
    li.onclick = () => {
      NotesManager.setActiveNote(note.id);
      loadActiveNote();
      renderNoteList();
    };
    DOM.noteList.appendChild(li);
  });
}

function loadActiveNote() {
  const note = NotesManager.getActiveNote();
  if (note) {
    DOM.editor.value = note.content;
    Preview.render(note.content);
    DOM.editor.focus();
  }
}

function handleInput() {
  const content = DOM.editor.value;

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

  DOM.lightThemeBtn.addEventListener("click", () => ThemeManager.setTheme("light"));
  DOM.systemThemeBtn.addEventListener("click", () => ThemeManager.setTheme("system"));
  DOM.darkThemeBtn.addEventListener("click", () => ThemeManager.setTheme("dark"));

  DOM.btnCopy.addEventListener("click", () => {
    navigator.clipboard.writeText(DOM.editor.value);
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

  DOM.textareaWrapper.addEventListener("mousemove", () => {
    showEditorActions();
    scheduleHideEditorActions();
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
