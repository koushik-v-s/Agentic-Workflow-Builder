# Agentic Workflow Builder Frontend

Modern React frontend for the Agentic Workflow Builder.

## Features

- 🎨 Beautiful dark theme with glass morphism
- ⚡ Real-time execution tracking
- 📊 Interactive workflow builder
- 💰 Cost and token tracking
- 📈 Execution history and analytics

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Query (data fetching)
- Socket.io (WebSocket)
- React Router (navigation)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom hooks
├── pages/          # Route pages
├── services/       # API clients
├── styles/         # Global styles
└── types/          # TypeScript types
```

## License

MIT
