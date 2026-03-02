"use client";

import { motion } from "framer-motion";
import {
    User,
    HardDrive,
    Cloud,
    Moon,
    Sun,
    Trash2,
    Shield,
    Fingerprint,
    Power,
    Edit2,
    BrainCircuit,
    Crosshair,
    Camera,
    Bug,
    Send,
    CheckCircle2,
    XCircle,
    Database
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useFocus } from "../FocusContext";
import { sensoryClick } from "../utils/sensory";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function IdentityDashboard() {
    const {
        userName, setUserName,
        aiPersona, setAiPersona,
        riskSensitivity, setRiskSensitivity,
        profileImage, setProfileImage,
        storageMode, setStorageMode,
        scanHistory,
        addFeedback,
        resetContext
    } = useFocus();

    const [mounted, setMounted] = useState(false);
    const [bugReport, setBugReport] = useState("");
    const [bugSent, setBugSent] = useState(false);
    const [debugLogs, setDebugLogs] = useState<{ timestamp: string, file: string, error: string }[]>([]);
    const [showDebug, setShowDebug] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        const logs = JSON.parse(localStorage.getItem("lexis_debug_logs") || "[]");
        setDebugLogs(logs);
    }, []);

    const hasGroqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY ? true : false;

    const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        sensoryClick();
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setProfileImage(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleBugSubmit = () => {
        if (!bugReport.trim()) return;
        sensoryClick();
        addFeedback(bugReport.trim());
        setBugReport("");
        setBugSent(true);
        setTimeout(() => setBugSent(false), 3000);
    };

    if (!mounted) return null;

    return (
        <main className="min-h-screen p-6 md:p-12 lg:p-20 flex flex-col items-center relative pt-12 pb-32">
            <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-[150px] pointer-events-none" />

            <header className="w-full max-w-3xl mb-12 flex flex-col items-center text-center relative z-10">
                {/* Profile Picture */}
                <div className="relative group mb-6">
                    <div className="w-24 h-24 glass-cyan rounded-full flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-12 h-12 text-neon-cyan drop-shadow-[0_0_15px_rgba(0,243,255,1)]" />
                        )}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 bg-obsidian rounded-full p-2 border border-white/10 hover:bg-neon-cyan/20 transition-colors cursor-pointer"
                    >
                        <Camera className="w-4 h-4 text-neon-cyan" />
                    </motion.button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageUpload}
                    />
                </div>

                <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Identity Core</h1>
                <p className="text-white/50 max-w-sm px-4 flex items-center justify-center gap-2 group">
                    <input
                        className="bg-transparent text-center border-b border-white/10 focus:border-neon-cyan w-full max-w-[180px] outline-none transition-colors text-white/80"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Your Name"
                    />
                    <Edit2 className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                </p>
                <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass bg-white/5 border-white/10 text-xs font-semibold text-white/70 uppercase tracking-widest">
                        <Shield className="w-3 h-3 text-neon-cyan" />
                        Pro Tier Active
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass bg-white/5 border-white/10 text-xs font-semibold text-white/50 uppercase tracking-widest">
                        <Database className="w-3 h-3" />
                        {scanHistory.length} scans
                    </div>
                </div>
            </header>

            <div className="w-full max-w-3xl flex flex-col gap-4 relative z-10 pb-20">

                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2 pl-2">Engine Rules</h3>

                {/* AI Persona Card */}
                <motion.div whileHover={{ scale: 1.01 }} className="glass p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-neon-cyan">
                            <BrainCircuit className="w-6 h-6 glow-icon" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">AI Persona Vector</h4>
                            <p className="text-sm text-white/50">How LEXIS communicates.</p>
                        </div>
                    </div>

                    <select
                        className="glass bg-obsidian rounded-xl px-4 py-2 text-sm font-semibold border-white/10 text-white hover:border-white/20 transition-colors outline-none cursor-pointer"
                        value={aiPersona}
                        onChange={(e) => { setAiPersona(e.target.value); sensoryClick(); }}
                    >
                        <option value="Balanced Advisor">Balanced Advisor</option>
                        <option value="Aggressive Litigator">Aggressive Litigator</option>
                        <option value="Protective Shield">Protective Shield</option>
                    </select>
                </motion.div>

                {/* Risk Sensitivity Card */}
                <motion.div whileHover={{ scale: 1.01 }} className="glass p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-warm-amber">
                            <Crosshair className="w-6 h-6 drop-shadow-[0_0_10px_rgba(255,157,0,0.5)]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Risk Sensitivity</h4>
                            <p className="text-sm text-white/50">Threshold for triggering alerts.</p>
                        </div>
                    </div>

                    <div className="flex items-center p-1 glass bg-obsidian rounded-xl border-white/10">
                        {["Low", "Medium", "High"].map((level) => (
                            <motion.button
                                key={level}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setRiskSensitivity(level); sensoryClick(); }}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all w-20 text-center",
                                    riskSensitivity === level
                                        ? "bg-white/10 text-white shadow-inner"
                                        : "text-white/40 hover:text-white/70"
                                )}
                            >
                                {level}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2 mt-8 pl-2">System</h3>

                {/* API Status Card */}
                <motion.div whileHover={{ scale: 1.01 }} className="glass p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-white/50">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">LEXIS Neural Architecture</h4>
                            <p className="text-sm text-white/50">Server-Side Intelligence Engine</p>
                        </div>
                    </div>

                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border",
                        hasGroqKey ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-500"
                    )}>
                        {hasGroqKey ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {hasGroqKey ? "Connected" : "Missing Variable"}
                    </div>
                </motion.div>

                {/* Storage Toggle Card - FUNCTIONAL */}
                <motion.div whileHover={{ scale: 1.01 }} className="glass p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-white/50">
                            <HardDrive className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Data Vault Storage</h4>
                            <p className="text-sm text-white/50">
                                {storageMode === "Local" ? "Data persists between sessions." : "Data is wiped when the browser closes."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center p-1 glass bg-obsidian rounded-xl border-white/10">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setStorageMode("Local"); sensoryClick(); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors w-24 justify-center",
                                storageMode === "Local" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
                            )}
                        >
                            <HardDrive className="w-4 h-4" /> Local
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setStorageMode("WipeOnClose"); sensoryClick(); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors w-24 justify-center",
                                storageMode === "WipeOnClose" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
                            )}
                        >
                            <Cloud className="w-4 h-4" /> Wipe
                        </motion.button>
                    </div>
                </motion.div>

                {/* Theme Toggle Card */}
                <motion.div whileHover={{ scale: 1.01 }} className="glass p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-50 pointer-events-none">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-white/50">
                            <Moon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Lexis Theme <span className="text-xs uppercase bg-white/10 px-2 py-0.5 rounded text-white border border-white/10 ml-2">Soon</span></h4>
                            <p className="text-sm text-white/50">Vibe alignment</p>
                        </div>
                    </div>
                    <div className="flex items-center p-1 glass bg-obsidian rounded-xl border-white/10">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 text-white w-24 justify-center">
                            <Moon className="w-4 h-4" /> Obsidian
                        </div>
                    </div>
                </motion.div>

                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2 mt-8 pl-2">Report & Feedback</h3>

                {/* Bug Reporter */}
                <motion.div whileHover={{ scale: 1.01 }} className="glass p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-warm-amber">
                            <Bug className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Report Issue</h4>
                            <p className="text-sm text-white/50">Describe any bugs or suggestions.</p>
                        </div>
                    </div>

                    <textarea
                        value={bugReport}
                        onChange={(e) => setBugReport(e.target.value)}
                        placeholder="Describe the issue or share a feature request..."
                        className="w-full h-24 bg-obsidian/50 border border-white/5 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-neon-cyan/50 transition-colors resize-none text-sm"
                    />

                    <div className="flex items-center justify-between">
                        {bugSent && (
                            <motion.p
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-sm text-green-400 flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Feedback logged. Thank you!
                            </motion.p>
                        )}
                        <div className="ml-auto">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBugSubmit}
                                disabled={!bugReport.trim()}
                                className="pill-btn py-2 px-5 text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" /> Submit
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2 mt-8 pl-2">Danger Zone</h3>

                {/* Clear All Data Card */}
                <motion.div whileHover={{ scale: 1.01 }} className="glass-crimson p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-red-500/20">
                    <div className="flex gap-4">
                        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500 shrink-0">
                            <Power className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-red-400 text-lg">Core Reset</h4>
                            <p className="text-sm text-white/50">
                                Permanently wipe all Identity data, Scan History, Profile, and AI settings from browser memory.
                            </p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { resetContext(); sensoryClick(); }}
                        className="pill-btn py-3 px-6 shrink-0 bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20 hover:text-white hover:border-red-500/50 flex items-center gap-2 font-bold justify-center transition-all"
                    >
                        <Trash2 className="w-5 h-5" />
                        Wipe Memory
                    </motion.button>
                </motion.div>

                {/* Debug Console Toggler */}
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => { setShowDebug(!showDebug); sensoryClick(); }}
                        className="text-[10px] uppercase font-bold tracking-widest text-white/10 hover:text-white/30 transition-colors"
                    >
                        {showDebug ? "Hide Neural Logs" : "Show Neural Logs"}
                    </button>
                </div>

                {showDebug && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="glass p-4 mt-2 font-mono text-[10px] overflow-hidden border border-white/5"
                    >
                        <h5 className="text-neon-cyan mb-2 uppercase tracking-widest font-bold">Extraction Debug Logs</h5>
                        {debugLogs.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {debugLogs.map((log, i) => (
                                    <div key={i} className="border-b border-white/5 pb-2 last:border-0">
                                        <div className="text-white/30">[{log.timestamp}]</div>
                                        <div className="text-white/80">File: {log.file}</div>
                                        <div className="text-red-400/80">{log.error}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-white/20">No neural errors logged in recent cycles.</div>
                        )}
                        <button
                            onClick={() => { localStorage.removeItem("lexis_debug_logs"); setDebugLogs([]); sensoryClick(); }}
                            className="mt-4 text-red-400/50 hover:text-red-400 underline transition-colors"
                        >
                            Flush Neural History
                        </button>
                    </motion.div>
                )}

            </div>
        </main>
    );
}
