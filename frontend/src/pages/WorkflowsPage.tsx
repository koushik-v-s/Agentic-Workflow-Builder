import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Play, Edit, Copy, Trash2, Search } from 'lucide-react';
import { useWorkflows, useDeleteWorkflow, useDuplicateWorkflow } from '../hooks/useWorkflows';

export default function WorkflowsPage() {
    const { data: workflows, isLoading } = useWorkflows();
    const deleteWorkflow = useDeleteWorkflow();
    const duplicateWorkflow = useDuplicateWorkflow();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredWorkflows = workflows?.filter((w) =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Delete workflow "${name}"?`)) {
            await deleteWorkflow.mutateAsync(id);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Workflows</h1>
                    <p className="text-gray-400 mt-1">Manage your AI workflow automations</p>
                </div>
                <Link
                    to="/workflows/new"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    New Workflow
                </Link>
            </div>

            {/* Search */}
            <div className="glass rounded-lg p-1">
                <div className="flex items-center gap-3 px-4 py-2">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search workflows..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Workflows List */}
            {isLoading ? (
                <div className="glass rounded-xl p-12 text-center text-gray-400">
                    Loading workflows...
                </div>
            ) : filteredWorkflows.length === 0 ? (
                <div className="glass rounded-xl p-12 text-center">
                    <p className="text-gray-400 mb-4">
                        {searchQuery ? 'No workflows found' : 'No workflows created yet'}
                    </p>
                    {!searchQuery && (
                        <Link
                            to="/workflows/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Create your first workflow
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWorkflows.map((workflow) => (
                        <div key={workflow.id} className="glass rounded-xl p-6 space-y-4 hover:border-purple-500/30 transition-all">
                            <div>
                                <h3 className="text-xl font-semibold text-white">{workflow.name}</h3>
                                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                    {workflow.description || 'No description'}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                    {workflow.steps?.length || 0} steps
                                </div>
                                <div>{workflow._count?.executions || 0} runs</div>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-white/10">
                                <Link
                                    to={`/workflows/${workflow.id}/execute`}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-all"
                                >
                                    <Play className="w-4 h-4" />
                                    Run
                                </Link>
                                <Link
                                    to={`/workflows/${workflow.id}/edit`}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </Link>
                                <button
                                    onClick={() => duplicateWorkflow.mutate(workflow.id)}
                                    className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all"
                                    title="Duplicate"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(workflow.id, workflow.name)}
                                    className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
