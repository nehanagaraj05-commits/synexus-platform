/* ========================================== */
/* CartCounter.js: The Reactive Subscriber    */
/* ========================================== */

import { globalStore } from "../store.js";

class CartCounter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
            <style>
                .badge {
                    background: #4b6cb7;
                    color: white;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-weight: bold;
                    transition: transform 0.2s ease;
                    display: inline-block;
                }
                .pop {
                    transform: scale(1.2);
                }
            </style>
            <div class="badge">🛒 Cart: <span id="count">0</span></div>
        `;
  }

  connectedCallback() {
    const initialState = globalStore.getState();
    this.updateUI(initialState.cartCount);

    this.unsubscribe = globalStore.subscribe((newState) => {
      this.updateUI(newState.cartCount);
    });
  }

  updateUI(count) {
    const countSpan = this.shadowRoot.getElementById("count");
    const badge = this.shadowRoot.querySelector(".badge");

    if (countSpan) countSpan.textContent = count || 0;

    if (badge) {
      badge.classList.add("pop");
      setTimeout(() => badge.classList.remove("pop"), 200);
    }
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
      console.log("🧹 CartCounter unsubscribed to prevent memory leaks.");
    }
  }
}

customElements.define("cart-counter", CartCounter);
