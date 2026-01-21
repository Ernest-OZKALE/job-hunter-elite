import { Loader2 } from "lucide-react";

export const LoadingScreen = () => {
    return (
        <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">
            <Loader2 className="animate-spin mr-2" /> Chargement...
        </div>
    );
};
