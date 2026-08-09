# Product

## Purpose

A government-facing technology showcase and administrative platform, built to demonstrate agricultural plant protection capabilities to prospective clients and win procurement decisions. The product serves two simultaneous functions: a **high-impact presentation experience** for client leadership, and a **backend administration system** for deployed plant protection services.

The primary goal in any client interaction is to communicate technical ambition and operational credibility — this product must look and feel more capable than anything else in the room.

---

## Primary User

**Government officials and client leadership** at regional plant protection bureaus (各地植保站) and agricultural extension departments (农业推广部). They experience the product in a presentation context: a meeting, a site visit, a procurement review. First impressions are load-bearing — the visualization must convey technical strength before a single word is spoken.

Secondary users are internal operators (super/admin) who manage content, data, and regional deployments.

---

## What This Product Does

- Presents the company's agricultural technology offering through immersive data visualization — 3D Earth, scroll-driven transitions, nationwide project distribution maps
- Showcases the **掌上植保** service (mobile plant protection): pest trend monitoring, agronomic guidance, expert Q&A, farmer community
- Provides an admin backend for managing operations across multi-region deployments

Core service pillars: 学农技 · 寻防治 · 问专家 · 农友圈

---

## Positioning

Government agricultural technology platform. The differentiator is **visual and technical ambition**: the product wins in the demo room by making every farmland a computable production unit (让每一块农田都成为可计算的生产单元). Competing on data depth alone is insufficient — the presentation experience is the product.

---

## Durable Constraints

**Must not change:**
- The 3D Earth visualization with scroll-driven transitions (Three.js + GSAP + ScrollTrigger) is the brand's most visible technical asset. Its visual impact is central to the sales pitch. No refactor or simplification that degrades this effect is acceptable.
- The dark, cinematic visual language of the visualization page (`background: #040d14`, full-screen layout, sticky Earth) is part of brand identity. Content pages can use lighter themes; the visualization page cannot.

**Must preserve:**
- Three-tier permission model (super / admin / user) for multi-client, multi-region deployment
- Nationwide geographic scope — the product must scale to serve clients across different provinces
- The `big` layout system for full-screen visualization experiences (distinct from the `basic` admin layout)

---

## Product Name

Working title: **掌上植保**（植保综合服务平台）

Final product name is not yet confirmed — verify before any external-facing materials are finalized.

---

## Tech Stack (Locked)

Vue 3.5 · Vite 8 · TypeScript · Naive UI · UnoCSS · Three.js (@tresjs) · GSAP 3 · ECharts 6 · Leaflet · D3 · Pinia · Vue Router 5

These dependencies are established and in production use. New dependencies require justification against the existing stack.
