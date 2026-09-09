# FoxURL

FoxURL is a small static site that serves as a central hub for Fox apps, tools and utilities (Wordle solver, Cat Feeding, Simple Scoring, and more).

This repo powers the GitHub Pages site and includes a lightweight UI with a frosted, liquid-glass theme and a small client-side recent-apps tracker using `localStorage`.

Quick links
- Live site: https://foxurl.github.io

Features
- Central index of Fox apps in `apps/`
- Frosted glass UI in `style.css` with layered hover separation
- Recent-launch tracking stored under `foxurlRecentApps` in browser `localStorage`

Local preview
1. Serve the folder (recommended) from the repository root:

```bash
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

2. Or open `index.html` directly in a browser (some features may require a web server).

Development notes
- Add new apps under the `apps/` folder and link them from `index.html` or update `script.js` routes.
- UI styles are in `style.css`. The liquid glass hover effect uses layered pseudo-elements for depth.
- Recent-app logic is in `script.js` (key: `foxurlRecentApps`, keeps last 2 unique apps).

Deployment
- This repo is ready for GitHub Pages. Push to the `main` branch and enable Pages in repository settings (root `/`).

Contributing
- Pull requests welcome. Keep changes focused and include screenshots for visual updates.

License
- See the `LICENSE` file in this repository.

Contact
- Open an issue or PR for any questions or feature ideas.
