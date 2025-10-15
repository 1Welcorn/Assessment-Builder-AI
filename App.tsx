// Fix: Add reference to Vite client types to resolve `import.meta.env`.
/// <reference types="vite/client" />

import React, { useState } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import QuestionBankEditor from './pages/QuestionBankEditor';
import AssessmentBuilder from './pages/AssessmentBuilder';
import { MOCK_ASSESSMENTS, MOCK_TEMPLATES, MOCK_BNCC, MOCK_DESCRITORES, GoogleDriveIcon } from './constants';
import { Assessment, AnswerTemplate, BNCC, Descritor } from './types';
import { Icons } from './components/Icons';


// Mock Pages/Components for routing
const AssessmentsDashboard = () => {
    return (
        <div className="p-8">
             <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-medium">Title</th>
                            <th scope="col" className="px-6 py-3 font-medium">Subject</th>
                            <th scope="col" className="px-6 py-3 font-medium">Status</th>
                            <th scope="col" className="px-6 py-3 font-medium">Last Modified</th>
                            <th scope="col" className="px-6 py-3 font-medium text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_ASSESSMENTS.map((assessment: Assessment) => (
                            <tr key={assessment.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{assessment.title}</td>
                                <td className="px-6 py-4">{assessment.subject}</td>
                                <td className="px-6 py-4"><span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${assessment.status === 'Published' ? 'bg-green-100 text-green-800' : assessment.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800'}`}>{assessment.status}</span></td>
                                <td className="px-6 py-4">{assessment.lastModified}</td>
                                <td className="px-6 py-4 flex justify-center gap-4">
                                    <button className="font-medium text-primary-600 hover:text-primary-800"><Icons.Edit className="w-4 h-4" /></button>
                                    <button className="font-medium text-red-500 hover:text-red-700"><Icons.Delete className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TemplateManager = () => (
    <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_TEMPLATES.map((template: AnswerTemplate) => (
                <div key={template.id} className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-slate-800">{template.name}</h3>
                    <p className="text-sm text-slate-600 mt-2">{template.description}</p>
                    <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                        <button className="text-sm font-medium text-primary-600 hover:underline">Edit</button>
                        <button className="text-sm font-medium text-red-600 hover:underline">Delete</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('drive');

    const renderContent = () => {
        switch (activeTab) {
            case 'drive':
                return (
                    <div className="space-y-6">
                        <div className="p-6 border rounded-lg bg-white shadow-sm">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-slate-800">Account Connection</h3>
                                    <p className="text-sm text-slate-500">user@example.com</p>
                                </div>
                                <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">Disconnect</button>
                            </div>
                        </div>
                        <div className="p-6 border rounded-lg bg-white shadow-sm">
                            <h3 className="font-semibold text-slate-800 mb-4">Synchronization Preferences</h3>
                            <div className="flex items-center justify-between">
                                <p className="text-sm">Enable background synchronization</p>
                                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                                    <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"></label>
                                </div>
                            </div>
                        </div>
                        <button className="w-full flex justify-center items-center gap-2 px-4 py-2 font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                            <GoogleDriveIcon className="!h-4 !w-4" /> Sync Now
                        </button>
                    </div>
                );
            case 'bncc':
                return (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50"><tr><th className="px-6 py-3 font-medium">Code</th><th className="px-6 py-3 font-medium">Description</th><th className="px-6 py-3 font-medium">Actions</th></tr></thead>
                            <tbody>
                                {MOCK_BNCC.map((bncc: BNCC) => <tr key={bncc.id} className="border-b hover:bg-slate-50"><td className="px-6 py-4 font-mono">{bncc.code}</td><td className="px-6 py-4">{bncc.description}</td><td className="px-6 py-4 flex gap-2"><button className="font-medium text-primary-600 hover:underline">Edit</button></td></tr>)}
                            </tbody>
                        </table>
                    </div>
                );
            case 'descritores':
                return (
                     <div className="bg-white rounded-lg shadow-sm border">
                         <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50"><tr><th className="px-6 py-3 font-medium">Code</th><th className="px-6 py-3 font-medium">Description</th><th className="px-6 py-3 font-medium">Actions</th></tr></thead>
                            <tbody>
                                {MOCK_DESCRITORES.map((d: Descritor) => <tr key={d.id} className="border-b hover:bg-slate-50"><td className="px-6 py-4 font-mono">{d.code}</td><td className="px-6 py-4">{d.description}</td><td className="px-6 py-4 flex gap-2"><button className="font-medium text-primary-600 hover:underline">Edit</button></td></tr>)}
                            </tbody>
                        </table>
                    </div>
                );
            default: return null;
        }
    }

    const getTabClass = (tabName: string) => 
        `px-3 py-2 font-semibold text-sm rounded-md transition-colors ${activeTab === tabName ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-200'}`;
    
    return (
        <div className="p-8">
            <div className="flex gap-2 mb-6">
                <button onClick={() => setActiveTab('drive')} className={getTabClass('drive')}>Google Drive</button>
                <button onClick={() => setActiveTab('bncc')} className={getTabClass('bncc')}>BNCC</button>
                <button onClick={() => setActiveTab('descritores')} className={getTabClass('descritores')}>Descritores</button>
            </div>
            <div>{renderContent()}</div>
             <style>{`.toggle-checkbox:checked { right: 0; border-color: #4f46e5; } .toggle-checkbox:checked + .toggle-label { background-color: #4f46e5; }`}</style>
        </div>
    );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}
const NavItem: React.FC<NavItemProps> = ({ to, icon, children }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`
            }
        >
            {icon}
            {children}
        </NavLink>
    );
};

const MainLayout = () => {
    const location = useLocation();
    
    const sidebarLinks = [
        { path: '/', name: 'Assessments', icon: <Icons.Assessments className="w-5 h-5" /> },
        { path: '/bank', name: 'Question Bank', icon: <Icons.Bank className="w-5 h-5" /> },
        { path: '/builder', name: 'Builder', icon: <Icons.Builder className="w-5 h-5" /> },
        { path: '/templates', name: 'Templates', icon: <Icons.Templates className="w-5 h-5" /> },
    ];

    const getPageTitle = () => {
        const currentLink = [...sidebarLinks, { path: '/settings', name: 'Settings' }].find(link => location.pathname === link.path);
        return currentLink ? currentLink.name : "Dashboard";
    }

    const getPageActions = () => {
        switch(location.pathname) {
            case '/':
                return (
                    <NavLink to="/builder" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm transition-colors">
                        <Icons.Add className="w-4 h-4" />
                        New Assessment
                    </NavLink>
                )
            case '/bank':
                 return (
                    <button onClick={() => alert('Add New Question')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm transition-colors">
                        <Icons.Add className="w-4 h-4" />
                        Add Question
                    </button>
                )
            case '/templates':
                 return (
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm transition-colors">
                       <Icons.Add className="w-4 h-4" /> New Template
                    </button>
                )
            default:
                return null;
        }
    }
    
    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-200">
                     <Icons.Logo className="w-8 h-8 text-primary-600" />
                    <h1 className="text-xl font-bold text-slate-800 ml-2">Assess.AI</h1>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {sidebarLinks.map(link => (
                         <NavItem key={link.path} to={link.path} icon={link.icon}>{link.name}</NavItem>
                    ))}
                </nav>
                 <div className="p-4 border-t border-slate-200">
                    <NavItem to="/settings" icon={<Icons.Settings className="w-5 h-5" />}>Settings</NavItem>
                 </div>
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                    <h2 className="text-xl font-bold text-slate-800">{getPageTitle()}</h2>
                    <div>{getPageActions()}</div>
                </header>
                <main className="flex-1 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<AssessmentsDashboard />} />
                        <Route path="/bank" element={<QuestionBankEditor />} />
                        <Route path="/builder" element={<AssessmentBuilder />} />
                        <Route path="/templates" element={<TemplateManager />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

interface ApiKeyCheckerProps {
    children?: React.ReactNode;
}
const ApiKeyChecker = ({ children }: ApiKeyCheckerProps) => {
    // CORRECT: Use import.meta.env.VITE_API_KEY for client-side environment variables in Vite.
    const apiKey = import.meta.env.VITE_API_KEY;

    if (!apiKey) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-100 p-4 font-sans">
                <div className="text-center p-8 bg-white shadow-xl rounded-lg max-w-lg border border-red-200">
                    <h1 className="text-2xl font-bold text-red-700">Configuration Error</h1>
                    <p className="mt-4 text-slate-700">
                        A Google Gemini API key is required for AI features, but it has not been configured.
                    </p>
                    <p className="mt-2 text-slate-600 text-sm">
                        To fix this, go to your deployment settings (e.g., on Vercel) and add an environment variable named <code className="bg-red-100 text-red-800 px-1.5 py-1 rounded font-mono text-[11px]">VITE_API_KEY</code> with your key as the value.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

const App = () => {
  return (
    <HashRouter>
        <ApiKeyChecker>
            <MainLayout />
        </ApiKeyChecker>
    </HashRouter>
  );
};

export default App;