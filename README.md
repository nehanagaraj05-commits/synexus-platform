# Synexus Community Platform

A production-grade Single Page Application built entirely with vanilla HTML, CSS, and JavaScript — no frameworks, no build step, no bundler. Built as the capstone of a 50-day web development challenge.

## Architecture

- **SPA Router** — native `pushState`/`popstate` client-side routing, no page reloads.
- **State Management** — a hand-built Pub/Sub store (`store.js`) broadcasts state changes to any subscriber, decoupling UI components from each other.
- **Web Components** — reusable, encapsulated UI (`<user-card>`, `<cart-counter>`, `<product-button>`, `<custom-modal>`) using native Shadow DOM, `<template>`, and `<slot>` — no React/Vue required.
- **Offline-First** — a Service Worker (`sw.js`) caches core assets for instant, offline-capable loads. IndexedDB (`db.js`) persists form submissions locally when the network is unavailable, syncing when the connection returns.
- **Resilient Networking** — `api.js` wraps all external requests in an exponential-backoff retry utility (`fetchWithRetry`), an in-memory TTL cache for repeated lookups, `AbortController` for cancelling stale requests, and `Promise.all` for parallel data fetching on the dashboard.
- **Real-Time** — a WebSocket module (`websocket.js`) with auto-reconnect for live bidirectional messaging.
- **Background Processing** — a Web Worker (`worker.js`) offloads heavy computation off the main thread to keep the UI at 60fps.
- **Bearer Token Auth** — secured `DELETE` requests via `Authorization: Bearer` headers pulled from `localStorage`.

## Running Locally

This is a static site with ES6 modules — it must be served, not opened directly (module imports and Service Workers require `http://`, not `file://`).

Use VS Code's Live Server extension, or run:

npx live-server .

## Deployment

Deployed on Vercel with a `vercel.json` rewrite rule so client-side routes resolve correctly on refresh.
