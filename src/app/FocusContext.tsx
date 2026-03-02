"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface ScanHistoryItem {
    id: string;
    appName: string;
    date: string;
    riskScore: number;
    riskCount: number;
}

interface FocusContextType {
    userName: string;
    setUserName: (name: string) => void;
    aiPersona: string;
    setAiPersona: (persona: string) => void;
    riskSensitivity: string;
    setRiskSensitivity: (sensitivity: string) => void;
    profileImage: string;
    setProfileImage: (img: string) => void;
    storageMode: "Local" | "WipeOnClose";
    setStorageMode: (mode: "Local" | "WipeOnClose") => void;
    scanHistory: ScanHistoryItem[];
    addScanToHistory: (item: ScanHistoryItem) => void;
    dailyScans: number;
    canScan: boolean;
    incrementScanCount: () => void;
    feedback: string[];
    addFeedback: (msg: string) => void;
    resetContext: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

const DAILY_LIMIT = 10;

function getToday(): string {
    return new Date().toISOString().slice(0, 10);
}

export function FocusProvider({ children }: { children: React.ReactNode }) {
    const [userName, setUserName] = useState("JD Doe");
    const [aiPersona, setAiPersona] = useState("Balanced Advisor");
    const [riskSensitivity, setRiskSensitivity] = useState("High");
    const [profileImage, setProfileImage] = useState("");
    const [storageMode, setStorageMode] = useState<"Local" | "WipeOnClose">("Local");
    const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
    const [dailyScans, setDailyScans] = useState(0);
    const [lastScanDate, setLastScanDate] = useState("");
    const [feedback, setFeedback] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const storedName = localStorage.getItem("lexis_userName");
            const storedPersona = localStorage.getItem("lexis_aiPersona");
            const storedSensitivity = localStorage.getItem("lexis_riskSensitivity");
            const storedImage = localStorage.getItem("lexis_profileImage");
            const storedStorage = localStorage.getItem("lexis_storageMode");
            const storedHistory = localStorage.getItem("lexis_scanHistory");
            const storedDailyScans = localStorage.getItem("lexis_dailyScans");
            const storedLastDate = localStorage.getItem("lexis_lastScanDate");
            const storedFeedback = localStorage.getItem("lexis_feedback");

            if (storedName) setUserName(storedName);
            if (storedPersona) setAiPersona(storedPersona);
            if (storedSensitivity) setRiskSensitivity(storedSensitivity);
            if (storedImage) setProfileImage(storedImage);
            if (storedStorage) setStorageMode(storedStorage as "Local" | "WipeOnClose");
            if (storedHistory) setScanHistory(JSON.parse(storedHistory));
            if (storedFeedback) setFeedback(JSON.parse(storedFeedback));

            // Reset daily count if it's a new day
            const today = getToday();
            if (storedLastDate && storedLastDate === today && storedDailyScans) {
                setDailyScans(parseInt(storedDailyScans, 10));
            } else {
                setDailyScans(0);
            }
            setLastScanDate(today);
        } catch (e) {
            console.error("Failed to load from localStorage", e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage when state changes
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("lexis_userName", userName);
        localStorage.setItem("lexis_aiPersona", aiPersona);
        localStorage.setItem("lexis_riskSensitivity", riskSensitivity);
        localStorage.setItem("lexis_profileImage", profileImage);
        localStorage.setItem("lexis_storageMode", storageMode);
        localStorage.setItem("lexis_scanHistory", JSON.stringify(scanHistory));
        localStorage.setItem("lexis_dailyScans", dailyScans.toString());
        localStorage.setItem("lexis_lastScanDate", lastScanDate);
        localStorage.setItem("lexis_feedback", JSON.stringify(feedback));
    }, [userName, aiPersona, riskSensitivity, profileImage, storageMode, scanHistory, dailyScans, lastScanDate, feedback, isLoaded]);

    // WipeOnClose: attach beforeunload listener
    useEffect(() => {
        if (storageMode !== "WipeOnClose") return;

        const handleBeforeUnload = () => {
            const keys = [
                "lexis_userName", "lexis_aiPersona", "lexis_riskSensitivity",
                "lexis_profileImage", "lexis_storageMode", "lexis_scanHistory",
                "lexis_dailyScans", "lexis_lastScanDate", "lexis_feedback"
            ];
            keys.forEach(k => localStorage.removeItem(k));
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [storageMode]);

    const addScanToHistory = useCallback((item: ScanHistoryItem) => {
        setScanHistory(prev => [item, ...prev]);
    }, []);

    const incrementScanCount = useCallback(() => {
        const today = getToday();
        if (lastScanDate !== today) {
            setDailyScans(1);
            setLastScanDate(today);
        } else {
            setDailyScans(prev => prev + 1);
        }
    }, [lastScanDate]);

    const canScan = dailyScans < DAILY_LIMIT;

    const addFeedback = useCallback((msg: string) => {
        setFeedback(prev => [...prev, msg]);
        console.log("[LEXIS Feedback]:", msg);
    }, []);

    const resetContext = () => {
        const keys = [
            "lexis_userName", "lexis_aiPersona", "lexis_riskSensitivity",
            "lexis_profileImage", "lexis_storageMode", "lexis_scanHistory",
            "lexis_dailyScans", "lexis_lastScanDate", "lexis_feedback"
        ];
        keys.forEach(k => localStorage.removeItem(k));
        setUserName("JD Doe");
        setAiPersona("Balanced Advisor");
        setRiskSensitivity("High");
        setProfileImage("");
        setStorageMode("Local");
        setScanHistory([]);
        setDailyScans(0);
        setFeedback([]);
    };

    return (
        <FocusContext.Provider value={{
            userName, setUserName,
            aiPersona, setAiPersona,
            riskSensitivity, setRiskSensitivity,
            profileImage, setProfileImage,
            storageMode, setStorageMode,
            scanHistory, addScanToHistory,
            dailyScans, canScan, incrementScanCount,
            feedback, addFeedback,
            resetContext
        }}>
            {children}
        </FocusContext.Provider>
    );
}

export function useFocus() {
    const context = useContext(FocusContext);
    if (context === undefined) {
        throw new Error("useFocus must be used within a FocusProvider");
    }
    return context;
}
