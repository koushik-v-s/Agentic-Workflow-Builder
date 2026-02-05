# Agentic Workflow Builder - Backend

Production-grade backend server for the Agentic Workflow Builder system.

## Features

- ✅ Workflow CRUD operations
- ✅ Multi-step workflow execution with LLM integration
- ✅ Rule-based and LLM-judge completion criteria
- ✅ Intelligent context passing between steps
- ✅ Automatic retry with exponential backoff
- ✅ Real-time progress tracking via WebSocket
- ✅ Cost and token usage tracking
- ✅ Execution history and detailed logging
- ✅ PostgreSQL database with Prisma ORM
- ✅ Redis for caching and queue management

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 15.0
- Redis >= 7.0

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
- Set `DATABASE_URL` for PostgreSQL
- Set `REDIS_URL` for Redis
- Set `UNBOUND_API_KEY` for LLM access
- Adjust other settings as needed

## Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with models
npm run seed
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Workflows
- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/:id` - Get workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/duplicate` - Duplicate workflow

### Steps
- `POST /api/workflows/:id/steps` - Add step
- `PUT /api/workflows/:id/steps/:stepId` - Update step
- `DELETE /api/workflows/:id/steps/:stepId` - Delete step
- `PUT /api/workflows/:id/steps/reorder` - Reorder steps

### Executions
- `POST /api/executions` - Start workflow execution
- `GET /api/executions/:id` - Get execution status
- `POST /api/executions/:id/cancel` - Cancel execution
- `GET /api/executions/:id/logs` - Get execution logs

### Models
- `GET /api/models` - List available LLM models
- `GET /api/models/:id` - Get model details

### History
- `GET /api/history/workflows/:workflowId` - Get workflow execution history

## WebSocket Events

Connect to `ws://localhost:5000` and listen for:

- `execution:progress` - Real-time execution updates
- `execution:update` - General execution updates

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
│   ├── llm/        # LLM integration
│   ├── criteria/   # Completion criteria evaluators
│   ├── execution/  # Workflow execution engine
│   └── workflow/   # Workflow management
├── types/          # TypeScript types
├── websocket/      # WebSocket server
└── server.ts       # Entry point
```

## License

MIT
