import { useState } from 'react';
import MagicFillService from '../services/magicFillService';

interface UseMagicFillReturn {
    extractJobOffer: (text: string) => Promise<void>;
    result: any;
    isLoading: boolean;
    error: string | null;
    reset: () => void;
}

export const useMagicFill = (): UseMagicFillReturn => {
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const extractJobOffer = async (text: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const offer = await MagicFillService.extractFromText(text);
            if (offer) {
                setResult(offer);
            } else {
                setError('Aucune information extraite. Vérifiez le texte.');
            }
        } catch (err) {
            setError('Erreur technique: ' + (err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setError(null);
        setIsLoading(false);
    };

    return { extractJobOffer, result, isLoading, error, reset };
};
