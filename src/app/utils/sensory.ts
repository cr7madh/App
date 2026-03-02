// Sensory Engine: Web Audio API + Capacitor Haptics
// Fixed for SSR and Next.js compatibility

let audioCtx: AudioContext | null = null;
let isNative = false;

// Detect if running inside Capacitor native shell safely
if (typeof window !== "undefined") {
    isNative = (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.() || false;
}

function getAudioContext(): AudioContext {
    if (!audioCtx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new AudioCtx();
    }
    return audioCtx;
}

/** Subtle mechanical click */
export function playClick() {
    if (typeof window === "undefined") return;
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
    } catch (e) { }
}

/** Digital blip for navigation */
export function playNav() {
    if (typeof window === "undefined") return;
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) { }
}

/** Shimmer - scan success */
export function playShimmer() {
    if (typeof window === "undefined") return;
    try {
        const ctx = getAudioContext();
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(400, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.3);
        gain1.gain.setValueAtTime(0.06, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.4);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1200, ctx.currentTime + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.35);
        gain2.gain.setValueAtTime(0.03, ctx.currentTime + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.05);
        osc2.stop(ctx.currentTime + 0.45);
    } catch (e) { }
}

/** Alert sound for red flags */
export function playAlert() {
    if (typeof window === "undefined") return;
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(250, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(300, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
    } catch (e) { }
}

// ── Haptics (Capacitor Native → Web Fallback) ──

/** Single tap for standard button clicks */
export async function vibrateClick() {
    if (typeof window === "undefined") return;
    try {
        if (isNative) {
            const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
            await Haptics.impact({ style: ImpactStyle.Light });
        } else {
            navigator?.vibrate?.([15]);
        }
    } catch (e) { }
}

/** Double-pulse for red flags */
export async function vibrateAlert() {
    if (typeof window === "undefined") return;
    try {
        if (isNative) {
            const { Haptics, NotificationType } = await import("@capacitor/haptics");
            await Haptics.notification({ type: NotificationType.Warning });
        } else {
            navigator?.vibrate?.([30, 50, 30]);
        }
    } catch (e) { }
}

// ── Combined Helpers ──

export function sensoryClick() {
    playClick();
    vibrateClick();
}

export function sensoryNav() {
    playNav();
    vibrateClick();
}

export function sensorySuccess() {
    playShimmer();
    vibrateClick();
}

export function sensoryRedFlag() {
    playAlert();
    vibrateAlert();
}
