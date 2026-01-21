import React, { useState, useMemo } from 'react';
import {
    Search, Plus, User, Mail, Phone, Linkedin, Building,
    MoreVertical, Edit2, Trash2, ExternalLink, Filter, X, Loader2
} from 'lucide-react';
import { useContacts, type Contact } from '../hooks/useContacts';
import { ContactFormModal } from '../components/features/ContactFormModal';

export const ContactsPage = () => {
    const { contacts, loading, addContact, updateContact, deleteContact } = useContacts();
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined);

    // Filtered contacts
    const filteredContacts = useMemo(() => {
        return contacts.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [contacts, searchTerm]);

    const companies = useMemo(() => {
        const unique = new Set(contacts.map(c => c.company).filter(Boolean));
        return Array.from(unique);
    }, [contacts]);

    const handleEdit = (contact: Contact) => {
        setSelectedContact(contact);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce contact ?')) {
            await deleteContact(id);
        }
    };

    const handleFormSubmit = async (data: any) => {
        if (selectedContact) {
            await updateContact(selectedContact.id, data);
        } else {
            await addContact(data);
        }
        setShowForm(false);
        setSelectedContact(undefined);
    };

    const closeForm = () => {
        setShowForm(false);
        setSelectedContact(undefined);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                        Réseau & <span className="text-blue-600">Contacts</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Gère tes relations avec les recruteurs et ingénieurs.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1"
                >
                    <Plus size={20} strokeWidth={3} />
                    Nouveau Contact
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-5">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                        <User size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{contacts.length}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Contacts</div>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-5">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Building size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{companies.length}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Entreprises</div>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-5">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Linkedin size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {contacts.filter(c => c.linkedin).length}
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profils LinkedIn</div>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher un nom, une entreprise, un email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl text-slate-600 dark:text-slate-300 font-bold hover:border-slate-200 transition-all">
                    <Filter size={20} />
                    Filtres
                </button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            ) : filteredContacts.length === 0 ? (
                <div className="glass-panel text-center py-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Aucun contact trouvé</h3>
                    <p className="text-slate-400">Commence à construire ton réseau en ajoutant ton premier contact.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContacts.map(contact => (
                        <div key={contact.id} className="glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 hover:shadow-xl hover:-translate-y-1 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/20">
                                    {contact.name.charAt(0)}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(contact)}
                                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(contact.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{contact.name}</h3>
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm mb-4">
                                <Building size={14} />
                                {contact.company || 'Entreprise non spécifiée'}
                            </div>

                            {contact.role && (
                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
                                    {contact.role}
                                </div>
                            )}

                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                {contact.email && (
                                    <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-sm text-slate-500 hover:text-blue-600 transition-colors">
                                        <Mail size={16} className="text-slate-400" />
                                        {contact.email}
                                    </a>
                                )}
                                {contact.linkedin && (
                                    <a href={contact.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-slate-500 hover:text-blue-600 transition-colors">
                                        <Linkedin size={16} className="text-slate-400" />
                                        Profil LinkedIn
                                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                )}
                                {contact.phone && (
                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <Phone size={16} className="text-slate-400" />
                                        {contact.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ContactFormModal
                isOpen={showForm}
                onClose={closeForm}
                onSubmit={handleFormSubmit}
                initialData={selectedContact}
            />
        </div>
    );
};
