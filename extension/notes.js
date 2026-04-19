// @ts-check
/// <reference path="./storage.js" />

/**
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} title
 * @property {string | null} customTitle
 * @property {string} content
 * @property {string} format
 * @property {number} updatedAt
 */

/**
 * @namespace NotesManager
 * @property {Note[]} notes
 * @property {string | null} activeNoteId
 * @property {Array<() => void>} listeners
 */
const NotesManager = {
  /** @type {Note[]} */
  notes: [],
  /** @type {string | null} */
  activeNoteId: null,
  /** @type {Array<() => void>} */
  listeners: [],

  /**
   * @param {() => void} listener
   * @returns {() => void}
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach((l) => l());
  },

  async load() {
    this.notes = await AppStorage.get("notes", []);
    this.activeNoteId = await AppStorage.get("activeNoteId", null);

    if (this.notes.length === 0) {
      this.createNote();
    } else if (!this.activeNoteId || !this.notes.find((n) => n.id === this.activeNoteId)) {
      this.activeNoteId = this.notes[0].id;
    }

    this.notify();
  },

  async save() {
    await AppStorage.set("notes", this.notes);
    await AppStorage.set("activeNoteId", this.activeNoteId);
    this.notify();
  },

  /**
   * @returns {Note}
   */
  createNote() {
    /** @type {Note} */
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

  /**
   * @param {string} content
   */
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

  /**
   * @param {string} format
   */
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
      this.activeNoteId = this.notes[0].id; // Safe fallback
    }

    this.save();
  },

  /**
   * @param {string} id
   */
  deleteNote(id) {
    this.notes = this.notes.filter((n) => n.id !== id);

    if (this.notes.length === 0) {
      this.createNote();
    } else if (this.activeNoteId === id) {
      this.activeNoteId = this.notes[0].id;
    }

    this.save();
  },

  /**
   * @param {string} id
   * @param {string} newTitle
   */
  renameNote(id, newTitle) {
    const note = this.notes.find((n) => n.id === id);

    if (note) {
      note.customTitle = newTitle.trim() || null;
      this.save();
    }
  },

  /**
   * @returns {Note | undefined}
   */
  getActiveNote() {
    return this.notes.find((n) => n.id === this.activeNoteId);
  },

  /**
   * @param {string} id
   */
  setActiveNote(id) {
    if (this.notes.find((n) => n.id === id)) {
      this.activeNoteId = id;
      this.save();
    }
  },
};
