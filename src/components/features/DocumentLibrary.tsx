import React, { useState, useRef } from 'react';
import {
    FileText, Search, Plus, Filter, Download, Trash2,
    Share2, ExternalLink, Clock, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { useDocuments } from '../../hooks/useDocuments';

export const DocumentLibrary = () => {
    const { documents, loading, uploading, uploadDocument, deleteDocument } = useDocuments();
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setIsTypeModalOpen(true);
        }
        // Reset input
        e.target.value = '';
    };

    const confirmUpload = async (type: string) => {
        if (selectedFile) {
            await uploadDocument(selectedFile, type);
            setIsTypeModalOpen(false);
            setSelectedFile(null);
        }
    };

    const [activeFilter, setActiveFilter] = useState('Tous');

    // Mappings between UI labels and DB values
    const getDbType = (label: string) => {
        if (label === 'Lettres de Motivation') return 'LM';
        if (label === 'Autres') return 'Autre';
        if (label === 'Certificats') return 'Certificat';
        return label; // 'CV' -> 'CV'
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'Tous' || doc.type === getDbType(activeFilter);
        return matchesSearch && matchesFilter;
    });

    const totalSize = documents.reduce((acc, doc) => acc + parseFloat(doc.size), 0);
    const sizePercentage = Math.min((totalSize / 100) * 100, 100); // Assuming 100MB limit

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500 relative">
            {/* Type Selection Modal */}
            {isTypeModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Type de document</h3>
                        <p className="text-sm text-slate-500 mb-6">Quel est le type de ce document ?</p>

                        <div className="space-y-3">
                            {[
                                { label: 'CV', value: 'CV', icon: FileText },
                                { label: 'Lettre de Motivation', value: 'LM', icon: FileText },
                                { label: 'Certificat / DiplÃ´me', value: 'Certificat', icon: CheckCircle2 },
                                { label: 'Autre', value: 'Autre', icon: FileText }
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => confirmUpload(type.value)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                                >
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                                        <type.icon size={18} />
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{type.label}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => { setIsTypeModalOpen(false); setSelectedFile(null); }}
                            className="w-full mt-6 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium text-sm"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                        BibliothÃ¨que <span className="text-indigo-600">Documents</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Centralise et gÃ¨re tes CV, lettres et certificats.
                    </p>
                </div>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                    />
                    <button
                        onClick={() => {
                            if (fileInputRef.current) {
                                fileInputRef.current.click();
                            } else {
                                console.error("File input ref missing");
                                alert("Erreur interne : Impossible d'ouvrir le sÃ©lecteur. Essayez de rafraÃ®chir la page.");
                            }
                        }}
                        disabled={uploading}
                        className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} strokeWidth={3} />}
                        {uploading ? 'Importation...' : 'Importer un Document'}
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3 mb-10">
                {['Tous', 'CV', 'Lettres de Motivation', 'Certificats', 'Autres'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${activeFilter === filter ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-200'}`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Documents List */}
            <div className="glass-panel rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-800/30 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un document..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <FileText size={48} className="mb-4 opacity-50" />
                            <p>Aucun document trouvÃ©.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Document</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date Ajout</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Taille</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Statut</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredDocuments.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px]" title={doc.name}>{doc.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold uppercase tracking-widest">
                                                {doc.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} />
                                                {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-slate-500">{doc.size} MB</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-tighter">
                                                <CheckCircle2 size={14} />
                                                {doc.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex gap-1">
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all flex items-center justify-center"
                                                    title="TÃ©lÃ©charger"
                                                >
                                                    <Download size={18} />
                                                </a>
                                                <button
                                                    onClick={() => deleteDocument(doc.id, doc.path)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Storage Info */}
            <div className="mt-8 flex items-center justify-between p-6 glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <AlertCircle className="text-indigo-600" size={18} />
                    </div>
                    <div className="text-sm">
                        <span className="font-bold text-slate-700 dark:text-slate-200">Espace utilisÃ© : {totalSize.toFixed(2)} MB</span>
                        <span className="text-slate-400 ml-2">sur 100 MB (Offre Gratuite)</span>
                    </div>
                </div>
                <div className="w-64 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${sizePercentage}%` }} />
                </div>
            </div>
        </div>
    );
};
