# OTT Weekly Releases - Deployment Guide

This document explains how to set up GitHub Secrets and deploy the OTT Weekly Releases application.

## Prerequisites

1. A GitHub repository (public or private)
2. A Perplexity API key ([get one here](https://www.perplexity.ai/settings/api))
3. GitHub Pages enabled for your repository

## Setting Up GitHub Secrets

The application requires the `PERPLEXITY_API_KEY` secret to fetch OTT release data.

### Step-by-Step Instructions

1. **Navigate to Repository Settings**
   - Go to your repository on GitHub
   - Click the "Settings" tab
   - In the left sidebar, click "Secrets and variables" → "Actions"

2. **Add the API Key Secret**
   - Click "New repository secret"
   - Set the **Name** to: `PERPLEXITY_API_KEY`
   - Set the **Value** to your Perplexity API key (starts with `pplx-`)
   - Click "Add secret"

3. **Verify the Secret**
   - The secret should now appear in the list as `PERPLEXITY_API_KEY`
   - The value is hidden and cannot be viewed after creation

## Local Development

For local development, create a `.env` file:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API key
# PERPLEXITY_API_KEY=pplx-your-actual-api-key
```

The `.env` file is gitignored and will never be committed.

### Running Locally

```bash
# Install dependencies
npm install

# Fetch OTT releases manually
node scripts/fetch-releases.js

# Run tests
npm test
```

## GitHub Actions Workflow

The daily update workflow (`daily-update.yml`) runs automatically at 9 AM UTC and:

1. Checks out the repository
2. Sets up Node.js
3. Installs dependencies
4. Runs `scripts/fetch-releases.js` with the `PERPLEXITY_API_KEY`
5. Commits and pushes any data changes

### Manual Trigger

You can also trigger the workflow manually:

1. Go to the "Actions" tab in your repository
2. Select "Daily OTT Releases Update"
3. Click "Run workflow"
4. Optionally check "Force update" to bypass cache

## Troubleshooting

### Workflow Fails with "API key not found"

- Ensure the secret name is exactly `PERPLEXITY_API_KEY` (case-sensitive)
- Verify the secret is set in the correct repository

### Data Not Updating

- Check the workflow run logs in the Actions tab
- Ensure the API key is valid and not expired
- Verify the cache isn't preventing updates (use Force Update)

### Rate Limiting

- The workflow runs once per day to minimize API costs
- Cache is valid for 24 hours
- Manual triggers respect the cache unless Force Update is checked
