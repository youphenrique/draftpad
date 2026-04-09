class DpSelect extends HTMLElement {
  #options = [];
  #value = null;
  #isOpen = false;
  #shadow;
  #triggerEl;
  #listEl;

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: "open" });
    this.#render();
    this._outsideClickHandler = (e) => {
      if (!e.composedPath().includes(this)) {
        this.#close();
      }
    };
    this._keydownHandler = (e) => {
      if (e.key === "Escape" && this.#isOpen) {
        this.#close();
      }
    };
  }

  static get observedAttributes() {
    return ["value"];
  }

  attributeChangedCallback(name, _oldVal, newVal) {
    if (name === "value") {
      this.#value = newVal;
      this.#updateTrigger();
      this.#updateList();
    }
  }

  get value() {
    return this.#value;
  }

  set value(val) {
    if (this.#value === val) return;
    this.#value = val;
    this.setAttribute("value", val);
  }

  get options() {
    return this.#options;
  }

  set options(opts) {
    this.#options = opts;
    this.#updateList();
    this.#updateTrigger();
  }

  #getSelectedLabel() {
    const opt = this.#options.find((o) => o.value === this.#value);
    return opt?.label ?? this.#options[0]?.label ?? "";
  }

  #render() {
    this.#shadow.innerHTML = `
      <style>
        :host {
          position: relative;
          display: inline-block;
          font-family: var(--font-sans, system-ui, sans-serif);
        }

        .trigger {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0 10px;
          height: 2rem;
          border-radius: 9999px;
          border: none;
          background: transparent;
          color: var(--text-color, #333);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s ease-in-out;
          white-space: nowrap;
        }

        .trigger:hover {
          background-color: var(--btn-hover, #f0f0f0);
        }

        .trigger.open {
          background-color: var(--active-bg, #e5e5e5);
        }

        .chevron {
          width: 12px;
          height: 12px;
          opacity: 0.55;
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }

        .trigger.open .chevron {
          transform: rotate(180deg);
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          min-width: 150px;
          background-color: var(--surface-tertiary, #fff);
          border: 1px solid var(--border-color, #e5e5e5);
          border-radius: 8px;
          box-shadow:
            lch(0 0 0 / 0.08) 0 4px 16px,
            lch(0 0 0 / 0.04) 0 1px 2px;
          z-index: 100;
          overflow: hidden;
          padding: 4px;
        }

        .dropdown.hidden {
          display: none;
        }

        .option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 13px;
          color: var(--text-color, #333);
          cursor: pointer;
          transition: background-color 0.1s ease;
          user-select: none;
        }

        .option:hover {
          background-color: var(--hover-bg, #f0f0f0);
        }

        .option.selected {
          font-weight: 500;
        }

        .check-icon {
          width: 13px;
          height: 13px;
          flex-shrink: 0;
          visibility: hidden;
          opacity: 0.7;
        }

        .option.selected .check-icon {
          visibility: visible;
        }
      </style>
      <button class="trigger" part="trigger" type="button">
        <span class="label"></span>
        <svg class="chevron" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 4l4 4 4-4"/>
        </svg>
      </button>
      <div class="dropdown hidden" part="dropdown"></div>
    `;

    this.#triggerEl = this.#shadow.querySelector(".trigger");
    this.#listEl = this.#shadow.querySelector(".dropdown");
    this.#triggerEl.addEventListener("click", (e) => {
      e.stopPropagation();
      this.#toggle();
    });
  }

  #updateTrigger() {
    const label = this.#shadow.querySelector(".label");
    if (label) label.textContent = this.#getSelectedLabel();
    this.#triggerEl?.classList.toggle("open", this.#isOpen);
  }

  #updateList() {
    if (!this.#listEl) return;
    this.#listEl.innerHTML = this.#options
      .map(
        (opt) => `
        <div class="option ${opt.value === this.#value ? "selected" : ""}" data-value="${opt.value}">
          <span>${opt.label}</span>
          <svg class="check-icon" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 6.5l3 3 6-6"/>
          </svg>
        </div>
      `,
      )
      .join("");

    this.#listEl.querySelectorAll(".option").forEach((el) => {
      el.addEventListener("click", () => {
        const newValue = el.dataset.value;
        this.#close();
        if (newValue === this.#value) return;
        this.#value = newValue;
        this.setAttribute("value", newValue);
        this.#updateTrigger();
        this.#updateList();
        this.dispatchEvent(
          new CustomEvent("change", {
            detail: { value: newValue },
            bubbles: true,
            composed: true,
          }),
        );
      });
    });
  }

  #open() {
    this.#isOpen = true;
    this.#listEl.classList.remove("hidden");
    this.#triggerEl.classList.add("open");
    document.addEventListener("click", this._outsideClickHandler, true);
    document.addEventListener("keydown", this._keydownHandler);
  }

  #close() {
    this.#isOpen = false;
    this.#listEl.classList.add("hidden");
    this.#triggerEl.classList.remove("open");
    document.removeEventListener("click", this._outsideClickHandler, true);
    document.removeEventListener("keydown", this._keydownHandler);
  }

  #toggle() {
    this.#isOpen ? this.#close() : this.#open();
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._outsideClickHandler, true);
    document.removeEventListener("keydown", this._keydownHandler);
  }
}

customElements.define("dp-select", DpSelect);
