import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../services/workflowApi';
import { Workflow, WorkflowStep } from '../types/workflow.types';
import toast from 'react-hot-toast';

export function useWorkflows() {
    return useQuery({
        queryKey: ['workflows'],
        queryFn: workflowApi.getAll,
    });
}

export function useWorkflow(id: string | undefined) {
    return useQuery({
        queryKey: ['workflows', id],
        queryFn: () => workflowApi.getById(id!),
        enabled: !!id,
    });
}

export function useCreateWorkflow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: workflowApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
            toast.success('Workflow created successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to create workflow: ${error.message}`);
        },
    });
}

export function useUpdateWorkflow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Workflow> }) =>
            workflowApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
            queryClient.invalidateQueries({ queryKey: ['workflows', variables.id] });
            toast.success('Workflow updated successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to update workflow: ${error.message}`);
        },
    });
}

export function useDeleteWorkflow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: workflowApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
            toast.success('Workflow deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete workflow: ${error.message}`);
        },
    });
}

export function useDuplicateWorkflow() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: workflowApi.duplicate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
            toast.success('Workflow duplicated successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to duplicate workflow: ${error.message}`);
        },
    });
}

export function useCreateStep() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workflowId, data }: { workflowId: string; data: Partial<WorkflowStep> }) =>
            workflowApi.createStep(workflowId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['workflows', variables.workflowId] });
            toast.success('Step added successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to add step: ${error.message}`);
        },
    });
}

export function useUpdateStep() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            workflowId,
            stepId,
            data,
        }: {
            workflowId: string;
            stepId: string;
            data: Partial<WorkflowStep>;
        }) => workflowApi.updateStep(workflowId, stepId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['workflows', variables.workflowId] });
            toast.success('Step updated successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to update step: ${error.message}`);
        },
    });
}

export function useDeleteStep() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workflowId, stepId }: { workflowId: string; stepId: string }) =>
            workflowApi.deleteStep(workflowId, stepId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['workflows', variables.workflowId] });
            toast.success('Step deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete step: ${error.message}`);
        },
    });
}
