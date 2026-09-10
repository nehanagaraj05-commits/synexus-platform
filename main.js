/* ========================================== */
/* main.js: Synexus Core Engine (Modular)     */
/* ========================================== */

import { debounce } from "./utils.js";
import { getOfflineData } from "./db.js";
import { globalStore } from "./store.js";
import {
  fetchGithubUser,
  fetchGithubRepos,
  postProposal,
  updateProposal,
  deleteProposal,
  fetchPostsPage,
  secureDeleteResource,
  fetchDashboardData,
} from "./api.js";
import { connectWebSocket, sendLiveMessage } from "./websocket.js";
// ==========================================
// 1. GLOBAL UI MODULES
// ==========================================

function initThemeToggle() {
  const themeToggleBtn = document.getElementById("theme-toggle");
  if (!themeToggleBtn) return;

  const currentTheme = localStorage.getItem("synexus_theme");
  const isDark = currentTheme === "dark";
  if (isDark) {
    document.body.classList.add("dark-theme");
    themeToggleBtn.textContent = "☀️";
  }
  globalStore.setState({ isDarkMode: isDark }); // sync initial state to the store

  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const nowDark = document.body.classList.contains("dark-theme");
    themeToggleBtn.textContent = nowDark ? "☀️" : "🌙";
    localStorage.setItem("synexus_theme", nowDark ? "dark" : "light");
    globalStore.setState({ isDarkMode: nowDark }); // publish the change
  });
}

function initMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector("nav ul");
  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("nav-active");
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", !isExpanded);
  });
}

// ==========================================
// 2. VIEW-SPECIFIC MODULES
// ==========================================

function initFormValidation() {
  const membershipForm = document.querySelector(".membership-form");
  const nameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("emailAddress");
  if (!membershipForm || !nameInput || !emailInput) return;

  const savedDraft = localStorage.getItem("synexus_form_draft");
  if (savedDraft) {
    const parsed = JSON.parse(savedDraft);
    nameInput.value = parsed.name || "";
    emailInput.value = parsed.email || "";
  }

  function saveProgress() {
    localStorage.setItem(
      "synexus_form_draft",
      JSON.stringify({
        name: nameInput.value,
        email: emailInput.value,
      }),
    );
  }
  nameInput.addEventListener("input", saveProgress);
  emailInput.addEventListener("input", saveProgress);

  membershipForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const nameValue = nameInput.value.trim();
    const emailValue = emailInput.value.trim();

    if (nameValue === "") {
      nameInput.style.borderColor = "red";
    } else if (!emailValue.includes("@")) {
      emailInput.style.borderColor = "red";
    } else {
      nameInput.style.borderColor = "#ccc";
      emailInput.style.borderColor = "#ccc";
      membershipForm.reset();
      localStorage.removeItem("synexus_form_draft");
    }
  });
}

let scrollObserver = null;
function initScrollObserver() {
  const hiddenElements = document.querySelectorAll(".hidden:not(.show)");
  if (hiddenElements.length === 0) return;

  if (!scrollObserver) {
    scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          scrollObserver.unobserve(entry.target);
        }
      });
    });
  }
  hiddenElements.forEach((el) => scrollObserver.observe(el));
}

const projectsData = [
  {
    title: "Project StoreLane",
    description:
      "A phygital hyperlocal commerce platform designed to digitize small local vendors.",
    status: "Active",
  },
  {
    title: "QR Attendance Tracker",
    description:
      "Automated student attendance system utilizing progressive web app (PWA) tech and real-time scanning.",
    status: "Active",
  },
  {
    title: "Logistics Management System",
    description:
      "Desktop architecture built for tracking shipments and driver status in real-time.",
    status: "Completed",
  },
];

function renderProjects(dataArray) {
  const gridContainer = document.getElementById("dynamic-grid");
  if (!gridContainer) return;

  gridContainer.innerHTML = "";
  if (dataArray.length === 0) {
    gridContainer.innerHTML = "<p>No initiatives match your search.</p>";
    return;
  }

  dataArray.forEach((project) => {
    const statusClass =
      project.status === "Active" ? "status-active" : "status-completed";
    gridContainer.innerHTML += `
            <div class="initiative-card ${statusClass} hidden">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <span class="badge">${project.status}</span>
                <button class="view-btn" data-title="${project.title}">View Details</button>
            </div>
        `;
  });
}

function initInitiativesSearch() {
  const gridContainer = document.getElementById("dynamic-grid");
  const searchInput = document.getElementById("search-projects");
  if (!gridContainer) return;

  renderProjects(projectsData);
  initScrollObserver();

  if (searchInput) {
    const optimizedSearch = debounce((event) => {
      const term = event.target.value.toLowerCase();
      const filtered = projectsData.filter((p) =>
        p.title.toLowerCase().includes(term),
      );
      renderProjects(filtered);
      initScrollObserver();
    }, 400);
    searchInput.addEventListener("input", optimizedSearch);
  }
}

function initProjectModal() {
  const gridContainer = document.getElementById("dynamic-grid");
  const projectModal = document.getElementById("project-modal");
  const modalTitle = document.getElementById("modal-title");
  const closeModalBtn = document.getElementById("close-modal");
  if (!gridContainer || !projectModal) return;

  gridContainer.addEventListener("click", (e) => {
    const clickedButton = e.target.closest(".view-btn");
    if (!clickedButton) return;
    modalTitle.textContent = clickedButton.getAttribute("data-title");
    projectModal.style.display = "flex";
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      projectModal.style.display = "none";
    });
  }
  projectModal.addEventListener("click", (e) => {
    if (e.target === projectModal) projectModal.style.display = "none";
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") projectModal.style.display = "none";
  });
}

let testimonialInterval = null;
function initTestimonials() {
  const testimonialName = document.getElementById("testimonial-name");
  const testimonialQuote = document.getElementById("testimonial-quote");
  if (!testimonialName || !testimonialQuote) return;

  const testimonialsData = [
    { name: "Anant Sharma", quote: "It's about logic, not just languages." },
    {
      name: "Harshit Singh",
      quote:
        "Synexus changed how I approach engineering. It's about logic, not just languages.",
    },
    {
      name: "P V Pavithra",
      quote:
        "Building real-world architecture in this community has been a game changer.",
    },
    {
      name: "Abhay Aditya R S",
      quote:
        "The focus on standard protocols over fleeting trends is exactly what the industry needs.",
    },
  ];

  let currentIndex = 0;
  function updateTestimonial() {
    const data = testimonialsData[currentIndex];
    testimonialName.textContent = data.name;
    testimonialQuote.textContent = data.quote;
    currentIndex = (currentIndex + 1) % testimonialsData.length;
  }

  updateTestimonial();
  if (testimonialInterval) clearInterval(testimonialInterval);
  testimonialInterval = setInterval(updateTestimonial, 3000);
}

function initTaskTracker() {
  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskListContainer = document.getElementById("task-list");
  if (!taskListContainer || !addTaskBtn || !taskInput) return;

  let taskState = [];

  function renderTasks() {
    taskListContainer.innerHTML = "";
    taskState.forEach((task) => {
      const li = document.createElement("li");
      li.className = `task-item ${task.completed ? "done" : ""}`;
      li.innerHTML = `
                <input type="checkbox" class="toggle-check" data-id="${task.id}" ${task.completed ? "checked" : ""}>
                <span>${task.text}</span>
                <button class="delete-btn" data-id="${task.id}">&times;</button>
            `;
      taskListContainer.appendChild(li);
    });
  }

  addTaskBtn.addEventListener("click", () => {
    const textValue = taskInput.value.trim();
    if (textValue === "") return;
    taskState.push({ id: Date.now(), text: textValue, completed: false });
    taskInput.value = "";
    renderTasks();
  });

  taskListContainer.addEventListener("click", (e) => {
    const targetId = Number(e.target.getAttribute("data-id"));
    if (!targetId) return;
    if (e.target.classList.contains("delete-btn")) {
      taskState = taskState.filter((t) => t.id !== targetId);
    }
    if (e.target.classList.contains("toggle-check")) {
      const found = taskState.find((t) => t.id === targetId);
      if (found) found.completed = !found.completed;
    }
    renderTasks();
  });
}

function saveKanbanState() {
  const columns = document.querySelectorAll(".kanban-column");
  const state = {};
  columns.forEach((col) => {
    const status = col.dataset.status;
    const cards = col.querySelectorAll(".task-card");
    state[status] = Array.from(cards).map((c) => c.textContent);
  });
  localStorage.setItem("synexus_kanban_state", JSON.stringify(state));
}

function loadKanbanState() {
  const saved = localStorage.getItem("synexus_kanban_state");
  if (!saved) return;

  const state = JSON.parse(saved);
  Object.keys(state).forEach((status) => {
    const column = document.querySelector(
      `.kanban-column[data-status="${status}"] .task-list`,
    );
    if (!column) return;
    column.innerHTML = "";
    state[status].forEach((text) => {
      const card = document.createElement("div");
      card.className = "task-card";
      card.setAttribute("draggable", "true");
      card.textContent = text;
      column.appendChild(card);
    });
  });
}

function initKanbanBoard() {
  const kanbanColumns = document.querySelectorAll(".kanban-column .task-list");
  if (kanbanColumns.length === 0) return;

  loadKanbanState();

  function attachCardListeners(card) {
    card.addEventListener("dragstart", () => card.classList.add("is-dragging"));
    card.addEventListener("dragend", () =>
      card.classList.remove("is-dragging"),
    );
  }
  document.querySelectorAll(".task-card").forEach(attachCardListeners);

  kanbanColumns.forEach((column) => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      const draggedCard = document.querySelector(".is-dragging");
      if (draggedCard) column.appendChild(draggedCard);
    });
    column.addEventListener("drop", () => saveKanbanState());
  });
}

// --- Day 26+27+28+36: Dev Lookup with URL Deep Linking ---
function initDevLookup() {
  const usernameInput = document.getElementById("github-username");
  const profileContainer = document.getElementById("dev-profile-card");
  const reposGrid = document.getElementById("repos-grid");
  if (!usernameInput || !profileContainer || !reposGrid) return;

  let currentController = null;

  function updateURLParameter(key, value) {
    const url = new URL(window.location);
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
    window.history.pushState({}, "", url);
  }

  async function loadRepos(username, signal) {
    reposGrid.innerHTML = `<p class="loading-text">Loading repositories...</p>`;
    try {
      const data = await fetchGithubRepos(username, signal);
      reposGrid.innerHTML = "";

      if (data.length === 0) {
        reposGrid.innerHTML = `<p>No public repositories found for this user.</p>`;
        return;
      }

      data.forEach((repo) => {
        reposGrid.innerHTML += `
                    <div class="initiative-card">
                        <h3>${repo.name}</h3>
                        <p>${repo.description || "No description provided for this project."}</p>
                        <div class="repo-meta" style="margin-top: 15px; display: flex; gap: 10px; font-size: 0.9rem;">
                            <span>⭐ ${repo.stargazers_count}</span>
                            <span>🍴 ${repo.forks_count}</span>
                        </div>
                        <a href="${repo.html_url}" target="_blank" class="btn-cta" style="margin-top: 15px; display: inline-block;">View Code</a>
                    </div>
                `;
      });
    } catch (error) {
      if (error.name === "AbortError") return;
      reposGrid.innerHTML = `<p class="error-text">⚠️ Failed to load repositories.</p>`;
    }
  }

  async function loadContributor(forcedUsername) {
    const username = forcedUsername || usernameInput.value.trim();

    if (currentController) currentController.abort();
    currentController = new AbortController();
    const signal = currentController.signal;

    if (username === "") {
      profileContainer.innerHTML = "";
      reposGrid.innerHTML = "";
      updateURLParameter("user", null); // Bonus: keep the address bar clean
      return;
    }

    if (forcedUsername) usernameInput.value = forcedUsername; // hydration case: reflect it in the input

    profileContainer.innerHTML = `<p class="loading-text">Searching for ${username}...</p>`;
    reposGrid.innerHTML = "";

    try {
      const data = await fetchGithubUser(username, signal);
      profileContainer.innerHTML = `
                <div class="profile-card">
                    <img src="${data.avatar_url}" alt="${data.name || data.login}'s Avatar">
                    <h3>${data.name || data.login}</h3>
                    <p>${data.bio || "No bio available."}</p>
                    <a href="${data.html_url}" target="_blank" class="btn-cta">View GitHub</a>
                </div>
            `;
      updateURLParameter("user", username); // sync URL only on a successful search
      loadRepos(username, signal);
    } catch (error) {
      if (error.name === "AbortError") return;
      profileContainer.innerHTML = `<p class="error-text">⚠️ ${error.message}</p>`;
    }
  }

  const optimizedSearch = debounce(() => loadContributor(), 500);
  usernameInput.addEventListener("input", optimizedSearch);

  // Day 36: Hydrate from URL on load — runs every time this section renders (i.e. on "/")
  const params = new URLSearchParams(window.location.search);
  const userFromURL = params.get("user");
  if (userFromURL) {
    loadContributor(userFromURL);
  }
}
// --- Day 37: Parallel Dashboard (Promise.all) ---
function initDashboard() {
  const searchInput = document.getElementById("dashboard-search");
  const dashboardContainer = document.getElementById("dashboard-view");
  if (!searchInput || !dashboardContainer) return;

  async function renderDashboard() {
    const username = searchInput.value.trim();
    if (!username) {
      dashboardContainer.innerHTML = "";
      return;
    }

    dashboardContainer.innerHTML = `<p class="loading-text">Assembling dashboard...</p>`;

    try {
      const dashboard = await fetchDashboardData(username);

      let html = `
                <div class="dashboard-header">
                    <img src="${dashboard.profile.avatar_url}" width="80" alt="${dashboard.profile.login}'s avatar">
                    <h3>${dashboard.profile.name || dashboard.profile.login}</h3>
                    <p>Total Repos: ${dashboard.profile.public_repos} | Followers: ${dashboard.profile.followers}</p>
                </div>
                <h4>Recent Work</h4>
                <div class="dash-repo-grid">
            `;

      if (dashboard.recentRepos.length === 0) {
        html += `<p>No public repositories found.</p>`;
      } else {
        dashboard.recentRepos.forEach((repo) => {
          html += `
                        <div class="dash-card">
                            <h4>${repo.name}</h4>
                            <p style="font-size: 0.8rem;">${repo.description || "No description"}</p>
                        </div>
                    `;
        });
      }

      html += `</div><h4>Recent Followers</h4><div class="dash-follower-list">`;

      if (dashboard.recentFollowers.length === 0) {
        html += `<p>No followers found.</p>`;
      } else {
        dashboard.recentFollowers.forEach((follower) => {
          html += `
                        <div class="dash-follower-item">
                            <img src="${follower.avatar_url}" width="40" alt="${follower.login}">
                            <p style="font-size: 0.7rem;">${follower.login}</p>
                        </div>
                    `;
        });
      }

      html += `</div>`;
      dashboardContainer.innerHTML = html;
    } catch (error) {
      dashboardContainer.innerHTML = `<p class="error-text">⚠️ ${error.message}</p>`;
    }
  }

  searchInput.addEventListener("input", debounce(renderDashboard, 600));
}
// --- Day 29: Proposal Form (now using api.js) ---
function initProposalForm() {
  const proposalForm = document.getElementById("proposal-form");
  const titleInput = document.getElementById("proposal-title");
  const descInput = document.getElementById("proposal-description");
  const submitBtn = document.getElementById("proposal-submit-btn");
  const feedbackContainer = document.getElementById("proposal-feedback");
  if (
    !proposalForm ||
    !titleInput ||
    !descInput ||
    !submitBtn ||
    !feedbackContainer
  )
    return;

  proposalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newInitiative = {
      title: titleInput.value.trim(),
      body: descInput.value.trim(),
      userId: 1,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    feedbackContainer.innerHTML = "";

    try {
      const data = await postProposal(newInitiative);
      feedbackContainer.innerHTML = `<p class="success-text">✅ Proposal submitted! (ID: ${data.id})</p>`;
      proposalForm.reset();
    } catch (error) {
      if (error.message === "OFFLINE_SAVED") {
        feedbackContainer.innerHTML = `<p style="color: orange;">📡 You are offline. Proposal saved securely to your device and will sync later!</p>`;
        proposalForm.reset();
      } else {
        feedbackContainer.innerHTML = `<p class="error-text">⚠️ Failed to submit proposal. Please try again.</p>`;
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Proposal";
    }
  });
}

// --- Day 30: PUT/DELETE (now using api.js) ---
function initProposalManagement() {
  const updateBtn = document.getElementById("update-btn");
  const deleteBtn = document.getElementById("delete-btn");
  const feedbackMessage = document.getElementById("manage-feedback");
  if (!updateBtn || !deleteBtn || !feedbackMessage) return;

  updateBtn.addEventListener("click", async () => {
    try {
      feedbackMessage.innerHTML = `<p class="loading-text">Updating initiative #1...</p>`;
      const result = await updateProposal(1, {
        id: 1,
        title: "StoreLane V2 Architecture [UPDATED]",
        body: "Revised specifications for the hyperlocal platform.",
        userId: 1,
      });
      console.log("Update Confirmed:", result);
      feedbackMessage.innerHTML = `<p style="color: blue;">🔄 Initiative #1 updated successfully!</p>`;
    } catch (error) {
      feedbackMessage.innerHTML = `<p style="color: red;">⚠️ ${error.message}</p>`;
    }
  });

  deleteBtn.addEventListener("click", async () => {
    const isConfirmed = window.confirm(
      "WARNING: Are you sure you want to delete this? This cannot be undone.",
    );
    if (!isConfirmed) return;

    try {
      feedbackMessage.innerHTML = `<p class="loading-text">Authenticating and deleting initiative #1...</p>`;
      await secureDeleteResource(1);
      feedbackMessage.innerHTML = `<p style="color: red;">🗑️ Initiative #1 was permanently deleted.</p>`;
    } catch (error) {
      feedbackMessage.innerHTML = `<p style="color: red;">⚠️ ${error.message}</p>`;
    }
  });
}

// --- Day 31: Infinite Scroll (now using api.js) ---
function initInfiniteScrollFeed() {
  const feedContainer = document.getElementById("data-feed");
  const sentinel = document.getElementById("scroll-sentinel");
  if (!feedContainer || !sentinel) return;

  let currentPage = 1;
  const limit = 10;
  let isLoading = false;
  let hasMoreData = true;

  async function fetchNextPage() {
    if (isLoading || !hasMoreData) return;
    isLoading = true;

    try {
      const data = await fetchPostsPage(currentPage, limit);

      if (data.length === 0) {
        hasMoreData = false;
        sentinel.textContent = "You've reached the end of the feed.";
        feedScrollObserver.disconnect();
        return;
      }

      data.forEach((item) => {
        feedContainer.innerHTML += `
                    <div class="feed-card">
                        <h4>${item.id}. ${item.title}</h4>
                        <p>${item.body}</p>
                    </div>
                `;
      });
    } catch (error) {
      sentinel.textContent = "Error loading more items.";
    } finally {
      isLoading = false;
    }
  }

  const feedScrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          currentPage++;
          fetchNextPage();
        }
      });
    },
    { rootMargin: "100px" },
  );

  fetchNextPage();
  feedScrollObserver.observe(sentinel);
}
// --- Day 38: WebSocket Live Terminal ---
function initLiveTerminal() {
  const wsInput = document.getElementById("ws-input");
  const wsSendBtn = document.getElementById("ws-send");
  if (!wsInput || !wsSendBtn) return;

  wsSendBtn.addEventListener("click", () => {
    const text = wsInput.value.trim();
    if (text === "") return;
    sendLiveMessage(text);
    wsInput.value = "";
  });

  wsInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      wsSendBtn.click();
    }
  });
}

// ==========================================
// 3. THE SPA ROUTER
// ==========================================

let routes = {};

function buildRoutes() {
  const appRoot = document.getElementById("app-root");
  const homeHTML = appRoot.innerHTML;

  routes = {
    "/": homeHTML,
    404: `
            <div class="view-container" style="padding:60px 50px;text-align:center;">
                <h1>404</h1>
                <p>Page not found.</p>
                <a href="/">Go Home</a>
            </div>
        `,
  };
}

function router() {
  let path = window.location.pathname;
  if (path.includes("index.html")) path = "/";

  const viewHTML = routes[path] || routes[404];
  document.getElementById("app-root").innerHTML = viewHTML;

  if (path === "/") {
    initInitiativesSearch();
    initProjectModal();
    initTestimonials();
    initTaskTracker();
    initKanbanBoard();
    initFormValidation();
    initDevLookup();
    initProposalForm();
    initProposalManagement();
    initInfiniteScrollFeed();
    initDashboard();
    initLiveTerminal();
    initWorkerDemo();
    initLiveStats();
    initReactiveComponentsDemo();
    initModalDemo();
  }
}

// ==========================================
// 4. ENGINE INITIALIZATION
// ==========================================
// --- Day 39: Service Worker Registration ---
window.addEventListener("load", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.log(
          "✅ Service Worker registered successfully with scope:",
          registration.scope,
        );
      })
      .catch((error) => {
        console.error("⚠️ Service Worker registration failed:", error);
      });
  } else {
    console.log("Service Workers are not supported in this browser.");
  }
});

function initApp() {
  console.log("Synexus Core Engine: Online (Modular).");

  buildRoutes();

  initThemeToggle();
  initMobileMenu();
  connectWebSocket(); // ← add this line, global — connects once

  document.body.addEventListener("click", (e) => {
    if (e.target.matches(".nav-link")) {
      e.preventDefault();
      window.history.pushState(null, "", e.target.getAttribute("href"));
      router();
    }
  });

  window.addEventListener("popstate", router);

  router();
}
document.addEventListener("DOMContentLoaded", initApp);
// --- Day 40 Bonus: Log offline-saved data when back online ---
window.addEventListener("online", async () => {
  console.log("🌐 Back online! Checking for offline-saved proposals...");
  const offlineItems = await getOfflineData();
  if (offlineItems.length > 0) {
    console.log(
      `📦 Found ${offlineItems.length} offline-saved item(s):`,
      offlineItems,
    );
  } else {
    console.log("No offline data pending sync.");
  }
});
// --- Day 41: Web Worker Multithreading Demo ---
function initWorkerDemo() {
  const processBtn = document.getElementById("process-btn");
  const terminateBtn = document.getElementById("terminate-btn");
  const outputDisplay = document.getElementById("computation-output");
  if (!processBtn || !terminateBtn || !outputDisplay) return;

  if (!window.Worker) {
    console.error("Web Workers are not supported in your browser.");
    return;
  }

  let backgroundWorker;

  function attachWorkerListener(worker) {
    worker.onmessage = function (event) {
      const payload = event.data;
      if (payload.status === "SUCCESS") {
        console.log("🖥️ [Main] Result received from Worker:", payload.data);
        outputDisplay.innerHTML = `<p style="color: green;">✅ Math Complete: ${payload.data}</p>`;
        processBtn.disabled = false;
        processBtn.textContent = "Run Heavy Process";
      }
    };
  }

  function createWorker() {
    backgroundWorker = new Worker("./worker.js");
    attachWorkerListener(backgroundWorker); // fixes the missing re-attach bug
    return backgroundWorker;
  }

  createWorker();

  processBtn.addEventListener("click", () => {
    outputDisplay.innerHTML = `<p class="loading-text">Processing 2 billion iterations in the background... Notice the spinner never freezes?</p>`;
    processBtn.disabled = true;
    processBtn.textContent = "Processing...";
    backgroundWorker.postMessage("START_COMPUTATION");
  });

  terminateBtn.addEventListener("click", () => {
    console.warn("🖥️ [Main] Terminating the background thread instantly.");
    backgroundWorker.terminate();

    outputDisplay.innerHTML = `<p style="color: red;">🛑 Process forcibly canceled by user.</p>`;
    processBtn.disabled = false;
    processBtn.textContent = "Run Heavy Process";

    createWorker(); // spin up a fresh worker AND re-attach its listener
  });
}
// --- Day 43: Global State Subscriber (Live Stats Widget) ---
function initLiveStats() {
  const themeStatusDisplay = document.getElementById("theme-status-display");
  if (!themeStatusDisplay) return;

  // Reflect current state immediately on render
  const current = globalStore.getState();
  themeStatusDisplay.textContent = `Current theme (from global store): ${current.isDarkMode ? "Dark 🌙" : "Light ☀️"}`;

  globalStore.subscribe((state) => {
    themeStatusDisplay.textContent = `Current theme (from global store): ${state.isDarkMode ? "Dark 🌙" : "Light ☀️"}`;
    themeStatusDisplay.classList.add("flash-update");
    setTimeout(() => themeStatusDisplay.classList.remove("flash-update"), 300);
  });
}
// --- Day 44: Toggle to demonstrate connected/disconnected lifecycle ---
function initReactiveComponentsDemo() {
  const toggleBtn = document.getElementById("toggle-counter-btn");
  const slot = document.getElementById("cart-counter-slot");
  if (!toggleBtn || !slot) return;

  let isPresent = true;

  toggleBtn.addEventListener("click", () => {
    if (isPresent) {
      slot.innerHTML = ""; // removes <cart-counter>, triggers disconnectedCallback
    } else {
      slot.innerHTML = "<cart-counter></cart-counter>"; // re-adds it, triggers connectedCallback again
    }
    isPresent = !isPresent;
  });
}
// --- Day 45: Modal Open/Close Triggers ---
function initModalDemo() {
  const openDeleteBtn = document.getElementById("open-delete-modal");
  const openWelcomeBtn = document.getElementById("open-welcome-modal");
  const deleteModal = document.getElementById("delete-modal");
  const welcomeModal = document.getElementById("welcome-modal");
  if (!openDeleteBtn || !openWelcomeBtn || !deleteModal || !welcomeModal)
    return;

  openDeleteBtn.addEventListener("click", () => deleteModal.open());
  openWelcomeBtn.addEventListener("click", () => welcomeModal.open());
}
