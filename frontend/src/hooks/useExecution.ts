import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { executionApi } from '../services/executionApi';
import toast from 'react-hot-toast';

export function useExecution(id: string | undefined) {
    return useQuery({
        queryKey: ['executions', id],
        queryFn: () => executionApi.getStatus(id!),
        enabled: !!id,
        refetchInterval: (data) => {
            // Stop polling if execution is completed/failed/cancelled
            if (data && ['completed', 'failed', 'cancelled'].includes(data.status)) {
                return false;
            }
            return 2000; // Poll every 2 seconds
        },
    });
}

export function useStartExecution() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workflowId, metadata }: { workflowId: string; metadata?: any }) =>
            executionApi.start(workflowId, metadata),
        onSuccess: () => {
            toast.success(' Workflow execution started');
        },
        onError: (error: Error) => {
            toast.error(`Failed to start execution: ${error.message}`);
        },
    });
}

export function useCancelExecution() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: executionApi.cancel,
        onSuccess: (_, executionId) => {
            queryClient.invalidateQueries({ queryKey: ['executions', executionId] });
            toast.success('Execution cancelled');
        },
        onError: (error: Error) => {
            toast.error(`Failed to cancel execution: ${error.message}`);
        },
    });
}

export function useExecutionHistory(workflowId: string | undefined) {
    return useQuery({
        queryKey: ['executions', 'history', workflowId],
        queryFn: () => executionApi.getHistory(workflowId!),
        enabled: !!workflowId,
    });
}
