"use client";

import Link from "next/link";
import { Shield, ScanLine, User } from "lucide-react";
import { sensoryClick } from "../utils/sensory";

export default function BottomNav() {
    return (
        <div className="fixed left-1/2 -translate-x-1/2 z-50" style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0.75rem))" }}>
            <nav className="flex items-center gap-1 p-1.5 rounded-full glass bg-obsidian/60 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <Link href="/vault" onClick={() => sensoryClick()} className="flex flex-col items-center justify-center w-16 h-14 rounded-full active:bg-white/20 transition-colors text-white/70 active:text-white touch-manipulation">
                    <Shield className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium tracking-wide">Vault</span>
                </Link>
                <div className="w-px h-8 bg-white/10" />
                <Link href="/scan" onClick={() => sensoryClick()} className="flex flex-col items-center justify-center w-16 h-14 rounded-full active:bg-white/20 transition-colors text-neon-cyan glow-icon touch-manipulation">
                    <ScanLine className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium tracking-wide">Scan</span>
                </Link>
                <div className="w-px h-8 bg-white/10" />
                <Link href="/identity" onClick={() => sensoryClick()} className="flex flex-col items-center justify-center w-16 h-14 rounded-full active:bg-white/20 transition-colors text-white/70 active:text-white touch-manipulation">
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium tracking-wide">Identity</span>
                </Link>
            </nav>
        </div>
    );
}
