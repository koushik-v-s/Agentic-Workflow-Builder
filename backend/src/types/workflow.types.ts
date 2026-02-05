import { z } from 'zod';

// Workflow schemas
export const CreateWorkflowSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    retryBudget: z.number().int().min(0).default(3),
    costBudget: z.number().positive().optional(),
});

export const UpdateWorkflowSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    retryBudget: z.number().int().min(0).optional(),
    costBudget: z.number().positive().optional(),
    isActive: z.boolean().optional(),
});

// Step schemas
export const CompletionCriteriaSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('rule'),
        rules: z.array(
            z.object({
                type: z.enum([
                    'contains',
                    'notContains',
                    'regex',
                    'minLength',
                    'maxLength',
                    'validJSON',
                    'validCode',
                    'hasCodeBlock',
                ]),
                value: z.union([z.string(), z.number()]).optional(),
                pattern: z.string().optional(),
                language: z.string().optional(),
                caseSensitive: z.boolean().optional(),
            })
        ),
        logic: z.enum(['AND', 'OR']).default('AND'),
    }),
    z.object({
        type: z.literal('llm_judge'),
        judgeModel: z.string(),
        judgePrompt: z.string(),
        passKeywords: z.array(z.string()).optional(),
        failKeywords: z.array(z.string()).optional(),
    }),
    z.object({
        type: z.literal('hybrid'),
        primary: z.any(),
        fallback: z.any(),
    }),
]);

export const CreateStepSchema = z.object({
    stepOrder: z.number().int().positive(),
    name: z.string().min(1, 'Step name is required'),
    modelId: z.string().min(1, 'Model is required'),
    promptTemplate: z.string().min(1, 'Prompt template is required'),
    completionCriteria: CompletionCriteriaSchema,
    retryLimit: z.number().int().min(0).default(3),
    contextMode: z.enum(['full', 'summary', 'selective', 'custom']).default('full'),
    contextSelector: z.string().optional(),
});

export const UpdateStepSchema = CreateStepSchema.partial();

// Execution schemas
export const StartExecutionSchema = z.object({
    workflowId: z.string().uuid(),
    metadata: z.record(z.any()).optional(),
});

export type CreateWorkflowInput = z.infer<typeof CreateWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof UpdateWorkflowSchema>;
export type CreateStepInput = z.infer<typeof CreateStepSchema>;
export type UpdateStepInput = z.infer<typeof UpdateStepSchema>;
export type CompletionCriteria = z.infer<typeof CompletionCriteriaSchema>;
export type StartExecutionInput = z.infer<typeof StartExecutionSchema>;
