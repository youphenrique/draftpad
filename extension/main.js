let saveTimeout;
let previewTimeout;

const DOM = {
  editor: document.getElementById("editor"),
  sidebar: document.getElementById("sidebar"),
  btnNewNote: document.getElementById("btn-new-note"),
  btnToggleSidebar: document.getElementById("btn-toggle-sidebar"),
  btnCopy: document.getElementById("btn-copy"),
  btnClear: document.getElementById("btn-clear"),
  btnDelete: document.getElementById("btn-delete"),
  btnTogglePreview: document.getElementById("btn-toggle-preview"),
  noteList: document.getElementById("note-list"),
};

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
    DOM.sidebar.classList.toggle("hidden");
  });

  DOM.btnCopy.addEventListener("click", () => {
    navigator.clipboard.writeText(DOM.editor.value);
  });

  DOM.btnClear.addEventListener("click", () => {
    DOM.editor.value = "";
    handleInput();
    DOM.editor.focus();
  });

  DOM.btnDelete.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this note?")) {
      NotesManager.deleteActiveNote();
      loadActiveNote();
      renderNoteList();
    }
  });

  DOM.btnTogglePreview.addEventListener("click", async () => {
    const isEnabled = await Preview.toggle();
    DOM.btnTogglePreview.style.backgroundColor = isEnabled
      ? "var(--active-bg)"
      : "";
  });
}

void init();
