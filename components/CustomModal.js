/* ========================================== */
/* CustomModal.js: Template Cloning Module    */
/* ========================================== */

class CustomModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const template = document.getElementById("modal-template");

    if (template) {
      const templateContent = template.content.cloneNode(true);
      this.shadowRoot.appendChild(templateContent);
    } else {
      console.error(
        "CustomModal Error: Cannot find 'modal-template' in the DOM.",
      );
    }
  }

  connectedCallback() {
    const closeBtn = this.shadowRoot.getElementById("internal-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }
  }

  // Bonus: open/close via the 'open' attribute, driven by :host([open]) CSS
  open() {
    this.setAttribute("open", "");
  }

  close() {
    this.removeAttribute("open");
  }
}

customElements.define("custom-modal", CustomModal);
