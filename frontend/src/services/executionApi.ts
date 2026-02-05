import api from './api';
import { WorkflowExecution } from '../types/workflow.types';

export const executionApi = {
    // Start execution
    start: async (workflowId: string, metadata?: any) => {
        const response = await api.post<{ success: boolean; data: WorkflowExecution }>('/executions', {
            workflowId,
            metadata,
        });
        return response.data.data;
    },

    // Get execution status
    getStatus: async (id: string) => {
        const response = await api.get<{ success: boolean; data: WorkflowExecution }>(`/executions/${id}`);
        return response.data.data;
    },

    // Cancel execution
    cancel: async (id: string) => {
        const response = await api.post<{ success: boolean; data: WorkflowExecution }>(`/executions/${id}/cancel`);
        return response.data.data;
    },

    // Get execution logs
    getLogs: async (id: string) => {
        const response = await api.get<{ success: boolean; data: WorkflowExecution }>(`/executions/${id}/logs`);
        return response.data.data;
    },

    // Get workflow execution history
    getHistory: async (workflowId: string) => {
        const response = await api.get<{ success: boolean; data: WorkflowExecution[] }>(
            `/history/workflows/${workflowId}`
        );
        return response.data.data;
    },
};
