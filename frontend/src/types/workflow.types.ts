export interface Workflow {
    id: string;
    name: string;
    description?: string;
    userId?: string;
    retryBudget: number;
    costBudget?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    steps?: WorkflowStep[];
    executions?: WorkflowExecution[];
    _count?: {
        executions: number;
    };
}

export interface WorkflowStep {
    id: string;
    workflowId: string;
    stepOrder: number;
    name: string;
    modelId: string;
    promptTemplate: string;
    completionCriteria: CompletionCriteria;
    retryLimit: number;
    contextMode: 'full' | 'summary' | 'selective' | 'custom';
    contextSelector?: string;
    createdAt: string;
    updatedAt: string;
}

export type CompletionCriteria =
    | RuleCriteria
    | LLMJudgeCriteria
    | HybridCriteria;

export interface RuleCriteria {
    type: 'rule';
    rules: Rule[];
    logic: 'AND' | 'OR';
}

export interface Rule {
    type: 'contains' | 'notContains' | 'regex' | 'minLength' | 'maxLength' | 'validJSON' | 'validCode' | 'hasCodeBlock';
    value?: string | number;
    pattern?: string;
    language?: string;
    caseSensitive?: boolean;
}

export interface LLMJudgeCriteria {
    type: 'llm_judge';
    judgeModel: string;
    judgePrompt: string;
    passKeywords?: string[];
    failKeywords?: string[];
}

export interface HybridCriteria {
    type: 'hybrid';
    primary: CompletionCriteria;
    fallback: CompletionCriteria;
}

export interface WorkflowExecution {
    id: string;
    workflowId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    startedAt: string;
    completedAt?: string;
    totalCost: number;
    totalTokens: number;
    errorMessage?: string;
    metadata?: any;
    workflow?: Workflow;
    stepExecutions?: StepExecution[];
    _count?: {
        stepExecutions: number;
    };
}

export interface StepExecution {
    id: string;
    executionId: string;
    stepId: string;
    stepOrder: number;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
    promptSent: string;
    responseReceived?: string;
    contextUsed?: string;
    completionCheck?: any;
    retryCount: number;
    startedAt?: string;
    completedAt?: string;
    cost?: number;
    tokensUsed?: number;
    errorMessage?: string;
    step?: WorkflowStep;
}

export interface Model {
    id: string;
    provider: string;
    displayName: string;
    costPer1kInput: number;
    costPer1kOutput: number;
    contextWindow: number;
    isAvailable: boolean;
    capabilities?: any;
}

export interface ExecutionProgress {
    executionId: string;
    status: string;
    currentStep?: number;
    totalSteps: number;
    completedSteps: number;
    totalCost: number;
    totalTokens: number;
    error?: string;
}
