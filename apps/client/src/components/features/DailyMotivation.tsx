import { useState, useMemo } from 'react';
import { Quote, RefreshCw, Heart } from 'lucide-react';

const MOTIVATIONS = [
    { text: "Le succès consiste à aller d'échec en échec sans perdre son enthousiasme.", author: "Winston Churchill" },
    { text: "La seule façon de faire du bon travail est d'aimer ce que vous faites.", author: "Steve Jobs" },
    { text: "Croyez en vous-même et en tout ce que vous êtes. Sachez qu'il y a quelque chose à l'intérieur de vous qui est plus grand que n'importe quel obstacle.", author: "Christian D. Larson" },
    { text: "N'attendez pas que les opportunités frappent à votre porte. Construisez une porte.", author: "Milton Berle" },
    { text: "Votre travail va occuper une grande partie de votre vie, et la seule façon d'être vraiment satisfait est de faire ce que vous croyez être du bon travail.", author: "Steve Jobs" },
    { text: "Chaque refus vous rapproche d'une acceptation.", author: "Inconnu" },
    { text: "Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est maintenant.", author: "Proverbe chinois" },
    { text: "Ne jugez pas chaque journée par la récolte que vous faites mais par les graines que vous plantez.", author: "Robert Louis Stevenson" },
    { text: "La persévérance n'est pas une longue course ; c'est beaucoup de petites courses les unes après les autres.", author: "Walter Elliott" },
    { text: "Rien n'est impossible, le mot lui-même dit 'I'm possible' !", author: "Audrey Hepburn" },
];

export const DailyMotivation = () => {
    const [index, setIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONS.length));
    const [animate, setAnimate] = useState(false);

    const quote = MOTIVATIONS[index];

    const handleRefresh = () => {
        setAnimate(true);
        setTimeout(() => {
            let nextIndex = Math.floor(Math.random() * MOTIVATIONS.length);
            if (nextIndex === index) nextIndex = (nextIndex + 1) % MOTIVATIONS.length;
            setIndex(nextIndex);
            setAnimate(false);
        }, 300);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden group">
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
                <Quote size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-white/10">
                        <Heart size={12} className="text-rose-400" /> Motivation du jour
                    </div>
                    <button
                        onClick={handleRefresh}
                        className={`p-2 hover:bg-white/10 rounded-xl transition-all ${animate ? 'rotate-180' : ''}`}
                    >
                        <RefreshCw size={18} className="text-white/60" />
                    </button>
                </div>

                <div className={`transition-all duration-300 ${animate ? 'opacity-0 transform -translate-y-2' : 'opacity-100 transform translate-y-0'}`}>
                    <p className="text-lg font-medium leading-relaxed mb-4 italic">
                        "{quote.text}"
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-0.5 bg-blue-300/30 rounded-full"></div>
                        <p className="text-sm font-bold text-blue-200">
                            {quote.author}
                        </p>
                    </div>
                </div>
            </div>

            {/* Micro-interaction */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-white/40 transition-all duration-700"></div>
        </div>
    );
};
