/* ========================================== */
/* ProductButton.js: The State Publisher      */
/* ========================================== */

import { globalStore } from "../store.js";

class ProductButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const productName = this.getAttribute("product-name") || "Item";

    this.shadowRoot.innerHTML = `
            <style>
                button {
                    background: #22c55e;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 600;
                }
                button:hover { background: #16a34a; }
                button:active { transform: scale(0.98); }
            </style>
            <button id="add-btn">Add ${productName} to Cart</button>
        `;

    const btn = this.shadowRoot.getElementById("add-btn");

    btn.addEventListener("click", () => {
      const currentState = globalStore.getState();
      globalStore.setState({
        cartCount: (currentState.cartCount || 0) + 1,
      });
      console.log(`✅ Published state change: Added ${productName}`);
    });
  }
}

customElements.define("product-button", ProductButton);
