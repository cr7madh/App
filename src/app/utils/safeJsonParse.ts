/**
 * Strips any non-JSON wrapping (markdown backticks, code fences, etc.)
 * and safely parses the result as JSON.
 */
export function safeJsonParse<T = unknown>(raw: string): T {
    // Strip markdown code fences: ```json ... ``` or ``` ... ```
    let cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    // Strip any leading/trailing non-JSON characters
    const firstBracket = cleaned.search(/[\[{]/);
    const lastBracket = Math.max(cleaned.lastIndexOf("]"), cleaned.lastIndexOf("}"));

    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket >= firstBracket) {
        cleaned = cleaned.slice(firstBracket, lastBracket + 1);
    }

    return JSON.parse(cleaned);
}
