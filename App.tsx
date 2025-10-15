
import React, { useState } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import QuestionBankEditor from './pages/QuestionBankEditor';
import AssessmentBuilder from './pages/AssessmentBuilder';
import { MOCK_ASSESSMENTS, MOCK_TEMPLATES, MOCK_BNCC, MOCK_DESCRITORES, GoogleDriveIcon } from './constants';
import { Assessment, AnswerTemplate, BNCC, Descritor } from './types';
import Modal from './components/Modal';

// Mock Pages/Components for routing
const AssessmentsDashboard = () => {
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Assessments Dashboard</h1>
                <NavLink to="/builder" className="px-5 py-2 font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700 shadow-sm">
                    Create New Assessment
                </NavLink>
            </div>
             <div className="bg-white rounded-lg shadow border overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Title</th>
                            <th scope="col" className="px-6 py-3">Subject</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Last Modified</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_ASSESSMENTS.map((assessment: Assessment) => (
                            <tr key={assessment.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{assessment.title}</td>
                                <td className="px-6 py-4">{assessment.subject}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${assessment.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{assessment.status}</span></td>
                                <td className="px-6 py-4">{assessment.lastModified}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button className="font-medium text-primary-600 hover:underline">Edit</button>
                                    <button className="font-medium text-red-600 hover:underline">Delete</button>
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
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Template Management</h1>
            <button className="px-5 py-2 font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700 shadow-sm">
                Create New Template
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_TEMPLATES.map((template: AnswerTemplate) => (
                <div key={template.id} className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="text-lg font-semibold text-gray-800">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-2">{template.description}</p>
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
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Google Drive Sync Settings</h2>
                        <div className="space-y-6">
                            <div className="p-4 border rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium">Account Connection</h3>
                                    <p className="text-sm text-gray-500">user@example.com</p>
                                </div>
                                <button className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50">Disconnect</button>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-medium mb-2">Synchronization Preferences</h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm">Enable background synchronization</p>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full flex justify-center items-center gap-2 px-4 py-2 font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                                <GoogleDriveIcon className="!h-4 !w-4" /> Sync Now
                            </button>
                        </div>
                    </div>
                );
            case 'bncc':
                return (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">BNCC Management</h2>
                        <div className="flex justify-end gap-2 mb-4">
                            <button className="px-4 py-2 text-sm font-medium border rounded-md">Import</button>
                            <button className="px-4 py-2 text-sm font-medium border rounded-md">Export</button>
                             <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Add New</button>
                        </div>
                        <div className="bg-white rounded-lg shadow border">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">Code</th><th className="px-6 py-3">Description</th><th className="px-6 py-3">Actions</th></tr></thead>
                                <tbody>
                                    {MOCK_BNCC.map((bncc: BNCC) => <tr key={bncc.id} className="border-b hover:bg-gray-50"><td className="px-6 py-4 font-mono">{bncc.code}</td><td className="px-6 py-4">{bncc.description}</td><td className="px-6 py-4 flex gap-2"><button className="font-medium text-primary-600 hover:underline">Edit</button></td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'descritores':
                return (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Descritores Management</h2>
                        <div className="flex justify-end gap-2 mb-4">
                            <button className="px-4 py-2 text-sm font-medium border rounded-md">Import</button>
                             <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">Add New</button>
                        </div>
                        <div className="bg-white rounded-lg shadow border">
                             <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">Code</th><th className="px-6 py-3">Description</th><th className="px-6 py-3">Actions</th></tr></thead>
                                <tbody>
                                    {MOCK_DESCRITORES.map((d: Descritor) => <tr key={d.id} className="border-b hover:bg-gray-50"><td className="px-6 py-4 font-mono">{d.code}</td><td className="px-6 py-4">{d.description}</td><td className="px-6 py-4 flex gap-2"><button className="font-medium text-primary-600 hover:underline">Edit</button></td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    const getTabClass = (tabName: string) => 
        `px-4 py-2 font-medium text-sm rounded-md ${activeTab === tabName ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`;
    
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
            <div className="flex gap-2 mb-6 border-b">
                <button onClick={() => setActiveTab('drive')} className={getTabClass('drive')}>Google Drive</button>
                <button onClick={() => setActiveTab('bncc')} className={getTabClass('bncc')}>BNCC</button>
                <button onClick={() => setActiveTab('descritores')} className={getTabClass('descritores')}>Descritores</button>
            </div>
            <div>{renderContent()}</div>
             <style>{`.toggle-checkbox:checked { right: 0; border-color: #4f46e5; } .toggle-checkbox:checked + .toggle-label { background-color: #4f46e5; }`}</style>
        </div>
    );
}

const NavItem = ({ to, children }: { to: string, children: React.ReactNode }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`
            }
        >
            {children}
        </NavLink>
    );
};

const MainLayout = () => {
    const location = useLocation();
    
    const sidebarLinks = [
        { path: '/', name: 'Assessments' },
        { path: '/bank', name: 'Question Bank' },
        { path: '/builder', name: 'Builder' },
        { path: '/templates', name: 'Templates' },
        { path: '/settings', name: 'Settings' },
    ];
    
    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white border-r flex flex-col">
                <div className="h-16 flex items-center justify-center border-b">
                    <h1 className="text-2xl font-bold text-primary-600">Assess.AI</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {sidebarLinks.map(link => (
                         <NavItem key={link.path} to={link.path}>{link.name}</NavItem>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 overflow-y-auto bg-slate-50">
                <Routes>
                    <Route path="/" element={<AssessmentsDashboard />} />
                    <Route path="/bank" element={<QuestionBankEditor />} />
                    <Route path="/builder" element={<AssessmentBuilder />} />
                    <Route path="/templates" element={<TemplateManager />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </main>
        </div>
    );
};

const App = () => {
  return (
    <HashRouter>
        <MainLayout />
    </HashRouter>
  );
};

export default App;
