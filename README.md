# My Nx Angular 21 Microfrontend Workspace

A minimal **Nx + Angular 21 + Module Federation** monorepo skeleton for microfrontend development.

This workspace includes:

- **Shell app** – main container with routing and shared services.
- **Portal library** – standalone microfrontend loaded by the shell via Module Federation.
- **Common library** – shared utilities and components.
- Fully compatible with **Angular 21**, **Nx 17**, and **Webpack 5 Module Federation**.

---

## 🛠️ Setup

Clone the repo and install dependencies:

```bash
git clone <your-repo-url>
cd my-nx-workspace
npm install