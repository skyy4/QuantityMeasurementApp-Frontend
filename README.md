# QuantityMeasurementApp-Frontend

This log documents the frontend-side progress of the Quantity Measurement App development, covering the user interface, API integration, authentication flow, responsive design, and deployment work completed in this repository.

## Frontend Overview

This repository contains the React frontend for the Quantity Measurement App.

- Built with React and Vite
- Connects to the Spring Boot backend hosted separately
- Supports login, registration, JWT-based session handling, and quantity conversion workflows
- Designed for deployment as a static site on Render

## Deployment Notes

The frontend is configured for deployment on Render as a static site.

### Current behavior in this repo

- Uses `HashRouter` so static hosting does not require server-side route rewrites
- Reads the backend base URL from `VITE_API_BASE_URL`
- Works with the deployed backend and PostgreSQL-backed authentication flow

### Required environment variable

```env
VITE_API_BASE_URL=https://qma-backend.onrender.com
```

### Local development

Install dependencies and start the Vite dev server:

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
```

## Folder Structure

The repository is organized using a standard Vite + React frontend structure.

Currently, the application code resides in the **src** directory, static assets reside in **public**, and project configuration is managed through Vite and ESLint files.

```text
QuantityMeasurementApp-Frontend/
|
+-- public/             (Static assets)
|
+-- src/                (Application code)
|   |
|   +-- pages/          (Login and Dashboard views)
|   +-- constants/      (Frontend constants and unit mappings)
|
+-- index.html
|
+-- package.json
|
+-- vite.config.js
|
+-- README.md
```

## Frontend Progress Log
**UI Development, API Integration, and Deployment**

*   **31-Mar-2026 (Tuesday):** Set up the React frontend foundation for the Quantity Measurement App using Vite. Established the application structure, routing, form handling, and API communication layer required for authentication and quantity conversion workflows.

*   **01-Apr-2026 (Wednesday):** Implemented the login and registration interface, connected the frontend to backend authentication endpoints, and added token persistence using `localStorage` so authenticated users can access the dashboard after sign-in.

*   **02-Apr-2026 (Thursday):** Built the main quantity conversion dashboard with support for measurement type switching, unit selection, conversion submission, and recent activity tracking. Added responsive layout behavior for desktop and mobile usage.

*   **03-Apr-2026 (Friday):** Fixed frontend authentication error handling so backend error objects no longer crash React rendering. Updated routing for Render static hosting by switching to hash-based navigation and aligned the UI with the deployed backend authentication flow.

*   **04-Apr-2026 (Saturday):** Redesigned the frontend with a cleaner premium interface focused on spacing precision, strong typography, Swiss-grid inspired layout, Lucide iconography, and improved interactive feedback for forms and controls. Verified production readiness with successful Vite build output.

## UC Mapping For This Repo

- `UC19`: HTML, CSS, JavaScript, and AJAX based frontend concepts are represented through form handling, DOM-driven UI updates, API requests, responsive styling, and client-side interaction logic.
- `UC20`: React frontend implementation is covered through component-based design, state management, controlled inputs, routing, authentication flow, Axios-based service calls, and responsive UI behavior.
- `UC22`: Frontend deployment support is covered through Vite production builds, Docker/Render-compatible deployment flow, and integration with the deployed backend service.

## Status Summary

- Backend domain and service logic are maintained in the backend repository.
- This repository focuses on frontend delivery, integration, and deployment readiness.
- The frontend is deployed and connected to the live backend environment.
