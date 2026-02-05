import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import WorkflowsPage from './pages/WorkflowsPage';
import WorkflowBuilderPage from './pages/WorkflowBuilderPage';
import ExecutionPage from './pages/ExecutionPage';
import HistoryPage from './pages/HistoryPage';
import './styles/globals.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AppLayout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/workflows" element={<WorkflowsPage />} />
                        <Route path="/workflows/new" element={<WorkflowBuilderPage />} />
                        <Route path="/workflows/:id/edit" element={<WorkflowBuilderPage />} />
                        <Route path="/workflows/:id/execute" element={<ExecutionPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AppLayout>
            </BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))',
                        border: '1px solid hsl(var(--border))',
                    },
                }}
            />
        </QueryClientProvider>
    );
}

export default App;
