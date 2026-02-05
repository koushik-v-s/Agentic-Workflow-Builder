import React from 'react';
import { useWorkflows } from '../hooks/useWorkflows';
import { CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

export default function HistoryPage() {
    const { data: workflows } = useWorkflows();

    // Get all executions from all workflows
    const allExecutions = workflows?.flatMap(w =>
        w.executions?.map(e => ({ ...e, workflowName: w.name })) || []
    ).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()) || [];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-white">Execution History</h1>
                <p className="text-gray-400 mt-1">View past workflow executions and their results</p>
            </div>

            {allExecutions.length === 0 ? (
                <div className="glass rounded-xl p-12 text-center text-gray-400">
                    No executions yet. Run a workflow to see history here.
                </div>
            ) : (
                <div className="glass rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Workflow
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Started
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Cost
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Tokens
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {allExecutions.map((execution) => {
                                    const duration = execution.completedAt
                                        ? Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000)
                                        : null;

                                    return (
                                        <tr key={execution.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-white font-medium">{execution.workflowName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {execution.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                                                    {execution.status === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
                                                    {execution.status === 'running' && <Clock className="w-4 h-4 text-blue-400" />}
                                                    <span className="text-gray-300 capitalize">{execution.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                                                {new Date(execution.startedAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                                                {duration ? `${duration}s` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1 text-yellow-400">
                                                    <DollarSign className="w-4 h-4" />
                                                    <span>{execution.totalCost.toFixed(4)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                                                {execution.totalTokens.toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
