import Groq from "groq-sdk";
import { safeJsonParse } from "./safeJsonParse";

// Client-side AI Engine for LEXIS CORE
// Handles all interactions with the Groq SDK directly in the browser.

const getGroqClient = () => {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("LEXIS Neural Architecture key is not configured (NEXT_PUBLIC_GROQ_API_KEY missing)");
    }
    return new Groq({
        apiKey,
        dangerouslyAllowBrowser: true // Essential for client-side usage in Android/PWA
    });
};

export interface Verdict {
    score: number;
    status: "Yes" | "No" | "Maybe";
    headline: string;
}

export interface Risk {
    title: string;
    explanation: string;
    icon: "Trap" | "Hidden Fee" | "Exit Plan" | "Alert" | "Privacy";
}

export interface ScanResult {
    verdict: Verdict;
    summary: string[];
    risks: Risk[];
}

/**
 * analyzes a legal document and returns a user-friendly Bento-ready structure.
 */
export async function analyzeLegalDocument(text: string): Promise<ScanResult> {
    const groq = getGroqClient();

    const prompt = `You are a helpful friend who is also a genius lawyer. Explain risks like I am 15 years old. Use humor and clear warnings. Instead of legal terms, use terms like 'Trap', 'Hidden Fee', or 'Exit Plan'.
    
    Analyze this legal document and return a JSON object with:
    1. "verdict": { "score": 0-100, "status": "Yes/No/Maybe", "headline": "A 3-word punchy recommendation" }
    2. "summary": [A 3-4 bullet point summary of the main points in plain English]
    3. "risks": [Exactly 5 objects with "title" (3 words max), "explanation" (1 simple sentence), and "icon" (one of: "Trap", "Hidden Fee", "Exit Plan", "Alert", "Privacy")]
    
    DOCUMENT TEXT:
    ${text.substring(0, 15000)}`;

    const completion = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a friendly genius lawyer. You MUST respond with valid JSON only. No markdown, no conversational filler."
            },
            { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "";

    try {
        const parsed = safeJsonParse<ScanResult>(responseText);
        return parsed;
    } catch (error: unknown) {
        console.error("AI Parse Error:", error, "Raw Response:", responseText);
        throw new Error("The LEXIS Engine returned an unreadable response. Please reconstruct the scan.");
    }
}

/**
 * Drafts a negotiation email for a specific risk.
 */
export async function draftNegotiationEmail(headline: string, summary: string): Promise<string> {
    const groq = getGroqClient();

    const prompt = `Write a short, professional, firm negotiation email to a provider asking them to remove or amend the following legal clause/risk from their contract:
    Headline: ${headline}
    Details: ${summary}
    
    Respond with a JSON object containing a single key "email" with the email body as the value. Keep the email under 4 sentences. Be highly polite but legally firm.`;

    const completion = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a legal negotiation assistant. You MUST respond with valid JSON only. Format: {\"email\": \"...email body...\"}"
            },
            { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "";

    try {
        const parsed = safeJsonParse<{ email?: string }>(responseText);
        return parsed.email || responseText.trim();
    } catch {
        return responseText.trim();
    }
}
