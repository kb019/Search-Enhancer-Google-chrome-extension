# Google Search Prompt Enhancer Extension

Chrome extension that adds a prompt-enhancer button to the Google Search box and rewrites basic queries into more advanced Google searches using the Cerebras API.

## What It Does

- Injects a small enhancer icon into the Google Search input on `https://www.google.com/*`
- Sends the current query to the Cerebras API
- Rewrites the query with more targeted Google search operators such as quotes, `site:`, `filetype:`, `intitle:`, `inurl:`, `OR`, and exclusions
- Optionally asks follow-up questions in a shadow-root modal when clarification would help
- Applies the refined query back into the Google search box

## How It Works

- Main entry point: [src/scripts/content.js](/C:/Users/96110/Documents/Projects/personal_projects/Google-Search-Extension/src/scripts/content.js)
- Shadow-root modal template and inline styles: [src/templates.js](/C:/Users/96110/Documents/Projects/personal_projects/Google-Search-Extension/src/templates.js)
- Search-icon styles: [styles/content.css](/C:/Users/96110/Documents/Projects/personal_projects/Google-Search-Extension/styles/content.css)
- Bundled output loaded by the extension: [dist/content.bundle.js](/C:/Users/96110/Documents/Projects/personal_projects/Google-Search-Extension/dist/content.bundle.js)

The build uses Webpack and injects environment variables from `.env` into the bundled content script.

## Requirements

- Node.js 18+
- npm
- A Cerebras API key

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file from [.env.example](/C:/Users/96110/Documents/Projects/personal_projects/Google-Search-Extension/.env.example):

```bash
copy .env.example .env
```

3. Add your API key to `.env`:

```env
CEREBRAS_API_KEY=your_key_here
```

## Build

Build the extension bundle:

```bash
npm run build
```

This produces `dist/content.bundle.js`, which is referenced by [manifest.json](/C:/Users/96110/Documents/Projects/personal_projects/Google-Search-Extension/manifest.json).

## Load In Chrome

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select this project folder
5. Rebuild and reload the extension after source changes

## Available Scripts

- `npm run build` builds the content script bundle
- `npm run format` formats the repo with Prettier
- `npm run format:check` checks formatting without writing changes
- `npm run prepare` installs Husky hooks

## Git Hooks

This project uses Husky and lint-staged.

- Pre-commit hook: [/.husky/pre-commit](/C:/Users/96110/Documents/Projects/personal_projects/Google-Search-Extension/.husky/pre-commit)
- Staged JS files are checked for `console.log(...)`
- Staged `js`, `json`, `css`, and `md` files are formatted with Prettier

The `console.log` guard lives in [scripts/check-no-console-log.js](/C:/Users/96110/Documents/Projects/personal_projects/Google-Search-Extension/scripts/check-no-console-log.js).
