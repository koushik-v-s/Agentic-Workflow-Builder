import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Workflow, Play, History, Settings, Zap } from 'lucide-react';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="glass border-b border-white/10 sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Agentic Workflow
                                </h1>
                                <p className="text-xs text-gray-400">Build AI Workflows</p>
                            </div>
                        </Link>

                        <nav className="flex gap-2">
                            <NavLink to="/" icon={<Workflow />} label="Dashboard" active={location.pathname === '/'} />
                            <NavLink to="/workflows" icon={<Settings />} label="Workflows" active={isActive('/workflows')} />
                            <NavLink to="/history" icon={<History />} label="History" active={isActive('/history')} />
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="glass border-t border-white/10 mt-auto">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between text-sm text-gray-400">
                        <p>© 2026 Agentic Workflow Builder</p>
                        <p>Built with React + Express + PostgreSQL</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

interface NavLinkProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
}

function NavLink({ to, icon, label, active }: NavLinkProps) {
    return (
        <Link
            to={to}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${active
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
        >
            <div className="w-5 h-5">{icon}</div>
            <span className="font-medium">{label}</span>
        </Link>
    );
}
