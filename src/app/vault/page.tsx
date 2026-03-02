"use client";

import { motion } from "framer-motion";
import {
    FileText,
    ShieldAlert,
    ShieldCheck,
    ArrowUpRight,
    Plus,
    BarChart3,
    Clock
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { useFocus } from "../FocusContext";
import { sensoryClick, sensoryNav } from "../utils/sensory";
import { useState, useEffect } from "react";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
    },
};

export default function VaultDashboard() {
    const { scanHistory } = useFocus();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // Calculate Total Risk Exposure from live history
    const totalRiskMax = scanHistory.length > 0 ? scanHistory.length * 10 : 1;
    const currentRisk = scanHistory.reduce((acc, curr) => acc + curr.riskScore, 0);
    const riskPercentage = scanHistory.length > 0 ? Math.round((currentRisk / totalRiskMax) * 100) : 0;

    if (!mounted) return null;

    return (
        <main className="min-h-screen p-6 md:p-12 lg:p-20 flex flex-col items-center justify-start relative pt-12 pb-32">
            {/* Background Decorative Element */}
            <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/5 rounded-full blur-[150px] pointer-events-none" />

            <header className="w-full max-w-6xl mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                        The <span className="text-neon-cyan text-glow-cyan">Vault</span>
                    </h1>
                    <p className="text-white/50 text-lg max-w-md">
                        Your personal digital legal guardian. Visualizing risk in the fine print.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-white/40 uppercase tracking-widest">Documents</p>
                        <p className="text-2xl font-bold">{scanHistory.length}</p>
                    </div>
                    <Link href="/scan" onClick={() => sensoryNav()}>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="pill-btn flex items-center gap-2 group">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                            <span className="font-semibold text-white">New Scan</span>
                        </motion.div>
                    </Link>
                </div>
            </header>

            {/* Vitals: Total Risk Exposure */}
            <div className="w-full max-w-6xl mb-12 relative z-10">
                <div className="flex justify-between items-end mb-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Total Risk Exposure</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">{riskPercentage}</span>
                        <span className="text-sm font-bold text-white/40">%</span>
                    </div>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${riskPercentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn(
                            "h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]",
                            riskPercentage > 70 ? "bg-red-500 shadow-red-500/50" :
                                riskPercentage > 40 ? "bg-amber-500 shadow-amber-500/50" :
                                    "bg-cyan-500 shadow-cyan-500/50"
                        )}
                    />
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-10"
            >
                {/* Hologram Zone (Large Bento Box Item) */}
                <Link href="/scan" onClick={() => sensoryNav()} className="lg:col-span-2 lg:row-span-2">
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-full glass flex flex-col items-center justify-center p-12 text-center group cursor-pointer relative overflow-hidden transition-colors hover:border-white/20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="w-32 h-32 mb-8 relative">
                            <div className="absolute inset-0 bg-neon-cyan/20 rounded-full animate-ping" />
                            <div className="relative w-full h-full glass-cyan flex items-center justify-center rounded-full">
                                <ShieldAlert className="w-12 h-12 text-neon-cyan glow-icon animate-pulse" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold mb-4 group-hover:text-neon-cyan transition-colors">Start Risk Audit</h2>
                        <p className="text-white/40 max-w-xs mb-8">
                            Drop a PDF or paste legalese to see your <span className="text-white underline decoration-neon-cyan underline-offset-4">Risk Map</span> instantly.
                        </p>

                        <div className="pill-btn text-white font-medium text-sm flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Initialize Scan
                        </div>
                    </motion.div>
                </Link>

                {/* Live History Cards */}
                {scanHistory.length > 0 ? (
                    scanHistory.slice(0, 4).map((item) => {
                        const isHighRisk = item.riskScore >= 7.0;
                        const isMedRisk = item.riskScore >= 4.0 && item.riskScore < 7.0;

                        return (
                            <motion.div
                                key={item.id}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "p-6 flex flex-col justify-between group cursor-default min-h-[250px] transition-all duration-500",
                                    isHighRisk ? "glass-crimson text-crimson-risk" :
                                        isMedRisk ? "glass-amber text-warm-amber" :
                                            "glass-cyan text-neon-cyan"
                                )}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <motion.div whileHover={{ scale: 1.1 }} className="p-2 glass bg-white/5 rounded-xl">
                                                <FileText className="w-6 h-6" />
                                            </motion.div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg tracking-tight">
                                                    {item.appName.length > 20 ? item.appName.slice(0, 20) + "..." : item.appName}
                                                </h3>
                                                <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest opacity-50">
                                                    <Clock className="w-3 h-3" />
                                                    {item.date}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <span className="text-2xl font-bold">{item.riskScore}</span>
                                            <span className="text-xs opacity-40 italic">/10</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-white/60 leading-relaxed font-light mb-6">
                                        {item.riskCount} high-risk clause{item.riskCount !== 1 ? "s" : ""} detected by LEXIS Neural Architecture.
                                    </p>
                                </div>

                                <div className="mt-auto flex items-center justify-between">
                                    {isHighRisk ? (
                                        <Link href="/scan" onClick={() => sensoryNav()}>
                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="pill-btn py-2 px-4 text-xs font-semibold text-white flex items-center gap-2">
                                                <ArrowUpRight className="w-3 h-3" />
                                                Negotiate Term
                                            </motion.div>
                                        </Link>
                                    ) : (
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="w-6 h-6 rounded-full glass border-2 border-obsidian flex items-center justify-center bg-white/5">
                                                    <ShieldCheck className="w-3 h-3 text-white/50" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <span className="text-[10px] uppercase font-bold text-white/30">Analyzed Securely</span>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    // Empty state cards
                    <>
                        {[1, 2].map((i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                className="glass p-6 min-h-[250px] flex flex-col items-center justify-center text-center border-dashed border-white/5"
                            >
                                <BarChart3 className="w-8 h-8 text-white/10 mb-4" />
                                <p className="text-white/20 text-sm font-medium">No scans yet</p>
                                <p className="text-white/10 text-xs mt-1">Run your first audit to populate the Vault</p>
                            </motion.div>
                        ))}
                    </>
                )}

                {/* Status Card */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="glass p-6 border-white/5 flex flex-col justify-center min-h-[120px]"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-xs font-bold uppercase tracking-widest text-white/40">Engine Status</p>
                    </div>
                    <p className="text-lg font-bold text-white">LEXIS Neural Architecture <span className="text-white/20 ml-1 font-normal">Active</span></p>
                </motion.div>
            </motion.div>
        </main>
    );
}
