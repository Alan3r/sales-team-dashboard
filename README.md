# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e76dd7ac-d28b-4f27-9ae5-91d8b3652c5d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e76dd7ac-d28b-4f27-9ae5-91d8b3652c5d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e76dd7ac-d28b-4f27-9ae5-91d8b3652c5d) and click on Share -> Publish.

### Publish on GitHub Pages (new)

This repo is pre-configured to publish your site to GitHub Pages using a GitHub Actions workflow.

1. Push your changes to the `main` branch.
2. The workflow at `.github/workflows/deploy-pages.yml` runs on `push` to `main`, builds the app, and deploys the `dist/` directory to the `gh-pages` branch using `peaceiris/actions-gh-pages@v3`.
3. Your site will be available at: `https://OGMAN4324.github.io/sales-team-dashboard/`.

Local deploy: If you prefer to deploy locally, you can use `npm run deploy`—this uses the `gh-pages` npm package to publish the `dist` directory to the `gh-pages` branch.

Note: The workflow uses `peaceiris/actions-gh-pages@v3` to publish directly to `gh-pages` (avoiding deprecated `upload-artifact` steps).

Note: The Vite config includes a `base` set to `/sales-team-dashboard/` at build time — if you rename your repo, update `vite.config.ts` or replace the `base` accordingly.

### SPA routing note

If your app uses React Router with `BrowserRouter`, refreshing pages or navigating directly to nested routes may return 404 on GitHub Pages. To avoid this, either:

- Use `HashRouter` from `react-router-dom` (i.e., `import { HashRouter } from 'react-router-dom'`) to keep the URL functional.
- Or add a `404.html` that contains a redirect to `index.html` (some people use a client-side redirect in `404.html`), but the simplest and most reliable fix is to use `HashRouter`.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
