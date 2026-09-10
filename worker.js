/* ========================================== */
/* worker.js: The Isolated CPU Thread         */
/* ========================================== */

self.onmessage = function (event) {
  console.log("⚙️ [Worker] Message received from Main Thread:", event.data);

  const command = event.data;
  if (command === "START_COMPUTATION") {
    console.log("⚙️ [Worker] Starting heavy CPU task...");

    let complexResult = 0;
    for (let i = 0; i < 2000000000; i++) {
      complexResult += i;
    }

    console.log("⚙️ [Worker] Task complete. Sending data back.");
    self.postMessage({ status: "SUCCESS", data: complexResult });
  }
};

self.onerror = function (error) {
  console.error("⚙️ [Worker] Thread Error:", error.message);
};
