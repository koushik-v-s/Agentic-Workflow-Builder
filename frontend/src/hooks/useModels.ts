import { useQuery } from '@tanstack/react-query';
import { modelApi } from '../services/modelApi';

export function useModels() {
    return useQuery({
        queryKey: ['models'],
        queryFn: modelApi.getAll,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
}

export function useModel(id: string | undefined) {
    return useQuery({
        queryKey: ['models', id],
        queryFn: () => modelApi.getById(id!),
        enabled: !!id && id.length > 0,
    });
}
