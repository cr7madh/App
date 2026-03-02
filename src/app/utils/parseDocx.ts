import mammoth from "mammoth";

/**
 * Extracts raw text from a DOCX file using Mammoth.js.
 * This runs client-side by reading the file as an ArrayBuffer.
 */
export async function parseDocxClientSide(file: File): Promise<{ text: string }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            if (!arrayBuffer) {
                return reject(new Error("Failed to read file as ArrayBuffer"));
            }

            try {
                // Mammoth extracts raw text from the document
                const result = await mammoth.extractRawText({ arrayBuffer });
                resolve({ 
                    text: result.value || "" 
                });
            } catch (error) {
                console.error("Mammoth extraction error:", error);
                reject(new Error("Mammoth failed to parse DOCX. The file might be corrupted."));
            }
        };

        reader.onerror = () => {
            reject(new Error("FileReader error occurred while reading DOCX."));
        };

        reader.readAsArrayBuffer(file);
    });
}
