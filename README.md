
# Agentic Workflow Builder

<div align="center">

**Build intelligent multi-step AI workflows with ease**

A production-grade system for creating and executing multi-step LLM agent workflows with real-time monitoring.

[Features](#features) • [Tech Stack](#tech-stack) • [Setup](#setup) • [Usage](#usage) • [Architecture](#architecture)

</div>

---

## 🌟 Features

### Core Functionality
- ✨ **Visual Workflow Builder** - Create multi-step AI workflows with an intuitive interface
- 🤖 **Multi-LLM Support** - Choose from GPT-4, GPT-3.5, Claude 3 models, and more
- ✅ **Smart Completion Criteria** - Rule-based and LLM-judge evaluation systems
- 🔄 **Automatic Retry Logic** - Exponential backoff with configurable retry budgets
- 💬 **Context Passing** - Intelligent context extraction and injection between steps
- 📊 **Real-time Monitoring** - WebSocket-powered live execution tracking
- 💰 **Cost Tracking** - Monitor token usage and costs per execution
- 📜 **Execution History** - Complete audit trail of all workflow runs

### Advanced Features
- 🎯 **Budget Management** - Set cost caps and retry limits
- 🔍 **Criteria Types**: Contains, Regex, JSON validation, Code validation, LLM-as-judge
- 📦 **Context Modes**: Full, Summary, Selective, Custom extraction
- 🎨 **Beautiful UI** - Modern dark theme with glass morphism effects
- ⚡ **Real-time Updates** - Live progress bars and step-by-step tracking

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 20+ with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL 15+ with Prisma ORM
- **Cache/Queue:** Redis 7+
- **Real-time:** Socket.io WebSockets
- **Validation:** Zod

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with custom theme
- **State:** React Query + Zustand
- **Router:** React Router v6
- **Icons:** Lucide React

---

## 🚀 Quick Start

### Prerequisites
```bash
# Required software
Node.js >= 20.0.0
PostgreSQL >= 15.0
Redis >= 7.0
```

### 1. Clone & Install
```bash
cd "C:\Users\Koushik V S\.gemini\antigravity\scratch\agentic-workflow-builder"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup
```bash
# Create database
psql -U postgres
CREATE DATABASE agentic_workflow;
\q

# Run backend migrations
cd backend
npx prisma migrate dev --name init
npx prisma generate
npm run seed
```

### 3. Configure Environment

**backend/.env:**
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/agentic_workflow?schema=public"
REDIS_URL="redis://localhost:6379"
UNBOUND_API_KEY="your_api_key_here"
PORT=5000
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

### 4. Start Services

**Terminal 1 - Redis:**
```bash
# Windows (WSL)
wsl
sudo service redis-server start

# Or Windows Redis
redis-server
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Open Application
Visit: **http://localhost:5173**

---

## 📖 Usage Guide

### Creating a Workflow

1. Click **"Create Workflow"** on the dashboard
2. Enter workflow name and description
3. Set retry budget and cost budget (optional)
4. Click **"Save Workflow"**

### Adding Steps

1. Open a workflow in edit mode
2. Click **"Add Step"**
3. Configure:
   - **Name**: Describe the step
   - **Model**: Choose LLM (GPT-4, Claude, etc.)
   - **Prompt**: What the AI should do
   - **Completion Criteria**: How to verify success
   - **Context Mode**: How to pass output to next step

### Completion Criteria Examples

**Rule-Based:**
```json
{
  "type": "rule",
  "rules": [
    { "type": "contains", "value": "SUCCESS" },
    { "type": "minLength", "value": 100 }
  ],
  "logic": "AND"
}
```

**LLM Judge:**
```json
{
  "type": "llm_judge",
  "judgeModel": "gpt-3.5-turbo",
  "judgePrompt": "Does this response contain valid Python code? Answer YES or NO.",
  "passKeywords": ["YES"]
}
```

### Running a Workflow

1. Go to workflow page
2. Click **"Run"** on desired workflow
3. Watch real-time execution progress
4. View step-by-step results
5. Check final cost and token usage

---

## 🏗️ Project Structure

```
agentic-workflow-builder/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # API endpoints
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   │   ├── llm/        # LLM integration
│   │   │   ├── criteria/   # Completion evaluators
│   │   │   ├── execution/  # Workflow engine
│   │   │   └── workflow/   # Workflow management
│   │   ├── types/          # TypeScript types
│   │   └── websocket/      # Socket.io server
│   ├── prisma/             # Database schema
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API clients
│   │   ├── styles/         # Global styles
│   │   └── types/          # TypeScript types
│   └── package.json
│
└── SETUP.md               # Detailed setup guide
```

---

## 🎯 Key Concepts

### Workflow Execution Flow
1. User triggers workflow
2. System executes Step 1 → calls LLM
3. Evaluates response against completion criteria
4. If passed → extract context → move to Step 2
5. If failed → retry with backoff
6. Repeat until all steps complete or failure

### Context Passing
- **Full**: Pass entire previous output
- **Summary**: Auto-summarize long outputs
- **Selective**: Extract code blocks, JSON, etc.
- **Custom**: User-defined regex/JSONPath

### Completion Criteria
- **Rule-based**: Fast, deterministic checks
- **LLM-judge**: Intelligent evaluation using another LLM
- **Hybrid**: Combine both approaches

---

## 🔌 API Endpoints

### Workflows
```
GET    /api/workflows          - List all workflows
POST   /api/workflows          - Create workflow
GET    /api/workflows/:id      - Get workflow
PUT    /api/workflows/:id      - Update workflow
DELETE /api/workflows/:id      - Delete workflow
POST   /api/workflows/:id/duplicate - Duplicate workflow
```

### Executions
```
POST   /api/executions         - Start execution
GET    /api/executions/:id     - Get status
POST   /api/executions/:id/cancel - Cancel execution
GET    /api/executions/:id/logs - Get detailed logs
```

### Models
```
GET    /api/models             - List available LLM models
GET    /api/models/:id         - Get model details
```

---

## 🎨 UI Highlights

- **Dark Theme** with purple/pink gradients
- **Glass Morphism** effects throughout
- **Real-time Progress** with animated step timeline
- **Responsive Design** for all screen sizes
- **Smooth Animations** and transitions
- **Toast Notifications** for user feedback

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

---

## 📊 Example Workflow

**Task:** Create a Python calculator

**Step 1:** Generate Code
- Model: `gpt-4-turbo`
- Prompt: "Write a Python calculator with add, subtract, multiply, divide functions"
- Criteria: Contains `def`, valid Python code

**Step 2:** Add Documentation
- Model: `gpt-3.5-turbo`
- Prompt: "Add docstrings to this code: {{previous_output}}"
- Criteria: Contains `"""`, minimum 200 characters

**Step 3:** Create Tests
- Model: `gpt-4-turbo`
- Prompt: "Write pytest tests for: {{previous_output}}"
- Criteria: Contains `def test_`, valid Python

---

## 🚧 Roadmap / Bonus Features

- [ ] Workflow export/import (JSON/YAML)
- [ ] Email/Slack/Discord notifications
- [ ] Auto model selection based on task
- [ ] Parallel step execution
- [ ] Branching workflows (conditional paths)
- [ ] Manual approval gates
- [ ] Workflow templates library
- [ ] Chrome extension for quick workflows

---

## 📝 License

MIT License - feel free to use this project!

---

## 🙏 Credits

Built with ❤️ using:
- React, Express, PostgreSQL
- Prisma, Socket.io, TailwindCSS
- And many other amazing open-source libraries

---

## 📞 Support

For detailed setup instructions, see **[SETUP.md](./SETUP.md)**

For questions or issues, check the:
- Backend logs: `backend/logs/`
- Browser console (F12)
- Database: `npx prisma studio`

---

**🎉 Happy Workflow Building!**
>>>>>>> 2844d62 (done)
