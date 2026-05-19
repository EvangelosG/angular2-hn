<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="React HN" title="React HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

---

:zap: **Fast:** Service Worker App Shell + Dynamic Content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** Built with Vite + PWA plugin for optimal performance.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for bundling and dev server
- **React Router v6** for routing (with lazy-loaded routes)
- **Vitest** + React Testing Library for unit tests
- **SCSS** for styling with theme engine
- **vite-plugin-pwa** + Workbox for service worker / offline support
- **Firebase Hosting** for deployment

## Mobile Preview

<p align="center">
  <img src = "http://i.imgur.com/ZloA1hn.gif">
</p>

## Laptop Preview

<p align="center">
  <img src = "http://i.imgur.com/MrKHaln.gif">
</p>

## Offline Support

This app uses [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) with Workbox to generate a service worker as part of the build step to load quickly and work offline.

## Manifest

With Chromium based browsers for Android (Chrome, Opera, etc...), React HN includes a Web App Manifest that allows you to install to your homescreen.

## Themes

Built in theme engine!

Current themes:
* Default
* Night
* Black (AMOLED)

More to come!

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 22+)
- npm 9+

### Development

```bash
# Clone the repo
git clone https://github.com/EvangelosG/angular2-hn.git
cd angular2-hn

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
npm run build
```

Output is in the `dist/` directory. The build includes:
- TypeScript type checking
- Vite production bundle
- Service worker generation via vite-plugin-pwa

### Preview Production Build

```bash
npm run preview
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Linting

```bash
npm run lint
```

## Firebase Deployment

The `firebase.json` is pre-configured to serve from the `dist/` directory with SPA routing rewrites.

```bash
firebase deploy
```

## Project Structure

```
src/
  components/       # React components
    Header/         # Navigation header
    Footer/         # Page footer
    Settings/       # Settings popup (theme, font, spacing)
    Feed/           # Story feed list
    Item/           # Individual story item
    ItemDetails/    # Story detail page with comments
    Comment/        # Recursive comment tree
    UserProfile/    # User profile page
    Loader/         # Loading indicator
    ErrorMessage/   # Error display with skull animation
  context/          # React Context providers
    SettingsContext  # Theme, font, spacing, link behavior
  services/         # API service layer
    hackernews-api  # HN API client (fetch-based)
  styles/           # Global SCSS (themes, variables, media queries)
  types/            # TypeScript interfaces
  utils/            # Utility functions
public/
  assets/           # Static assets (icons, images)
```

## Contributors

A million thanks to some awesome people :)

* [Ashwin Sureshkumar](https://github.com/ashwin-sureshkumar)
* [Mateusz](https://github.com/mateuszwitkowski)
* [Jordi Collell](https://github.com/jordic)
* [Ben Brooks](https://github.com/bbrks)
* [Zach Berger](https://github.com/zachberger)
* [blAck PR](https://github.com/blackpr)
* [Bram Borggreve](https://github.com/beeman)
* [Antonio Indrianjafy](https://github.com/Antogin)
* [Addy Osmani](https://github.com/addyosmani)
* [Majid Hajian](https://github.com/mhadaily)
* [Jeff Cross](https://github.com/jeffbcross)
* [Minko Gechev](https://github.com/mgechev)
