import React, { useState, useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import {
    X,
    Paperclip,
    Save,
    Briefcase,
    Globe,
    User,
    Calendar,
    Euro,
    Star,
    Target,
    Plus,
    Edit2,
    File,
    MapPin,
    Building,
    Mail,
    Phone,
    Linkedin,
    FileText,
    ListTodo,
    Network
} from 'lucide-react';
import type { JobApplication, Attachment, ApplicationStatus } from '../../types';
import { StatusSelector } from '../ui/StatusSelector';
import { calculateAiScore, calculateRealAiScore } from '../../lib/aiScoring';
import { parseJobOffer } from '../../lib/parseJobOffer';
import { Wand2, Loader2, CheckCircle2 } from 'lucide-react';
import { useDocuments } from '../../hooks/useDocuments';

interface ApplicationFormProps {
    initialData: Omit<JobApplication, 'id'> | JobApplication;
    isEditing: boolean;
    onSubmit: (e: React.FormEvent, data: Omit<JobApplication, 'id'>) => Promise<void>;
    onCancel: () => void;
    onUpload: (file: File) => Promise<string>;
    isUploading: boolean;
}

export const ApplicationForm = ({
    initialData,
    isEditing,
    onSubmit,
    onCancel,
    onUpload,
    isUploading
}: ApplicationFormProps) => {

    const [formData, setFormData] = useState<Omit<JobApplication, 'id'>>(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = initialData as JobApplication;
        return {
            recruiterName: '', recruiterEmail: '', recruiterPhone: '', recruiterLinkedin: '',
            jobDescription: '', nextStep: '', source: 'LinkedIn',
            ...rest
        };
    });

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = initialData as JobApplication;
        setFormData(prev => ({ ...prev, ...rest }));
    }, [initialData]);

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const [activeTab, setActiveTab] = useState<'details' | 'description' | 'attachments'>('details');
    const { documents: libraryDocuments, loading: loadingDocs } = useDocuments();
    const [isScoring, setIsScoring] = useState(false);
    const [openPicker] = useDrivePicker();
    const [newFileName, setNewFileName] = useState('');
    const [newFileLink, setNewFileLink] = useState('');

    // --- Drag & Drop / Manual Upload Logic ---
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await handleManualUpload(files[0]);
        }
    };



    const handleManualUpload = async (file: File) => {
        try {
            const url = await onUpload(file);
            const newAtt: Attachment = {
                name: file.name,
                url: url,
                type: 'autre',
                size: file.size
            };
            setFormData(prev => ({ ...prev, attachments: [...prev.attachments, newAtt] }));
        } catch (error) {
            console.error("Upload failed", error);
            alert("Erreur d'upload : " + error);
        }
    };
    // -----------------------------------------

    // Helper for stars
    const renderStars = () => {
        const level = formData.interestLevel || 3;
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, interestLevel: star })}
                        className={`transition-all ${star <= level ? 'text-yellow-400 scale-110' : 'text-slate-300 hover:text-yellow-200'}`}
                    >
                        <Star size={24} fill={star <= level ? "currentColor" : "none"} />
                    </button>
                ))}
            </div>
        );
    };

    // --- AI Logic Stubs ---
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyzeJob = () => {
        setIsAnalyzing(true);
        // Simulation d'IA
        setTimeout(() => {
            const keywords = ['React', 'TypeScript', 'Node', 'Firebase', 'Tailwind'];
            const found = keywords.filter(k => formData.jobDescription?.toLowerCase().includes(k.toLowerCase()));
            const score = Math.floor(Math.random() * 30) + 70; // Random score 70-100

            setAiAnalysis(`
                **Score de compatibilité : ${score}%**
                
                ✅ Points forts identifiés : ${found.length > 0 ? found.join(', ') : 'Polyvalence, Motivation'}
                ⚠️ Points à surveiller : Expérience spécifique sur outils internes.
                
                💡 Conseil : Mettez en avant vos projets personnels utilisant ces technologies.
            `);
            setIsAnalyzing(false);
        }, 1500);
    };

    const handleGenerateEmail = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            const email = `Objet : Candidature pour le poste de ${formData.position} - ${formData.company}

Bonjour ${formData.contactName || 'Monsieur/Madame'},

C'est avec un grand enthousiasme que je vous adresse ma candidature pour le poste de ${formData.position} chez ${formData.company}.

Votre entreprise, reconnue pour son excellence, correspond parfaitement à l'environnement dans lequel je souhaite évoluer. Mes compétences en développement (React, TypeScript) et mon expérience récente seraient des atouts pour votre équipe.

Je serais ravi de discuter de la manière dont je peux contribuer à votre succès.

Cordialement,
Mon Nom`;
            setGeneratedEmail(email);
            setIsAnalyzing(false);
        }, 1500);
    };
    // ----------------------

    const handleDrivePick = () => {
        openPicker({
            clientId: "503263523556-jkfq2vspj6ie65d2qha64e4q794madj7.apps.googleusercontent.com",
            developerKey: "AIzaSyC3ZWOpeaEvkCAruwm5SSHj2qzVWIQ59Ro",
            appId: "503263523556",
            viewId: "DOCS",
            // @ts-ignore
            showUploadView: true,
            setIncludeFolders: true,
            setSelectFolderEnabled: true,
            supportDrives: true,
            // @ts-ignore
            mimeTypes: "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.google-apps.document,image/jpeg,image/png",
            locale: "fr",
            callbackFunction: (data) => {
                if (data.action === 'picked') {
                    const doc = data.docs[0];
                    let cleanUrl = doc.url;
                    if (doc.type === 'file' && doc.id) {
                        const isGoogleDoc = doc.mimeType?.includes('application/vnd.google-apps');
                        if (!isGoogleDoc) {
                            cleanUrl = `https://drive.google.com/file/d/${doc.id}/view`;
                        }
                    }
                    const newAtt: Attachment = { name: doc.name, url: cleanUrl, type: 'autre' };
                    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, newAtt] }));
                }
            },
        });
    };

    const addLinkAttachment = () => {
        if (!newFileName) return;
        const newAtt: Attachment = {
            name: newFileName,
            url: newFileLink,
            type: 'autre'
        };
        setFormData({ ...formData, attachments: [...formData.attachments, newAtt] });
        setNewFileName('');
        setNewFileLink('');
    };

    const removeAttachment = (index: number) => {
        const newAtts = [...formData.attachments];
        newAtts.splice(index, 1);
        setFormData({ ...formData, attachments: newAtts });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsScoring(true);
        try {
            // Calculate Real AI Score using Gemini
            const score = await calculateRealAiScore(formData as JobApplication);
            await onSubmit(e, { ...formData, aiScore: score });
        } catch (error) {
            console.error("Submission error:", error);
            // Fallback to heuristic if something goes wrong
            const fallbackScore = calculateAiScore(formData as JobApplication);
            await onSubmit(e, { ...formData, aiScore: fallbackScore });
        } finally {
            setIsScoring(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[88vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300 border border-white/50">

                {/* Header Premium */}
                <div className="bg-slate-50/50 p-6 flex justify-between items-center shrink-0 border-b border-slate-100 backdrop-blur-md">
                    <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 ${isEditing ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'}`}>
                            {isEditing ? <Edit2 size={26} strokeWidth={2.5} /> : <Target size={26} strokeWidth={2.5} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{isEditing ? "Modifier l'Opportunité" : "Nouvelle Candidature"}</h2>
                            <p className="text-slate-500 font-medium">Capturez chaque détail pour décrocher le job.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex bg-slate-100 rounded-lg p-1">
                            <button type="button" onClick={() => setActiveTab('details')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'details' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Détails</button>
                            <button type="button" onClick={() => setActiveTab('description')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'description' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Description & IA</button>
                            <button type="button" onClick={() => setActiveTab('attachments')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'attachments' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Fichiers</button>
                        </div>
                        <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/30">

                    {activeTab === 'details' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                            {/* Left Col: Main Job Info */}
                            <div className="lg:col-span-8 space-y-6">
                                <section className="card-section p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-700 mb-5 flex items-center gap-2">
                                        <Briefcase className="text-blue-500" size={20} /> L'Offre
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Entreprise</label>
                                            <div className="relative group">
                                                <Building className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.company}
                                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                                                    placeholder="Google, Thales..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Poste</label>
                                            <div className="relative group">
                                                <Briefcase className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.position}
                                                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                                                    placeholder="Frontend Developer..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Lieu</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.location}
                                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                                                    placeholder="Paris, Bordeaux..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Source</label>
                                            <div className="relative group">
                                                <Network className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    list="sources"
                                                    value={formData.source}
                                                    onChange={e => setFormData({ ...formData, source: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                                                    placeholder="LinkedIn, Indeed..."
                                                />
                                                <datalist id="sources">
                                                    <option value="LinkedIn" />
                                                    <option value="Indeed" />
                                                    <option value="Welcome to the Jungle" />
                                                    <option value="Site Entreprise" />
                                                    <option value="Cooptation" />
                                                </datalist>

                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Contrat</label>
                                            <select
                                                value={formData.contractType}
                                                onChange={e => setFormData({ ...formData, contractType: e.target.value as any })}
                                                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white font-semibold text-slate-700 cursor-pointer appearance-none"
                                            >
                                                <option value="CDI">CDI</option>
                                                <option value="CDD">CDD</option>
                                                <option value="Freelance">Freelance</option>
                                                <option value="Alternance">Alternance</option>
                                                <option value="Stage">Stage</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Télétravail</label>
                                            <select
                                                value={formData.remotePolicy}
                                                onChange={e => setFormData({ ...formData, remotePolicy: e.target.value as any })}
                                                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white font-semibold text-slate-700 cursor-pointer appearance-none"
                                            >
                                                <option value="Hybride">Hybride</option>
                                                <option value="Full Remote">Full Remote</option>
                                                <option value="Sur site">Sur site</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Salaire</label>
                                            <div className="relative group">
                                                <Euro className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.salary}
                                                    onChange={e => setFormData({ ...formData, salary: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                                                    placeholder="45-55k..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Lien de l'offre</label>
                                        <div className="relative group">
                                            <Globe className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                            <input
                                                type="url"
                                                value={formData.link}
                                                onChange={e => setFormData({ ...formData, link: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all font-semibold text-blue-600 placeholder:text-slate-300"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Recruiter Section - The "WOW" Feature */}
                                <section className="card-section p-6 bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <User size={120} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 mb-5 flex items-center gap-2 relative z-10">
                                        <User className="text-purple-500" size={20} /> Contact Recruteur
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nom du Contact</label>
                                            <div className="relative group">
                                                <User className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.contactName}
                                                    onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                                                    placeholder="Sarah Connor..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                                                <input
                                                    type="email"
                                                    value={formData.contactEmail}
                                                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                                                    placeholder="s.connor@skynet.com..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Téléphone</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                                                <input
                                                    type="tel"
                                                    value={formData.contactPhone}
                                                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                                                    placeholder="06 12 34 56 78..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">LinkedIn</label>
                                            <div className="relative group">
                                                <Linkedin className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                <input
                                                    type="url"
                                                    value={formData.contactLinkedin}
                                                    onChange={e => setFormData({ ...formData, contactLinkedin: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                                                    placeholder="linkedin.com/in/sarah..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right Col: Metadata */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-700 mb-5 flex items-center gap-2">
                                        <Target className="text-red-500" size={20} /> Suivi
                                    </h3>

                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Niveau d'intérêt</label>
                                            {renderStars()}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Statut</label>
                                            <StatusSelector
                                                value={formData.status}
                                                onChange={(status) => setFormData({ ...formData, status })}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Date</label>
                                            <div className="relative group">
                                                <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                                <input
                                                    type="date"
                                                    value={formData.date}
                                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 rounded-xl font-semibold text-slate-600 focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Prochaine étape</label>
                                            <div className="relative group">
                                                <ListTodo className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    value={formData.nextStep}
                                                    onChange={e => setFormData({ ...formData, nextStep: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 bg-orange-50/50 border-0 rounded-xl focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                                                    placeholder="Relancer mardi prochain..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                            <FileText className="text-blue-500" size={20} /> Sélectionner des documents
                                        </h3>
                                        <p className="text-slate-500 text-sm mb-6">
                                            Choisissez les documents à joindre à cette candidature depuis votre bibliothèque.
                                        </p>

                                        {loadingDocs ? (
                                            <div className="flex justify-center p-8">
                                                <Loader2 className="animate-spin text-blue-500" size={32} />
                                            </div>
                                        ) : libraryDocuments.length === 0 ? (
                                            <div className="text-center p-8 bg-white rounded-xl border border-dashed border-slate-300">
                                                <p className="text-slate-400 font-medium">Aucun document dans la bibliothèque.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {libraryDocuments.map((doc) => {
                                                    const isSelected = formData.attachments.some(att => att.url === doc.url);
                                                    return (
                                                        <div
                                                            key={doc.id}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        attachments: prev.attachments.filter(a => a.url !== doc.url)
                                                                    }));
                                                                } else {
                                                                    const newAtt: Attachment = {
                                                                        name: doc.name,
                                                                        url: doc.url || '',
                                                                        type: doc.type as any,
                                                                        size: parseFloat(doc.size) * 1024 * 1024 // approx conversion back to bytes if needed, or just store string
                                                                    };
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        attachments: [...prev.attachments, newAtt]
                                                                    }));
                                                                }
                                                            }}
                                                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 group ${isSelected
                                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                                : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                                                                }`}
                                                        >
                                                            <div className={`p-3 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                                <FileText size={20} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className={`font-bold truncate ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                                                    {doc.name}
                                                                </div>
                                                                <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                                                                    {doc.type} • {doc.size}
                                                                </div>
                                                            </div>
                                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-white bg-white text-blue-600' : 'border-slate-300'}`}>
                                                                {isSelected && <CheckCircle2 size={14} strokeWidth={4} />}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags Section */}
                                    <div className="space-y-3 pt-6 border-t border-slate-200">
                                        <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                            <ListTodo size={18} className="text-slate-400" /> Tags
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {(formData.tags || []).map((tag, idx) => (
                                                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 shadow-sm animate-in zoom-in-50">
                                                    #{tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, tags: formData.tags?.filter((_, i) => i !== idx) })}
                                                        className="hover:text-blue-800 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            ))}
                                            <input
                                                type="text"
                                                placeholder="Ajouter un tag (Entrée)..."
                                                className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-400 placeholder:text-slate-500 min-w-[150px]"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const val = e.currentTarget.value.trim().replace(/^#/, '');
                                                        if (val && !formData.tags?.includes(val)) {
                                                            setFormData({ ...formData, tags: [...(formData.tags || []), val] });
                                                            e.currentTarget.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'description' && (
                        <div className="space-y-6 h-full">
                            <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col">
                                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <FileText className="text-slate-400" size={20} /> Description & Notes
                                </h3>

                                <div className="space-y-4 flex-1 flex flex-col">
                                    <div className="space-y-2 flex-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Description du poste</label>
                                        <textarea
                                            value={formData.jobDescription}
                                            onChange={e => setFormData({ ...formData, jobDescription: e.target.value })}
                                            className="w-full h-48 p-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all text-slate-700 placeholder:text-slate-300 resize-none font-medium leading-relaxed"
                                            placeholder="Copiez-collez ici la description de l'offre pour l'avoir toujours sous la main..."
                                        />

                                        {/* AI Features Zone (Stub) */}
                                        <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-purple-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h4 className="font-bold text-purple-700 flex items-center gap-2">✨ Job Score (IA)</h4>
                                                    <p className="text-xs text-purple-500">Analysez la compatibilité de votre profil avec cette offre.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleAnalyzeJob}
                                                    disabled={isAnalyzing}
                                                    className="px-3 py-1.5 bg-white text-purple-600 font-bold text-sm rounded-lg shadow-sm border border-purple-100 hover:bg-purple-50 disabled:opacity-50"
                                                >
                                                    {isAnalyzing ? '...' : 'Analyser'}
                                                </button>
                                            </div>
                                            {aiAnalysis && (
                                                <div className="mt-3 p-3 bg-white/60 rounded-lg text-sm text-slate-700 whitespace-pre-line border border-purple-100 animate-in fade-in">
                                                    {aiAnalysis}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mes Notes Personnelles</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                            className="w-full h-32 p-4 bg-yellow-50/50 border-0 rounded-xl focus:ring-2 focus:ring-yellow-100 focus:bg-white transition-all text-slate-700 placeholder:text-slate-300 resize-none font-medium leading-relaxed"
                                            placeholder="Questions à poser, impressions, stack technique..."
                                        />

                                        {/* AI Features Zone (Stub) */}
                                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h4 className="font-bold text-blue-700 flex items-center gap-2">📧 Magic Email (IA)</h4>
                                                    <p className="text-xs text-blue-500">Générez une lettre de motivation ou un mail de relance.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleGenerateEmail}
                                                    disabled={isAnalyzing}
                                                    className="px-3 py-1.5 bg-white text-blue-600 font-bold text-sm rounded-lg shadow-sm border border-blue-100 hover:bg-blue-50 disabled:opacity-50"
                                                >
                                                    {isAnalyzing ? '...' : 'Générer'}
                                                </button>
                                            </div>
                                            {generatedEmail && (
                                                <div className="mt-3">
                                                    <textarea
                                                        readOnly
                                                        value={generatedEmail}
                                                        className="w-full h-40 p-3 bg-white/80 rounded-lg text-sm text-slate-700 border border-blue-100 resize-none focus:outline-none"
                                                    />
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(generatedEmail); alert('Copié !') }}
                                                        className="mt-2 text-xs text-blue-600 font-bold hover:underline"
                                                    >
                                                        Copier le texte
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'attachments' && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center">
                                <p className="text-slate-500">Pour ajouter des fichiers, utilisez la section "Sélectionner des documents" dans l'onglet Détails.</p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white border-t border-slate-100 shrink-0 flex justify-end gap-3 rounded-b-3xl">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isScoring}
                        className={`px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 ${isScoring ? 'bg-slate-400 cursor-not-allowed' : isEditing ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                    >
                        {isScoring ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Analyse IA en cours...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                {isEditing ? 'Enregistrer les modifications' : 'Créer la candidature'}
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
};
