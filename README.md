# OTT Weekly Releases

A lightweight static web application that displays weekly OTT streaming platform releases in a blog post format with automated daily updates via Perplexity API and GitHub Actions.

🔗 **[Live Demo](https://chaitanyame.github.io/ott_news/)**

## Features

- 📺 Weekly releases from 8 major streaming platforms:
  - Netflix, Prime Video, Disney+, Hulu, Apple TV+, Max, Paramount+, Peacock
- 🔄 Automated daily updates via GitHub Actions (9 AM UTC)
- 📦 Zero dependencies - vanilla HTML, CSS, JavaScript
- ⚡ Fast loading with inlined critical CSS
- 📱 Responsive design for mobile, tablet, and desktop
- ♿ Accessible with ARIA attributes and skip navigation
- 🗂️ Archive navigation with hash-based routing
- 🔗 Shareable URLs for specific weeks

## Getting Started

### Prerequisites

- Node.js 18+
- A Perplexity API key

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/chaitanyame/ott_news.git
   cd ott_news
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your PERPLEXITY_API_KEY
   ```

4. Start a local server:
   ```bash
   npx http-server . -p 3000
   ```

5. Open http://localhost:3000 in your browser.

### Running Tests

```bash
# Run all Playwright tests
npx playwright test

# Run tests for a specific browser
npx playwright test --project=chromium

# Run tests with UI mode
npx playwright test --ui
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PERPLEXITY_API_KEY` | API key for Perplexity AI | Yes |

### GitHub Secrets

For automated updates, add the following secret to your repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `PERPLEXITY_API_KEY`
4. Value: Your Perplexity API key

## Deployment

### GitHub Pages

1. Go to **Settings** → **Pages**
2. Source: Deploy from a branch
3. Branch: `main` (or your default branch)
4. Folder: `/ (root)`
5. Click **Save**

The site will be available at `https://{username}.github.io/ott_news/`

## Project Structure

```
ott_news/
├── index.html              # Main HTML file
├── assets/
│   ├── css/main.css       # Styles with CSS variables
│   ├── js/app.js          # Main application logic
│   └── images/logos/      # Platform logos
├── data/
│   ├── current-week.json  # Current week's releases
│   ├── archive/           # Archived weekly data
│   └── archive-index.json # Archive navigation index
├── scripts/
│   ├── fetch-releases.js  # API data fetcher
│   └── utils/             # Utility modules
├── tests/
│   ├── features/          # E2E Playwright tests
│   └── build/             # Unit tests
└── .github/
    └── workflows/
        └── daily-update.yml # Automated update workflow
```

## API Usage

This project uses the Perplexity API with the `sonar` model for fetching release data. The API is called once daily by the GitHub Actions workflow, keeping costs minimal.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Anthropic's Agent Harness Framework](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- Data powered by [Perplexity AI](https://www.perplexity.ai/)
