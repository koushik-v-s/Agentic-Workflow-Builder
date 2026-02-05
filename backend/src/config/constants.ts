export const APP_CONFIG = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    WS_PORT: parseInt(process.env.WS_PORT || '5001', 10),
    HOST: process.env.HOST || 'localhost',
    NODE_ENV: process.env.NODE_ENV || 'development',
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
};

export const EXECUTION_CONFIG = {
    MAX_CONCURRENT_EXECUTIONS: parseInt(process.env.MAX_CONCURRENT_EXECUTIONS || '5', 10),
    DEFAULT_RETRY_LIMIT: parseInt(process.env.DEFAULT_RETRY_LIMIT || '3', 10),
    DEFAULT_TIMEOUT_MS: parseInt(process.env.DEFAULT_TIMEOUT_MS || '300000', 10),
    RETRY_BACKOFF_BASE_MS: 1000,
};

export const COST_CONFIG = {
    DEFAULT_WORKFLOW_COST_BUDGET: parseFloat(process.env.DEFAULT_WORKFLOW_COST_BUDGET || '10.00'),
    DEFAULT_STEP_COST_BUDGET: parseFloat(process.env.DEFAULT_STEP_COST_BUDGET || '5.00'),
};

export const UNBOUND_CONFIG = {
    API_KEY: process.env.UNBOUND_API_KEY || 'c87829d8a0dd941e60fa2a2e265728f039534d4061b36f6a572159678eab3bca8829550ada87bc4f496d150dc4d0420a',
    API_URL: process.env.UNBOUND_API_URL || 'https://api.getunbound.ai/v1',
}


export const STATUS = {
    WORKFLOW_EXECUTION: {
        PENDING: 'pending',
        RUNNING: 'running',
        COMPLETED: 'completed',
        FAILED: 'failed',
        CANCELLED: 'cancelled',
    },
    STEP_EXECUTION: {
        PENDING: 'pending',
        RUNNING: 'running',
        COMPLETED: 'completed',
        FAILED: 'failed',
        RETRYING: 'retrying',
    },
};

export const CONTEXT_MODES = {
    FULL: 'full',
    SUMMARY: 'summary',
    SELECTIVE: 'selective',
    CUSTOM: 'custom',
};

export const CRITERIA_TYPES = {
    RULE: 'rule',
    LLM_JUDGE: 'llm_judge',
    HYBRID: 'hybrid',
};
