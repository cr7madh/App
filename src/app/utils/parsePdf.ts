// Client-side PDF text extraction using pdfjs-dist
// Fixed for Next.js compatibility

/**
 * Extracts all text content from a PDF File object.
 * Runs entirely client-side.
 */
export async function parsePdfClientSide(file: File): Promise<{
    text: string;
    pages: number;
    fileName: string;
}> {
    // Dynamic import to avoid SSR and build-time issues with pdfjs-dist
    const pdfjsLib = await import("pdfjs-dist");

    // Configure worker via CDN to avoid bundling complexities in Next.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    // Fallback to FileReader if arrayBuffer is not available natively in Capacitor WebViews
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
                resolve(reader.result);
            } else {
                reject(new Error("FileReader did not return an ArrayBuffer"));
            }
        };
        reader.onerror = () => reject(new Error("FileReader failed to read document"));
        reader.readAsArrayBuffer(file);
    });

    const typedArray = new Uint8Array(arrayBuffer);

    const loadingTask = pdfjsLib.getDocument({
        data: typedArray,
        useSystemFonts: true,
        disableFontFace: true, // Speeds up text-only extraction
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const textParts: string[] = [];

    for (let i = 1; i <= numPages; i++) {
        try {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
                .map((item: unknown) => (item as { str: string }).str)
                .join(" ");
            textParts.push(pageText);
        } catch (pageErr) {
            console.warn(`Error parsing page ${i}:`, pageErr);
            textParts.push(`[Error parsing page ${i}]`);
        }
    }

    return {
        text: textParts.join("\n\n"),
        pages: numPages,
        fileName: file.name,
    };
}
