/* ========================================== */
/* UserCard.js: Native Web Component          */
/* ========================================== */

class UserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  // Bonus: tells the browser which attributes to watch for live updates
  static get observedAttributes() {
    return ["name", "role", "avatar"];
  }

  connectedCallback() {
    this.render();
  }

  // Bonus: fires automatically whenever a watched attribute changes
  attributeChangedCallback(attrName, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const name = this.getAttribute("name") || "Unknown User";
    const role = this.getAttribute("role") || "Member";
    const avatar =
      this.getAttribute("avatar") || "https://via.placeholder.com/150";

    this.shadowRoot.innerHTML = `
            <style>
                .card {
                    font-family: 'Inter', Arial, sans-serif;
                    background: #ffffff;
                    border-radius: 8px;
                    padding: 20px;
                    width: 220px;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
                }
                .avatar {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    object-fit: cover;
                    margin-bottom: 15px;
                }
                h3 {
                    margin: 0 0 5px 0;
                    color: #333;
                    font-size: 1.1rem;
                    font-weight: 700;
                }
                p {
                    margin: 0;
                    color: #777;
                    font-size: 0.9rem;
                }
            </style>

            <div class="card">
                <img src="${avatar}" alt="${name}" class="avatar">
                <h3>${name}</h3>
                <p>${role}</p>
            </div>
        `;
  }
}

customElements.define("user-card", UserCard);
