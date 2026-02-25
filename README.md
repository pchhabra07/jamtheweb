# Hivesto — Your Money, In Orbit

> A space-themed personal finance tracker built with React and Firebase.

---

## 🌌 About the Project

Hivesto is a personal finance web app that blends the cosmic world of space with the sweetness of financial growth. The name itself is derived from **Hive** (a colony that builds, stores, and grows) and **Invest** — because every great financial journey starts with a hive mentality.

---

## 🍯 How We Used the Three Words

### 1. 🍯 Honey — The Language of Your Money

**Honey** is the central metaphor for **money and financial health** throughout the app.

- **Nectar** — Every income transaction you log is called *nectar*, the raw resource bees collect to make honey, just like your income is the raw resource you collect to build wealth.
- **Burn** — Every expense is called a *burn*, the energy spent away from your hive.
- **Honey Score** — The app's signature feature: a 0–100 financial health metric calculated from your income vs expenses ratio. The higher your score, the stronger your hive. It's your personal measure of how much *honey* you've built up.
- **Honey AI Advisor** — An AI-powered assistant that analyzes your financial data and gives you personalized, bee-themed financial tips. Ask it *"How is my hive doing?"* and it responds with actionable insights.

> Honey = Money. Every drop counts.

---

### 2. 💸 Money — The Core Purpose

**Money** is the entire foundation of what Hivesto tracks, visualizes, and helps you grow.

- Users log **income and expenses** in real time, stored securely in Firebase Firestore under their personal account.
- The **Dashboard** displays your total nectar (income), total burn (expenses), and net balance — giving you an instant snapshot of your money's state.
- **Goals** let you assign money toward specific targets — a vacation, an emergency fund, a new gadget — so your money always has a destination.
- The **Honey Score** is a direct quantification of how well you're managing your money, updated every time you log a transaction.

> Hivesto doesn't just store your money data — it gives it meaning, direction, and orbit.

---

### 3. 🪐 Orbit — The Visual Soul of the App

**Orbit** is the design language and the visual metaphor that ties everything together.

- The **Orbit Visualizer** on the Goals page renders each of your savings goals as a **planet orbiting a central sun**. The closer a goal is to being fully funded, the brighter and larger its orbit ring glows.
- The entire app uses a **deep space aesthetic** — dark navy backgrounds (`#0a0a1a`), ambient starfield animations, and glowing amber accents — to make your finances feel like a living, breathing cosmos.
- The idea of **orbit** also represents the *cycle* of money: income flows in, expenses flow out, and your goals pull your savings into stable, purposeful orbit.
- The font **Orbitron** (Google Fonts) is used throughout the UI, reinforcing the space theme typographically.

> Your money doesn't just sit — it orbits your goals like planets around a sun.

---

## 🚀 Tech Stack

- **Frontend:** React (fully responsive across mobile, tablet, and desktop)
- **Backend & Database:** Firebase Firestore (real-time NoSQL database)
- **Authentication:** Firebase Google Auth (OAuth 2.0)
- **Styling:** Custom CSS with space theme, Orbitron font, responsive grid/flexbox layouts
- **Visualization:** Chart.js / Canvas API for the Orbit Visualizer
- **AI:** OpenAI API for the Honey AI Advisor

---

## 🔧 Backend Architecture

Hivesto's backend is fully powered by **Firebase**, handling all data operations securely and in real time.

### Firestore Data Model

```
firestore/
├── users/{uid}
│   ├── name, email, photoURL
│   ├── honeyScore: 0–100
│   └── createdAt
│
├── transactions/{auto-id}
│   ├── uid, label, amount
│   ├── type: "nectar" | "burn"
│   └── createdAt
│
└── goals/{auto-id}
    ├── uid, label
    ├── target, current
    └── createdAt
```

### Backend Features

- **Google OAuth 2.0** — Secure authentication via Firebase Auth. User profiles are auto-created in Firestore on first sign-in.
- **Firestore Security Rules** — All read/write operations are protected; only authenticated users can access data.
- **Real-time Data Sync** — Transactions and goals are fetched live from Firestore, ensuring data is always up to date across sessions.
- **Honey Score Engine** — A server-side calculated financial health metric derived from the user's income/expense ratio, stored and updated in Firestore on every transaction.
- **Goal Funding Logic** — Backend logic incrementally updates `current` balance on a goal document when the user adds funds, keeping progress accurate.
- **Per-user Data Isolation** — Every Firestore query is scoped with `where("uid", "==", user.uid)` ensuring users only ever see their own data.

---

## 📱 Responsive UI

Hivesto is designed to look and work great on **all screen sizes** — from mobile phones to large desktop monitors.

- **Fluid Layouts** — Dashboard cards and transaction lists reflow gracefully from single-column (mobile) to multi-column (desktop) using CSS Grid and Flexbox.
- **Responsive Orbit Visualizer** — The planet orbit chart scales dynamically based on viewport size using a relative sizing approach.
- **Mobile-first Navigation** — The nav collapses cleanly on smaller screens without losing functionality.
- **Touch-friendly Inputs** — All forms and buttons are optimized for tap targets on mobile devices.
- **Consistent Theming** — The deep space aesthetic, amber accents, and Orbitron font render consistently across all breakpoints.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 Google Auth | One-click sign in via Firebase OAuth, auto profile creation |
| 📊 Dashboard | Live summary of nectar, burn, net balance and Honey Score |
| 🪐 Orbit Visualizer | Animated planet-orbit chart for savings goals |
| 🤖 Honey AI Advisor | AI-powered financial tips based on your real data |
| 🎯 Goals Tracker | Add goals, fund them, watch your planets grow |
| 📱 Responsive UI | Fully optimized for mobile, tablet, and desktop |
| 🔒 Secure Backend | Firestore rules ensure per-user data protection |

---

## 🌐 Live Demo

[https://hivesto.vercel.app](https://hivesto.vercel.app)

---

## 👾 Team

Built in 60 minutes at a hackathon where the theme words were **Honey**, **Money**, and **Orbit**.

> *"Every dollar is a bee. Every goal is a flower. Keep them in orbit."*