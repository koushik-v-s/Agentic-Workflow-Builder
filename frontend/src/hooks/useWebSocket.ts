import { useEffect, useState } from 'react';
import websocketService from '../services/websocket';
import { ExecutionProgress } from '../types/workflow.types';

export function useWebSocket() {
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        websocketService.connect();
        setConnected(websocketService.isConnected());

        return () => {
            websocketService.disconnect();
        };
    }, []);

    return { connected };
}

export function useExecutionProgress(executionId: string | undefined, onProgress?: (progress: ExecutionProgress) => void) {
    const [progress, setProgress] = useState<ExecutionProgress | null>(null);

    useEffect(() => {
        if (!executionId) return;

        websocketService.connect();
        websocketService.joinExecution(executionId);

        const handler = (p: ExecutionProgress) => {
            if (p.executionId === executionId) {
                setProgress(p);
                onProgress?.(p);
            }
        };

        websocketService.on('execution:progress', handler);

        return () => {
            websocketService.off('execution:progress', handler);
            websocketService.leaveExecution(executionId);
        };
    }, [executionId, onProgress]);

    return progress;
}
