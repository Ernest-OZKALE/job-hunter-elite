import { useState } from 'react';
import { Download, ExternalLink, Loader2, Database } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';

interface FileLinkProps {
    file: {
        name: string;
        url: string;
        size?: number;
    };
    className?: string;
}

export const FileLink = ({ file, className = "" }: FileLinkProps) => {
    const { getFileBlob } = useStorage();
    const [loading, setLoading] = useState(false);

    const isFirestore = file.url.startsWith('firestore://');
    const isFirebaseStorage = file.url.startsWith('https://firebasestorage');

    // Legacy storage or external link
    const isStandardLink = !isFirestore;

    const handleDownload = async (e: React.MouseEvent) => {
        if (!isFirestore) return; // Let default <a> behavior handle it
        e.preventDefault();

        setLoading(true);
        try {
            const base64 = await getFileBlob(file.url);
            if (base64) {
                // Create a fake link to trigger download
                const link = document.createElement("a");
                link.href = base64;
                link.download = file.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert("Fichier introuvable.");
            }
        } catch (error) {
            console.error("Download failed", error);
            alert("Erreur lors du téléchargement.");
        } finally {
            setLoading(false);
        }
    };

    if (isStandardLink) {
        return (
            <a href={file.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 hover:underline truncate group ${className}`} title={file.name}>
                <span className="truncate flex items-center gap-1.5">
                    {file.name}
                    {!isFirebaseStorage && <ExternalLink size={10} className="opacity-50" />}
                </span>
            </a>
        );
    }

    return (
        <button
            type="button"
            onClick={handleDownload}
            disabled={loading}
            className={`flex items-center gap-2 hover:text-blue-600 truncate text-left ${className}`}
            title="Cliquer pour télécharger depuis la base de données"
        >
            <span className="truncate flex items-center gap-1.5">
                {file.name}
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded flex items-center gap-0.5 border border-purple-200">
                    <Database size={8} /> DB
                </span>
            </span>
            {loading ? <Loader2 size={12} className="animate-spin text-slate-400" /> : <Download size={12} className="text-slate-300 opacity-0 group-hover:opacity-100" />}
        </button>
    );
};
