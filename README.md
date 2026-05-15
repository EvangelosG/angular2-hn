<p align="center">
  <img alt="React HN" title="React HN" src="http://i.imgur.com/J303pQ4.png" width="150">
</p>

<p align="center">
  A progressive Hacker News client built with React, TypeScript, and Vite
</p>

---

:zap: **Fast:** Vite-powered dev/build + PWA service worker for instant loads and offline support.

:iphone: **Responsive:** Fully responsive UI that can be installed to your mobile home screen.

:rocket: **Progressive:** PWA with service worker caching, installability, and offline support.

## Tech Stack

- **React 19** with TypeScript
- **React Router v7** for client-side routing with lazy-loaded routes
- **Vite** for dev server and production builds
- **vite-plugin-pwa** for service worker generation and PWA support
- **SCSS** with a theme engine (Default, Night, AMOLED Black)
- **Google Analytics** for page view tracking

## Features

- Browse Hacker News feeds: Top, New, Show, Ask, Jobs
- View item details with nested comment threads
- User profiles
- Theming: Default, Night, and Black (AMOLED) themes
- Customizable font size and list spacing
- PWA: installable, works offline
- Responsive: mobile-first design

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── api/             # API service (HN PWA API)
├── components/
│   ├── layout/      # AppLayout, Header, Footer, Settings
│   ├── feeds/       # FeedItem component
│   ├── item-details/# Comment component
│   └── shared/      # Loader, ErrorMessage
├── context/         # SettingsContext (theme, preferences)
├── pages/           # FeedPage, ItemDetailsPage, UserPage
├── styles/          # Global SCSS, themes, variables
├── types/           # TypeScript interfaces
├── utils/           # Utility functions
├── router.tsx       # React Router configuration
└── main.tsx         # App entry point
```

## Themes

Built-in theme engine with:
- Default (light)
- Night (dark)
- Black (AMOLED)

Supports `prefers-color-scheme: dark` media query for automatic theme detection.

## API

Uses the [HN PWA API](https://api.hnpwa.com/) (`https://api.hnpwa.com/v0/`) for fetching stories, comments, and user data.

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
