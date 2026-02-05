import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Plus, Trash2, Edit, X } from 'lucide-react';
import { useWorkflow, useCreateWorkflow, useUpdateWorkflow, useCreateStep, useUpdateStep, useDeleteStep } from '../hooks/useWorkflows';
import { useModels } from '../hooks/useModels';
import { WorkflowStep } from '../types/workflow.types';

export default function WorkflowBuilderPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const { data: workflow, isLoading } = useWorkflow(id);
    const { data: models } = useModels();
    const createWorkflow = useCreateWorkflow();
    const updateWorkflow = useUpdateWorkflow();
    const createStep = useCreateStep();
    const updateStep = useUpdateStep();
    const deleteStep = useDeleteStep();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [retryBudget, setRetryBudget] = useState(3);
    const [costBudget, setCostBudget] = useState<number | undefined>();
    const [steps, setSteps] = useState<WorkflowStep[]>([]);

    // Step modal state
    const [isStepModalOpen, setIsStepModalOpen] = useState(false);
    const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
    const [stepName, setStepName] = useState('');
    const [stepPrompt, setStepPrompt] = useState('');
    const [stepModel, setStepModel] = useState('gpt-3.5-turbo');
    const [stepRetryLimit, setStepRetryLimit] = useState(3);
    const [stepContextMode, setStepContextMode] = useState<'full' | 'summary' | 'selective' | 'custom'>('full');

    useEffect(() => {
        if (workflow) {
            setName(workflow.name);
            setDescription(workflow.description || '');
            setRetryBudget(workflow.retryBudget);
            setCostBudget(workflow.costBudget ? parseFloat(workflow.costBudget.toString()) : undefined);
            setSteps(workflow.steps || []);
        }
    }, [workflow]);

    const handleSave = async () => {
        if (!name.trim()) {
            alert('Please enter a workflow name');
            return;
        }

        try {
            if (isEditing && id) {
                await updateWorkflow.mutateAsync({
                    id,
                    data: { name, description, retryBudget, costBudget },
                });
                alert('Workflow updated!');
            } else {
                const newWorkflow = await createWorkflow.mutateAsync({
                    name,
                    description,
                    retryBudget,
                    costBudget,
                });
                navigate(`/workflows/${newWorkflow.id}/edit`);
            }
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    const handleAddStep = () => {
        setEditingStep(null);
        setStepName('');
        setStepPrompt('');
        setStepModel(models && models.length > 0 ? models[0].id : 'gpt-3.5-turbo');
        setStepRetryLimit(3);
        setStepContextMode('full');
        setIsStepModalOpen(true);
    };

    const handleEditStep = (step: WorkflowStep) => {
        setEditingStep(step);
        setStepName(step.name);
        setStepPrompt(step.promptTemplate);
        setStepModel(step.modelId);
        setStepRetryLimit(step.retryLimit || 3);
        setStepContextMode(step.contextMode || 'full');
        setIsStepModalOpen(true);
    };

    const handleDeleteStep = async (stepId: string) => {
        if (!id || !confirm('Are you sure you want to delete this step?')) return;
        await deleteStep.mutateAsync({ workflowId: id, stepId });
    };

    const handleSaveStep = async () => {
        if (!id || !stepName.trim() || !stepPrompt.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        const stepData = {
            name: stepName,
            promptTemplate: stepPrompt,
            modelId: stepModel,
            retryLimit: stepRetryLimit,
            contextMode: stepContextMode,
            completionCriteria: {
                type: 'rule' as const,
                logic: 'AND' as const,
                rules: [{ type: 'minLength' as const, value: 1 }]
            }
        };

        try {
            if (editingStep) {
                await updateStep.mutateAsync({
                    workflowId: id,
                    stepId: editingStep.id,
                    data: stepData,
                });
            } else {
                await createStep.mutateAsync({
                    workflowId: id,
                    data: stepData,
                });
            }
            setIsStepModalOpen(false);
        } catch (error) {
            console.error('Save step error:', error);
        }
    };

    if (isLoading) {
        return <div className="glass rounded-xl p-12 text-center text-gray-400">Loading...</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {isEditing ? 'Edit Workflow' : 'Create Workflow'}
                    </h1>
                    <p className="text-gray-400 mt-1">Configure your AI workflow automation</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                    <Save className="w-5 h-5" />
                    Save Workflow
                </button>
            </div>

            {/* Basic Info */}
            <div className="glass rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-semibold text-white">Basic Information</h2>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="My Awesome Workflow"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what this workflow does..."
                        rows={3}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Retry Budget</label>
                        <input
                            type="number"
                            value={retryBudget}
                            onChange={(e) => setRetryBudget(parseInt(e.target.value))}
                            min="0"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Cost Budget ($)</label>
                        <input
                            type="number"
                            value={costBudget || ''}
                            onChange={(e) => setCostBudget(e.target.value ? parseFloat(e.target.value) : undefined)}
                            min="0"
                            step="0.01"
                            placeholder="Optional"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Steps Section */}
            {isEditing && (
                <div className="glass rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Steps ({steps.length})</h2>
                        <button
                            onClick={handleAddStep}
                            className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Step
                        </button>
                    </div>

                    {steps.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            No steps yet. Add your first step to get started.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {steps.map((step) => (
                                <div key={step.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                                                    Step {step.stepOrder}
                                                </span>
                                                <h3 className="font-semibold text-white">{step.name}</h3>
                                            </div>
                                            <p className="text-sm text-gray-400 line-clamp-2">{step.promptTemplate}</p>
                                            <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                                <span>Model: {step.modelId}</span>
                                                <span>Retries: {step.retryLimit}</span>
                                                <span>Context: {step.contextMode}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 ml-4">
                                            <button
                                                onClick={() => handleEditStep(step)}
                                                className="p-2 hover:bg-white/10 rounded transition-all"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4 text-blue-400" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStep(step.id)}
                                                className="p-2 hover:bg-red-500/20 rounded transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Step Modal */}
            {isStepModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                {editingStep ? 'Edit Step' : 'Add Step'}
                            </h2>
                            <button
                                onClick={() => setIsStepModalOpen(false)}
                                className="p-2 hover:bg-white/10 rounded transition-all"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Step Name *</label>
                                <input
                                    type="text"
                                    value={stepName}
                                    onChange={(e) => setStepName(e.target.value)}
                                    placeholder="e.g., Generate Greeting"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Prompt Template *</label>
                                <textarea
                                    value={stepPrompt}
                                    onChange={(e) => setStepPrompt(e.target.value)}
                                    placeholder="Enter the prompt for this step..."
                                    rows={5}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Model *</label>
                                    <select
                                        value={stepModel}
                                        onChange={(e) => setStepModel(e.target.value)}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
                                    >
                                        {models && models.map((model) => (
                                            <option key={model.id} value={model.id}>
                                                {model.displayName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Retry Limit</label>
                                    <input
                                        type="number"
                                        value={stepRetryLimit}
                                        onChange={(e) => setStepRetryLimit(parseInt(e.target.value))}
                                        min="0"
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Context Mode</label>
                                <select
                                    value={stepContextMode}
                                    onChange={(e) => setStepContextMode(e.target.value as 'full' | 'summary' | 'selective' | 'custom')}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all"
                                >
                                    <option value="full">Full (Pass complete previous output)</option>
                                    <option value="summary">Summary (Summarize previous output)</option>
                                    <option value="selective">Selective (Extract specific parts)</option>
                                    <option value="custom">Custom (Use custom selector)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setIsStepModalOpen(false)}
                                    className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveStep}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                                >
                                    {editingStep ? 'Update Step' : 'Add Step'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
