import React, { createContext, useContext, useState, useEffect } from 'react';
import { type LocalAIConfig, DEFAULT_OLLAMA_CONFIG } from '../lib/ollama';

interface AiSettings extends LocalAIConfig {
    useCloudFallback: boolean;
}

interface AiConfigContextType {
    config: AiSettings;
    updateConfig: (newConfig: Partial<AiSettings>) => void;
    resetConfig: () => void;
}

const DEFAULT_SETTINGS: AiSettings = {
    ...DEFAULT_OLLAMA_CONFIG,
    useCloudFallback: false
};

const AiConfigContext = createContext<AiConfigContextType>({
    config: DEFAULT_SETTINGS,
    updateConfig: () => { },
    resetConfig: () => { }
});

export const useAiConfig = () => useContext(AiConfigContext);

export const AiConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<AiSettings>(() => {
        const saved = localStorage.getItem('ai_settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    useEffect(() => {
        localStorage.setItem('ai_settings', JSON.stringify(config));
    }, [config]);

    // AUTO-MIGRATION: Detect old localhost default and switch to NodeCore
    useEffect(() => {
        if (config.baseUrl.includes("localhost:11434")) {
            console.log("[Auto-Migration] Switching from Localhost to NodeCore...");
            setConfig(prev => ({
                ...prev,
                baseUrl: "https://ai.nodecore.dev/v1",
                model: "llama3.1:8b"
            }));
        }
    }, []);

    const updateConfig = (newConfig: Partial<AiSettings>) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    };

    const resetConfig = () => {
        setConfig(DEFAULT_SETTINGS);
    };

    return (
        <AiConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
            {children}
        </AiConfigContext.Provider>
    );
};
