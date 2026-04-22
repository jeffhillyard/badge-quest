# BadgeQuest

**An unofficial, mobile-friendly badge reference for Scouts Canada.**

> BadgeQuest is a tool created by a Scouter to help Scouts quickly explore badge requirements on any device. It is not affiliated with or endorsed by Scouts Canada.

---

## Features

- Mobile-first design - works great on phones at meetings and camps
- Browse and search badge requirements by category
- Fast, lightweight - no app install required
- Works in any modern browser

---

## Live Site

**[badgequest.pages.dev](https://badgequest.pages.dev)** 

---

## Project Structure

```
badge-quest/
├── index.html       # Main entry point
├── app.js           # Core application logic
├── styles.css       # Styling
└── data/            # Badge data files (JSON)
```

---

## Running Locally

No build step required — this is a plain static site.

1. Clone the repo:
   ```bash
   git clone https://github.com/jeffhillyard/badge-quest.git
   cd badge-quest
   ```

2. Open `index.html` directly in your browser, or use a simple local server:
   ```bash
   npx serve .
   # then visit http://localhost:3000
   ```

---

## Deployment (Cloudflare Pages)

BadgeQuest is hosted on **Cloudflare Pages**, which gives it a clean `pages.dev` URL and deploys automatically on every push to `main`.

---

## Data

Badge requirement data lives in the `/data` folder as JSON files. To update badge info, edit the relevant JSON file and push — Cloudflare Pages will redeploy automatically.

---

## Disclaimer

BadgeQuest is an unofficial tool. Always refer to the official [Scouts Canada](https://www.scouts.ca) website for authoritative badge requirements and program information.

---

## Contributing

Found an error in a badge requirement or want to suggest a feature? Feel free to [open an issue](https://github.com/jeffhillyard/badge-quest/issues) or submit a pull request!

---

*Made with ❤️ by a Scouter, for Scouts.*
