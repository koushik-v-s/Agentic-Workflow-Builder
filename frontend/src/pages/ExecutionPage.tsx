import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Clock, CheckCircle, XCircle, DollarSign, Zap } from 'lucide-react';
import { useWorkflow } from '../hooks/useWorkflows';
import { useStartExecution } from '../hooks/useExecution';
import { useExecutionProgress } from '../hooks/useWebSocket';

export default function ExecutionPage() {
    const { id } = useParams();
    const { data: workflow } = useWorkflow(id);
    const startExecution = useStartExecution();
    const [executionId, setExecutionId] = React.useState<string | undefined>();

    const progress = useExecutionProgress(executionId);

    const handleStart = async () => {
        if (!id) return;
        try {
            const execution = await startExecution.mutateAsync({ workflowId: id });
            setExecutionId(execution.id);
        } catch (error) {
            console.error('Failed to start execution:', error);
        }
    };

    if (!workflow) {
        return <div className="glass rounded-xl p-12 text-center text-gray-400">Loading...</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div className="glass rounded-xl p-6">
                <h1 className="text-3xl font-bold text-white mb-2">{workflow.name}</h1>
                <p className="text-gray-400">{workflow.description || 'No description'}</p>

                <div className="flex gap-4 mt-6">
                    {!executionId ? (
                        <button
                            onClick={handleStart}
                            disabled={startExecution.isPending}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50"
                        >
                            <Play className="w-5 h-5" />
                            {startExecution.isPending ? 'Starting...' : 'Start Execution'}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 text-green-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Executing...
                        </div>
                    )}
                </div>
            </div>

            {/* Progress */}
            {progress && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1">Status</div>
                            <div className="flex items-center gap-2">
                                {progress.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-400" />}
                                {progress.status === 'failed' && <XCircle className="w-5 h-5 text-red-400" />}
                                {progress.status === 'running' && <Clock className="w-5 h-5 text-blue-400 animate-spin" />}
                                <span className="text-white font-semibold capitalize">{progress.status}</span>
                            </div>
                        </div>

                        <div className="glass rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1">Progress</div>
                            <div className="text-white font-semibold">
                                {progress.completedSteps} / {progress.totalSteps}
                            </div>
                        </div>

                        <div className="glass rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1">Cost</div>
                            <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-yellow-400" />
                                <span className="text-white font-semibold">${progress.totalCost.toFixed(4)}</span>
                            </div>
                        </div>

                        <div className="glass rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1">Tokens</div>
                            <div className="flex items-center gap-1">
                                <Zap className="w-4 h-4 text-purple-400" />
                                <span className="text-white font-semibold">{progress.totalTokens}</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="glass rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Overall Progress</span>
                            <span className="text-white font-semibold">
                                {Math.round((progress.completedSteps / progress.totalSteps) * 100)}%
                            </span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                style={{ width: `${(progress.completedSteps / progress.totalSteps) * 100}%` }}
                            />
                        </div>

                        {progress.currentStep && (
                            <div className="mt-4 text-sm text-gray-400">
                                Currently executing: <span className="text-white">Step {progress.currentStep}</span>
                            </div>
                        )}

                        {progress.error && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                                {progress.error}
                            </div>
                        )}
                    </div>

                    {/* Steps Timeline */}
                    <div className="glass rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Steps Timeline</h2>
                        <div className="space-y-3">
                            {workflow.steps?.map((step) => {
                                const isCompleted = step.stepOrder <= progress.completedSteps;
                                const isCurrent = step.stepOrder === progress.currentStep;
                                const isPending = step.stepOrder > progress.completedSteps;

                                return (
                                    <div
                                        key={step.id}
                                        className={`p-4 rounded-lg border transition-all ${isCurrent
                                                ? 'bg-purple-500/10 border-purple-500/50 animate-pulse-glow'
                                                : isCompleted
                                                    ? 'bg-green-500/5 border-green-500/30'
                                                    : 'bg-white/5 border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : isCurrent
                                                            ? 'bg-purple-500/20 text-purple-400'
                                                            : 'bg-gray-500/20 text-gray-400'
                                                    }`}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : isCurrent ? (
                                                    <Clock className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <span>{step.stepOrder}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white">{step.name}</h3>
                                                <p className="text-sm text-gray-400">Model: {step.modelId}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
