// @ts-check
import { html, Component } from "../vendor/preact-standalone.mjs";

/**
 * @typedef {Object} DropdownOption
 * @property {string} value
 * @property {string} label
 */

/**
 * @typedef {Object} DropdownProps
 * @property {DropdownOption[]} [options]
 * @property {any} [icon]
 * @property {"left" | "right"} [align]
 * @property {string} [className]
 * @property {(value: string) => void} [onChange]
 * @property {(action: string) => void} [onAction]
 * @property {string} [id]
 */

/**
 * @typedef {Object} DropdownState
 * @property {boolean} isOpen
 */

/**
 * @extends {Component<DropdownProps, DropdownState>}
 */
export class Dropdown extends Component {
  /**
   * @param {DropdownProps} props
   */
  constructor(props) {
    super(props);
    /** @type {DropdownState} */
    this.state = {
      isOpen: false,
    };
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  componentDidMount() {
    document.addEventListener("click", this.handleOutsideClick, true);
    document.addEventListener("keydown", this.handleKeydown);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleOutsideClick, true);
    document.removeEventListener("keydown", this.handleKeydown);
  }

  /**
   * @param {Event} e
   */
  handleOutsideClick(e) {
    // @ts-ignore
    if (this.base && !this.base.contains(e.target)) {
      this.setState({ isOpen: false });
    }
  }

  /**
   * @param {KeyboardEvent} e
   */
  handleKeydown(e) {
    // @ts-ignore
    if (e.key === "Escape" && this.state.isOpen) {
      this.setState({ isOpen: false });
    }
  }

  /**
   * @param {Event} e
   */
  toggle(e) {
    e.stopPropagation();
    // @ts-ignore
    this.setState((prev) => ({ isOpen: !prev.isOpen }));
  }

  /**
   * @param {DropdownOption} option
   */
  handleOptionClick(option) {
    this.setState({ isOpen: false });
    // @ts-ignore
    if (this.props.actionMode) {
      // @ts-ignore
      if (this.props.onAction) {
        // @ts-ignore
        this.props.onAction(option.value);
      }
    } else {
      // @ts-ignore
      if (option.value !== this.props.value && this.props.onChange) {
        // @ts-ignore
        this.props.onChange(option.value);
      }
    }
  }

  render() {
    // @ts-ignore
    const { options = [], value, icon, actionMode, align = "left", className = "" } = this.props;
    // @ts-ignore
    const { isOpen } = this.state;

    // @ts-ignore
    const selectedOption = options.find((o) => o.value === value) || options[0];
    const labelText = selectedOption ? selectedOption.label : "";

    const triggerClass = `trigger ${icon ? "icon-only" : ""} ${isOpen ? "open" : ""}`;
    const dropdownClass = `dropdown ${align === "right" ? "align-right" : ""} ${!isOpen ? "hidden" : ""}`;

    return html`
      <div class="dp-select ${className}" style="position: relative; display: inline-block;">
        <button
          class=${triggerClass}
          type="button"
          onClick=${this.toggle}
          style="display: flex; align-items: center; gap: 5px; padding: ${icon ? "0" : "0 10px"}; width: ${icon
            ? "2rem"
            : "auto"}; justify-content: center; height: 2rem; border-radius: 9999px; border: none; background: ${isOpen
            ? "var(--active-bg, #e5e5e5)"
            : "transparent"}; color: var(--text-color, #333); font-size: 13px; font-weight: 500; cursor: pointer; transition: background-color 0.15s; white-space: nowrap;"
        >
          ${icon ? icon : html`<span class="label">${labelText}</span>`}
          ${!icon
            ? html`
                <svg
                  class="chevron"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style="width: 12px; height: 12px; opacity: 0.55; flex-shrink: 0; transition: transform 0.15s; transform: ${isOpen
                    ? "rotate(180deg)"
                    : "none"};"
                >
                  <path d="M2 4l4 4 4-4" />
                </svg>
              `
            : null}
        </button>
        <div
          class=${dropdownClass}
          style="position: absolute; top: calc(100% + 6px); ${align === "right"
            ? "right: 0;"
            : "left: 0;"} min-width: 150px; background-color: var(--surface-tertiary, #fff); border: 1px solid var(--border-color, #e5e5e5); border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); z-index: 100; overflow: hidden; padding: 4px; display: ${isOpen
            ? "block"
            : "none"};"
        >
          ${options.map((/** @type {DropdownOption} */ opt) => {
            const isSelected = !actionMode && opt.value === value;
            return html`
              <div
                class="option ${isSelected ? "selected" : ""}"
                onClick=${() => this.handleOptionClick(opt)}
                onMouseOver=${(/** @type {Event} */ e) =>
                  /** @type {HTMLElement} */ (e.currentTarget.style.backgroundColor = "var(--hover-bg, #f0f0f0)")}
                onMouseOut=${(/** @type {Event} */ e) =>
                  /** @type {HTMLElement} */ (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <span>${opt.label}</span>
                ${!actionMode && isSelected
                  ? html`
                      <svg
                        class="check-icon"
                        viewBox="0 0 13 13"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        style="width: 13px; height: 13px; opacity: 0.7;"
                      >
                        <path d="M2 6.5l3 3 6-6" />
                      </svg>
                    `
                  : null}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }
}
