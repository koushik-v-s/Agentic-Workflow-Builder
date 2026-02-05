import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Play, Clock } from 'lucide-react';
import { useWorkflows } from '../hooks/useWorkflows';

export default function Home() {
    const { data: workflows, isLoading } = useWorkflows();

    const recentWorkflows = workflows?.slice(0, 5) || [];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-12">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Build Intelligent AI Workflows
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                    Chain multiple LLM agents together. Define tasks, set completion criteria, and let AI do the work.
                </p>
                <div className="flex gap-4 justify-center mt-8">
                    <Link
                        to="/workflows/new"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Create Workflow
                    </Link>
                    <Link
                        to="/workflows"
                        className="flex items-center gap-2 px-6 py-3 glass glass-hover text-white rounded-lg font-semibold border border-white/10"
                    >
                        <Play className="w-5 h-5" />
                        View All Workflows
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Workflows"
                    value={workflows?.length || 0}
                    icon={<Play className="w-8 h-8" />}
                    gradient="from-purple-500 to-purple-600"
                />
                <StatCard
                    title="Active Workflows"
                    value={workflows?.filter(w => w.isActive).length || 0}
                    icon={<Clock className="w-8 h-8" />}
                    gradient="from-pink-500 to-pink-600"
                />
                <StatCard
                    title="Total Executions"
                    value={workflows?.reduce((sum, w) => sum + (w._count?.executions || 0), 0) || 0}
                    icon={<Play className="w-8 h-8" />}
                    gradient="from-cyan-500 to-cyan-600"
                />
            </div>

            {/* Recent Workflows */}
            <div className="glass rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Workflows</h2>
                {isLoading ? (
                    <div className="text-center text-gray-400 py-8">Loading...</div>
                ) : recentWorkflows.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        No workflows yet. <Link to="/workflows/new" className="text-purple-400 hover:underline">Create one!</Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentWorkflows.map((workflow) => (
                            <Link
                                key={workflow.id}
                                to={`/workflows/${workflow.id}/edit`}
                                className="block p-4 glass-hover rounded-lg border border-white/5 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-white">{workflow.name}</h3>
                                        <p className="text-sm text-gray-400">{workflow.description || 'No description'}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-400">{workflow.steps?.length || 0} steps</div>
                                        <div className="text-xs text-gray-500">{workflow._count?.executions || 0} runs</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    gradient: string;
}

function StatCard({ title, value, icon, gradient }: StatCardProps) {
    return (
        <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm">{title}</p>
                    <p className="text-4xl font-bold text-white mt-2">{value}</p>
                </div>
                <div className={`p-4 bg-gradient-to-br ${gradient} rounded-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
