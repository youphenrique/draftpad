const NotesManager = {
  notes: [],
  activeNoteId: null,

  async load() {
    this.notes = await Storage.get("notes", []);
    this.activeNoteId = await Storage.get("activeNoteId", null);

    if (this.notes.length === 0) {
      this.createNote();
    } else if (
      !this.activeNoteId ||
      !this.notes.find((n) => n.id === this.activeNoteId)
    ) {
      this.activeNoteId = this.notes[0].id;
    }
  },

  async save() {
    await Storage.set("notes", this.notes);
    await Storage.set("activeNoteId", this.activeNoteId);
  },

  createNote() {
    const newNote = {
      id: Date.now().toString(),
      title: "Untitled",
      customTitle: null,
      content: "",
      format: "markdown",
      updatedAt: Date.now(),
    };
    this.notes.unshift(newNote);
    this.activeNoteId = newNote.id;
    this.save();
    return newNote;
  },

  updateActiveNote(content) {
    const note = this.getActiveNote();
    if (note) {
      note.content = content;
      if (note.customTitle === null || note.customTitle === undefined) {
        const firstLine = content.split("\n").find((line) => line.trim() !== "");
        note.title = firstLine ? firstLine.trim().substring(0, 50) : "Untitled";
      }
      note.updatedAt = Date.now();

      // Move to top
      this.notes = this.notes.filter((n) => n.id !== note.id);
      this.notes.unshift(note);

      this.save();
    }
  },

  updateActiveNoteFormat(format) {
    const note = this.getActiveNote();
    if (note) {
      note.format = format;
      this.save();
    }
  },

  deleteActiveNote() {
    this.notes = this.notes.filter((n) => n.id !== this.activeNoteId);
    if (this.notes.length === 0) {
      this.createNote();
    } else {
      this.activeNoteId = this.notes[0].id;
    }
    this.save();
  },

  deleteNote(id) {
    this.notes = this.notes.filter((n) => n.id !== id);
    if (this.notes.length === 0) {
      this.createNote();
    } else if (this.activeNoteId === id) {
      this.activeNoteId = this.notes[0].id;
    }
    this.save();
  },

  renameNote(id, newTitle) {
    const note = this.notes.find((n) => n.id === id);
    if (note) {
      note.customTitle = newTitle.trim() || null;
      this.save();
    }
  },

  getActiveNote() {
    return this.notes.find((n) => n.id === this.activeNoteId);
  },

  setActiveNote(id) {
    if (this.notes.find((n) => n.id === id)) {
      this.activeNoteId = id;
      this.save();
    }
  },
};
