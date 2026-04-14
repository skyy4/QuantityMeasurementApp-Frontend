# QuantityMeasurementApp-Frontend (UC19 & UC20)

This repository contains the frontend implementation of the Quantity Measurement App.

It represents the frontend phase of the project flow:
- UC19: HTML/CSS/JS/AJAX style frontend behavior
- UC20: React frontend with routing, state, auth flow, and API integration

The backend, microservices, and deployment pipeline live in:
`https://github.com/skyy4/QuantityMeasurementApp`

## Actual Project Flow Alignment

1. UC1-UC18: Implemented in backend repository.
2. UC19-UC20: Implemented in this frontend repository.
3. UC21-UC22: Implemented back in backend repository (microservices + CI/CD/deployment).

## Tech Stack

- React + Vite
- React Router
- Axios
- Lucide React icons
- JWT-based login/register workflow with backend APIs

## Folder Structure

```text
QuantityMeasurementApp-Frontend/
|- src/
|  |- pages/            # Login and Dashboard views
|  |- config/           # API base URL
|  |- constants/        # Units and operations metadata
|  |- App.jsx
|  |- main.jsx
|- public/
|- package.json
```

## Setup

```bash
npm install
npm run dev
```

Default local URL (Vite): `http://localhost:5173`

## Environment

Copy `.env.example` and set your backend URL if required by your runtime configuration.
