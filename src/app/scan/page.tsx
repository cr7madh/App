"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
    ScanLine,
    ShieldAlert,
    FileText,
    AlertTriangle,
    EyeOff,
    Briefcase,
    DollarSign,
    Scale,
    PenTool,
    Upload,
    X,
    ThumbsUp,
    ThumbsDown,
    MapPin,
    AlertCircle,
    CheckCircle,
    Share2,
    Copy,
    ExternalLink
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useFocus, type ScanHistoryItem } from "../FocusContext";
import { sensoryClick, sensorySuccess, sensoryRedFlag } from "../utils/sensory";
import { parsePdfClientSide } from "../utils/parsePdf";
import { parseDocxClientSide } from "../utils/parseDocx";
import { analyzeLegalDocument, draftNegotiationEmail, type Risk, type ScanResult } from "../utils/lexisEngine";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const IconMap: Record<string, React.ElementType> = {
    Trap: ThumbsDown,
    "Hidden Fee": DollarSign,
    "Exit Plan": MapPin,
    Alert: AlertCircle,
    Privacy: EyeOff,
    Default: ShieldAlert,
};

// Risk interface is now imported from lexisEngine

export default function ScanEngine() {
    const [text, setText] = useState("");
    const [fileName, setFileName] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [results, setResults] = useState<ScanResult | null>(null);
    const [error, setError] = useState("");
    const [showQuotaModal, setShowQuotaModal] = useState(false);
    const [showCounterModal, setShowCounterModal] = useState(false);
    const [counterOfferText, setCounterOfferText] = useState("");

    // Negotiation State
    const [isNegotiating, setIsNegotiating] = useState<number | null>(null);
    const [negotiationEmail, setNegotiationEmail] = useState<{ [key: number]: string }>({});

    const { canScan, incrementScanCount, addScanToHistory, dailyScans } = useFocus();

    // Multi-Format Dropzone Logic (PDF & DOCX)
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        sensoryClick();
        setIsParsing(true);
        setError("");
        setFileName(file.name);

        try {
            let extractedText = "";
            const fileType = file.type;

            if (fileType === "application/pdf") {
                const result = await parsePdfClientSide(file);
                extractedText = result.text || "";
            } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx")) {
                const result = await parseDocxClientSide(file);
                extractedText = result.text || "";
            } else {
                throw new Error("Unsupported file format. Please upload a PDF or DOCX.");
            }

            setText(extractedText);
            if (!extractedText.trim()) {
                setError(`No readable text found in ${file.name}. This document may be image-based or empty.`);
                setFileName("");
            }
        } catch (err: any) {
            console.error("Document parse error:", err);
            const debugMsg = `ERROR: ${err.message || "Unknown parsing failure"}`;
            setError(`Failed to extract text from ${file.name}. ${err.message || ""}`);

            // Fallback: Log to a "hidden" debug session (localStorage for now)
            const logs = JSON.parse(localStorage.getItem("lexis_debug_logs") || "[]");
            logs.push({ timestamp: new Date().toISOString(), file: file.name, error: debugMsg });
            localStorage.setItem("lexis_debug_logs", JSON.stringify(logs.slice(-10))); // Keep last 10

            setFileName("");
        } finally {
            setIsParsing(false);
        }
    }, [sensoryClick]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
        },
        maxFiles: 1,
        noClick: !!text,
    });

    const handleScan = async () => {
        if (!text.trim()) {
            setError("Please paste some legal text or upload a PDF to scan.");
            return;
        }
        if (!canScan) {
            setShowQuotaModal(true);
            return;
        }

        sensoryClick();
        setIsScanning(true);
        setError("");
        setResults(null); // Clear previous results
        setNegotiationEmail({}); // Clear previous negotiation emails

        try {
            const scanResult = await analyzeLegalDocument(text);

            if (!scanResult || !scanResult.risks || scanResult.risks.length === 0) {
                setError("The AI analysis came back empty. Try pasting a larger segment of text.");
                return;
            }

            setResults(scanResult);
            sensorySuccess();

            // Check for red flags and trigger alert haptics
            const hasHighRisk = scanResult.verdict.score < 50;
            if (hasHighRisk) {
                setTimeout(() => sensoryRedFlag(), 500);
            }

            // Track scan
            incrementScanCount();
            addScanToHistory({
                id: Date.now().toString(),
                appName: fileName || "Pasted Document",
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
                riskScore: scanResult.verdict.score,
                riskCount: scanResult.risks.length
            });

        } catch (err: any) {
            console.error("Scan Error:", err);
            setError(err.message || "Failed to initiate Risk Audit.");
            sensoryRedFlag();
        } finally {
            setIsScanning(false);
        }
    };

    const handleNegotiate = async (index: number, risk: Risk) => {
        sensoryClick();
        setIsNegotiating(index);

        try {
            const email = await draftNegotiationEmail(risk.title, risk.explanation);
            setNegotiationEmail(prev => ({ ...prev, [index]: email }));
        } catch (err) {
            console.error("Negotiation Error:", err);
            setError("Failed to draft negotiation. Lexis Engine Offline.");
        } finally {
            setIsNegotiating(null);
        }
    };

    const handleShare = async (risk: Risk) => {
        sensoryClick();
        const shareData = {
            title: `Risk Alert: ${risk.title}`,
            text: `Heads up! I found a risk in this contract: ${risk.title}. Explanation: ${risk.explanation}`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.text);
                alert("Share link copied to clipboard!");
            }
        } catch (err) {
            console.warn("Share failed:", err);
        }
    };

    const handleShowCounterOffer = () => {
        sensoryClick();
        const fullAudit = results?.risks.map(r => `• ${r.title}: ${r.explanation}`).join('\n') || "";
        setCounterOfferText(`Hey! I scanned this contract with LEXIS CORE. Here are the issues:\n\n${fullAudit}\n\nCan we adjust these terms?`);
        setShowCounterModal(true);
    };

    return (
        <main className="min-h-screen p-6 md:p-12 lg:p-20 flex flex-col items-center relative pt-12 pb-32">
            <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-[150px] pointer-events-none" />

            <header className="w-full max-w-4xl mb-8 flex flex-col items-center text-center relative z-10">
                <motion.div whileHover={{ scale: 1.05 }} className="w-16 h-16 glass-cyan rounded-full flex items-center justify-center mb-6">
                    <ScanLine className="w-8 h-8 text-neon-cyan glow-icon" />
                </motion.div>
                <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">LEXIS Engine</h1>
                <p className="text-white/50 text-sm mb-8">
                    Powered by LEXIS Neural Architecture. Paste your terms or upload a
                    PDF. The Core will identify risks instantly.
                </p>
                <div className="mt-3 text-xs text-white/30 uppercase tracking-widest">
                    {dailyScans}/{10} Daily Scans Used
                </div>
            </header>

            <div className="w-full max-w-4xl relative z-10 flex flex-col gap-6">
                {/* Input Zone */}
                <div className="glass p-6 w-full flex flex-col gap-4 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-neon-cyan" />
                            <span className="font-semibold text-white/80">Document Text</span>
                        </div>
                        {fileName && (
                            <div className="flex items-center gap-2 text-xs text-neon-cyan bg-neon-cyan/10 px-3 py-1 rounded-full border border-neon-cyan/20">
                                <FileText className="w-3 h-3" />
                                {fileName}
                                <button onClick={() => { setFileName(""); setText(""); sensoryClick(); }}>
                                    <X className="w-3 h-3 hover:text-white transition-colors" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Dropzone / Textarea */}
                    {!text ? (
                        <div
                            {...getRootProps()}
                            className={cn(
                                "w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative",
                                isDragActive
                                    ? "border-neon-cyan bg-neon-cyan/10 shadow-[0_0_40px_rgba(0,243,255,0.2)]"
                                    : "border-white/10 hover:border-white/20 bg-obsidian/50",
                                isParsing && "pointer-events-none opacity-50"
                            )}
                        >
                            <input {...getInputProps()} />
                            {isParsing ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-10 h-10 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                                    <p className="text-neon-cyan text-sm font-semibold animate-pulse">Extracting PDF Text...</p>
                                </div>
                            ) : (
                                <>
                                    <Upload className={cn("w-10 h-10 mb-4 transition-colors", isDragActive ? "text-neon-cyan glow-icon" : "text-white/20")} />
                                    <p className="text-white/50 text-sm font-medium mb-1">
                                        {isDragActive ? "Drop your PDF here..." : "Drag & Drop PDF or Click to Upload"}
                                    </p>
                                    <p className="text-white/20 text-xs">or paste text below</p>
                                </>
                            )}
                        </div>
                    ) : null}

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={text ? "" : "...or paste your legal document here"}
                        className={cn(
                            "w-full bg-obsidian/50 border border-white/5 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-neon-cyan/50 transition-colors resize-none relative z-10",
                            text ? "h-64" : "h-20"
                        )}
                        disabled={isScanning}
                    />

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm relative z-10">
                            {error}
                        </div>
                    )}

                    <motion.button
                        onClick={handleScan}
                        disabled={isScanning || !text.trim()}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className="pill-btn w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed group relative z-10"
                    >
                        <ScanLine className="w-5 h-5 text-neon-cyan group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-white">{isScanning ? "Analyzing..." : "Initiate Risk Audit"}</span>
                    </motion.button>

                    {/* Liquid Progress Bar */}
                    <AnimatePresence>
                        {isScanning && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 pointer-events-none bg-obsidian/80 backdrop-blur-sm flex items-center justify-center"
                            >
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-neon-cyan/20 to-transparent">
                                    <motion.div
                                        className="w-full bg-neon-cyan/40 shadow-[0_0_30px_rgba(0,243,255,0.8)]"
                                        initial={{ height: "0%" }}
                                        animate={{ height: ["0%", "40%", "80%", "100%"] }}
                                        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                                    />
                                </div>
                                <div className="z-10 text-neon-cyan text-glow-cyan font-bold tracking-widest uppercase animate-pulse">
                                    LEXIS Neural Architecture Processing
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Results Zone */}
                <AnimatePresence>
                    {results && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 flex flex-col gap-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-px bg-white/10 flex-1" />
                                <h3 className="text-sm uppercase tracking-widest text-white/40 font-bold">Audit Results</h3>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>

                            {/* Bento Grid Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* The Verdict Card */}
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className="col-span-1 md:col-span-2 glass-cyan p-8 flex flex-col items-center text-center relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                            results.verdict.status === "Yes" ? "bg-green-500/10 border-green-500/20 text-green-400" :
                                                results.verdict.status === "No" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                                    "bg-amber-500/10 border-amber-500/20 text-warm-amber"
                                        )}>
                                            Status: {results.verdict.status}
                                        </div>
                                    </div>

                                    <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                            <motion.circle
                                                cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent"
                                                strokeDasharray={276}
                                                initial={{ strokeDashoffset: 276 }}
                                                animate={{ strokeDashoffset: 276 - (276 * results.verdict.score) / 100 }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className={cn(
                                                    results.verdict.score > 70 ? "text-green-500" :
                                                        results.verdict.score > 40 ? "text-warm-amber" : "text-red-500"
                                                )}
                                            />
                                        </svg>
                                        <span className="absolute text-2xl font-bold text-white">{results.verdict.score}</span>
                                    </div>

                                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: 'var(--font-bricolage)' }}>
                                        {results.verdict.headline}
                                    </h2>
                                    <p className="text-white/50 text-sm max-w-md">
                                        Our Lexis Engine assigned a safety score of {results.verdict.score}/100 based on its risk modeling.
                                    </p>
                                </motion.div>

                                {/* Quick Summary Card */}
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className="glass p-6 flex flex-col gap-4"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-neon-cyan" />
                                        <h4 className="font-bold text-white text-sm uppercase tracking-wider">Quick Summary</h4>
                                    </div>
                                    <ul className="flex flex-col gap-3">
                                        {results.summary.map((item, i) => (
                                            <li key={i} className="flex gap-3 text-white/70 text-sm leading-relaxed">
                                                <span className="text-neon-cyan shrink-0">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>

                                {/* Risk Mapping Grid */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4 text-warm-amber" />
                                        <h4 className="font-bold text-white text-sm uppercase tracking-wider">Risk Analysis</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {results.risks.map((risk, idx) => {
                                            const IconComponent = IconMap[risk.icon] || IconMap.Default;
                                            return (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="p-4 glass-cyan border-white/5 flex gap-4 transition-all hover:bg-white/5 group"
                                                >
                                                    <div className="shrink-0 pt-0.5">
                                                        <IconComponent className="w-4 h-4 text-neon-cyan" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h5 className="font-bold text-white text-sm tracking-tight">{risk.title}</h5>
                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => handleShare(risk)} className="p-1 hover:text-neon-cyan transition-colors">
                                                                    <Share2 className="w-3 h-3" />
                                                                </button>
                                                                {!negotiationEmail[idx] && (
                                                                    <button onClick={() => handleNegotiate(idx, risk)} className="p-1 hover:text-neon-cyan transition-colors">
                                                                        <PenTool className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-white/50 text-xs leading-relaxed">{risk.explanation}</p>
                                                        {negotiationEmail[idx] && (
                                                            <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10 text-[10px] text-white/50 italic">
                                                                {negotiationEmail[idx]}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Sticky Bottom Bar */}
            <AnimatePresence>
                {results && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 right-0 p-6 z-40 md:relative md:p-0 md:mt-12"
                    >
                        <div className="max-w-4xl mx-auto glass p-4 flex gap-4 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 py-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center gap-3 group transition-all hover:bg-green-500/20"
                                onClick={() => { sensorySuccess(); sensoryClick(); }}
                            >
                                <ThumbsUp className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-green-400">Looks Good</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 py-4 glass-cyan border-cyan-500/20 rounded-2xl flex items-center justify-center gap-3 group transition-all hover:bg-neon-cyan/10"
                                onClick={handleShowCounterOffer}
                            >
                                <PenTool className="w-5 h-5 text-neon-cyan group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-neon-cyan">Generate Counter-Offer</span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Counter-Offer Modal (WhatsApp/Share) */}
            <AnimatePresence>
                {showCounterModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
                        onClick={() => setShowCounterModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass p-8 max-w-lg w-full relative flex flex-col gap-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => { setShowCounterModal(false); sensoryClick(); }}
                                className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 glass-cyan rounded-full flex items-center justify-center">
                                    <PenTool className="w-6 h-6 text-neon-cyan" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Counter-Offer</h2>
                            </div>

                            <p className="text-white/50 text-sm">
                                Copy this message to share with the other party via WhatsApp, Telegram, or Email.
                            </p>

                            <div className="bg-obsidian/50 border border-white/10 rounded-2xl p-6 text-white text-sm leading-relaxed max-h-[300px] overflow-y-auto font-mono">
                                {counterOfferText}
                            </div>

                            <div className="flex gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        navigator.clipboard.writeText(counterOfferText);
                                        sensorySuccess();
                                        alert("Copied to clipboard!");
                                    }}
                                    className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-bold text-white hover:bg-white/10 transition-all"
                                >
                                    <Copy className="w-5 h-5" />
                                    Copy Message
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        const url = `https://wa.me/?text=${encodeURIComponent(counterOfferText)}`;
                                        window.open(url, '_blank');
                                        sensoryClick();
                                    }}
                                    className="px-6 py-4 glass-cyan border-cyan-500/20 rounded-2xl flex items-center justify-center gap-3 font-bold text-neon-cyan"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    WhatsApp
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Daily Quota Modal */}
            <AnimatePresence>
                {showQuotaModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
                        onClick={() => setShowQuotaModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass p-8 max-w-md w-full text-center flex flex-col items-center gap-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-16 h-16 glass-amber rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-warm-amber glow-icon" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Daily Quota Reached</h2>
                            <p className="text-white/50 text-sm leading-relaxed">
                                You've used all <span className="text-warm-amber font-bold">10</span> daily scans allocated by the LEXIS Neural Architecture. Your quota will reset at midnight.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setShowQuotaModal(false); sensoryClick(); }}
                                className="pill-btn px-8 py-3 text-white font-semibold"
                            >
                                Understood
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
