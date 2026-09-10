/* ========================================== */
/* websocket.js: Persistent Data Streams      */
/* ========================================== */

const wsUrl = "wss://ws.postman-echo.com/raw";
let liveSocket;
let reconnectTimeout = null;

export function connectWebSocket() {
  console.log("🔌 Attempting to connect to live server...");

  liveSocket = new WebSocket(wsUrl);

  liveSocket.onopen = () => {
    console.log("🟢 Live Connection Established!");
    const statusIndicator = document.getElementById("connection-status");
    if (statusIndicator) statusIndicator.innerHTML = "🟢 Online";
  };

  liveSocket.onmessage = (event) => {
    console.log("📥 Incoming Stream:", event.data);
    const feedContainer = document.getElementById("live-feed");
    if (feedContainer) {
      feedContainer.innerHTML += `<div class="msg received">Server: ${event.data}</div>`;
      feedContainer.scrollTop = feedContainer.scrollHeight;
    }
  };

  liveSocket.onerror = (error) => {
    console.error("⚠️ WebSocket Error:", error);
  };

  liveSocket.onclose = () => {
    console.warn("🔴 Connection Lost.");
    const statusIndicator = document.getElementById("connection-status");
    if (statusIndicator)
      statusIndicator.innerHTML = "🔴 Offline (reconnecting...)";

    // Bonus: auto-reconnect after 3 seconds
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    reconnectTimeout = setTimeout(() => {
      connectWebSocket();
    }, 3000);
  };
}

export function sendLiveMessage(payloadText) {
  if (liveSocket && liveSocket.readyState === WebSocket.OPEN) {
    liveSocket.send(payloadText);
    console.log("📤 Outgoing Stream:", payloadText);

    const feedContainer = document.getElementById("live-feed");
    if (feedContainer) {
      feedContainer.innerHTML += `<div class="msg sent">You: ${payloadText}</div>`;
      feedContainer.scrollTop = feedContainer.scrollHeight;
    }
  } else {
    console.error("Cannot transmit: Connection is not open.");
    alert("Wait for the connection to establish before sending.");
  }
}
